import type { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../../lib/prisma';
import { created, ok } from '../../utils/http';
import { readPositiveInt } from '../../utils/ids';
import { productPrice } from '../../utils/money';

const AppError = require('../../utils/AppError');
const Razorpay = require('razorpay');
const env = require('../../config/env');

function serializeOrder(order: any) {
  const primaryAddress = order.user?.addresses?.find((address: any) => address.isDefault) || order.user?.addresses?.[0] || null;
  const itemTotal = order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);
  const listingTotal = order.items.reduce((sum: number, item: any) => sum + Number(item.product.price) * item.quantity, 0);
  const discount = Math.max(0, listingTotal - itemTotal);

  return {
    id: order.publicId,
    status: order.status.toLowerCase(),
    totalAmount: Number(order.totalAmount),
    listingAmount: listingTotal,
    discountAmount: discount,
    paymentMethod: formatPaymentMethod(order.paymentMethod),
    paymentStatus: order.paymentStatus,
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    createdAt: order.createdAt,
    deliveredAt: new Date(new Date(order.createdAt).getTime() + 8 * 24 * 60 * 60 * 1000),
    shippingAddress: primaryAddress ? {
      id: primaryAddress.publicId,
      label: primaryAddress.label,
      fullName: primaryAddress.fullName,
      phone: primaryAddress.phone,
      line1: primaryAddress.line1,
      line2: primaryAddress.line2,
      city: primaryAddress.city,
      state: primaryAddress.state,
      postalCode: primaryAddress.postalCode,
      country: primaryAddress.country,
      isDefault: primaryAddress.isDefault
    } : null,
    customer: order.user ? {
      id: order.user.publicId,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone
    } : null,
    items: order.items.map((item: any) => ({
      id: item.publicId,
      quantity: item.quantity,
      price: Number(item.price),
      listingPrice: Number(item.product.price),
      discount: item.product.discount,
      product: {
        id: item.product.publicId,
        title: item.product.title,
        images: item.product.images,
        category: item.product.category
      }
    }))
  };
}

function formatPaymentMethod(method?: string | null) {
  if (method === 'RAZORPAY') return 'Razorpay';
  return 'Cash On Delivery';
}

function getRazorpayClient() {
  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    throw new AppError('Razorpay credentials are not configured', 500, 'RAZORPAY_NOT_CONFIGURED');
  }

  return new Razorpay({
    key_id: env.razorpay.keyId,
    key_secret: env.razorpay.keySecret
  });
}

function amountToPaise(amount: number) {
  return Math.round(amount * 100);
}

async function getUserCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400, 'EMPTY_CART');
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    return sum + productPrice(item.product.price, item.product.discount) * item.quantity;
  }, 0);

  return { cart, totalAmount };
}

async function createOrderFromCart(userId: string, payment: {
  paymentMethod?: string;
  paymentStatus?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
} = {}) {
  const { cart, totalAmount } = await getUserCart(userId);

  const order = await prisma.$transaction(
    async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          totalAmount,
          ...payment,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productPrice(item.product.price, item.product.discount)
            }))
          }
        },
        include: { user: { include: { addresses: true } }, items: { include: { product: true } } }
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    },
    { maxWait: 10000, timeout: 20000 }
  );

  return order;
}

export async function createOrder(req: Request, res: Response) {
  const order = await createOrderFromCart(req.user!.sub);
  return created(res, { order: serializeOrder(order) });
}

export async function createRazorpayOrder(req: Request, res: Response) {
  const { cart, totalAmount } = await getUserCart(req.user!.sub);
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  const razorpay = getRazorpayClient();
  const amount = amountToPaise(totalAmount);

  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `cart_${cart.publicId}_${Date.now()}`
  });

  return created(res, {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: env.razorpay.keyId,
    customer: {
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.phone || ''
    }
  });
}

export async function verifyRazorpayPayment(req: Request, res: Response) {
  const razorpayOrderId = String(req.body?.razorpay_order_id || '');
  const razorpayPaymentId = String(req.body?.razorpay_payment_id || '');
  const razorpaySignature = String(req.body?.razorpay_signature || '');

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new AppError('Razorpay payment details are required', 400, 'RAZORPAY_DETAILS_REQUIRED');
  }

  const razorpay = getRazorpayClient();
  const existing = await prisma.order.findUnique({
    where: { razorpayPaymentId },
    include: { user: { include: { addresses: true } }, items: { include: { product: true } } }
  });

  if (existing) {
    return ok(res, { order: serializeOrder(existing) });
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new AppError('Payment verification failed', 400, 'RAZORPAY_SIGNATURE_INVALID');
  }

  const { totalAmount } = await getUserCart(req.user!.sub);
  const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
  const expectedAmount = amountToPaise(totalAmount);

  if (Number(razorpayOrder.amount) !== expectedAmount || razorpayOrder.currency !== 'INR') {
    throw new AppError('Payment amount does not match cart total', 400, 'RAZORPAY_AMOUNT_MISMATCH');
  }

  const order = await createOrderFromCart(req.user!.sub, {
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'PAID',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  return created(res, { order: serializeOrder(order) });
}

export async function listOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.sub },
    include: { user: { include: { addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] } } }, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return ok(res, { orders: orders.map(serializeOrder) });
}

export async function getOrder(req: Request, res: Response) {
  const order = await prisma.order.findFirst({
    where: {
      publicId: readPositiveInt(req.params.orderId, 'Order'),
      userId: req.user!.sub
    },
    include: { user: { include: { addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] } } }, items: { include: { product: true } } }
  });

  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  return ok(res, { order: serializeOrder(order) });
}
