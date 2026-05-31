import type { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { productPrice } from '../../utils/money';

const AppError = require('../../utils/AppError');

function serializeOrder(order: any) {
  const primaryAddress = order.user?.addresses?.find((address: any) => address.isDefault) || order.user?.addresses?.[0] || null;
  const itemTotal = order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);
  const listingTotal = order.items.reduce((sum: number, item: any) => sum + Number(item.product.price) * item.quantity, 0);
  const discount = Math.max(0, listingTotal - itemTotal);

  return {
    id: order.id,
    status: order.status.toLowerCase(),
    totalAmount: Number(order.totalAmount),
    listingAmount: listingTotal,
    discountAmount: discount,
    paymentMethod: 'Cash On Delivery',
    createdAt: order.createdAt,
    deliveredAt: new Date(new Date(order.createdAt).getTime() + 8 * 24 * 60 * 60 * 1000),
    shippingAddress: primaryAddress ? {
      id: primaryAddress.id,
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
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone
    } : null,
    items: order.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      listingPrice: Number(item.product.price),
      discount: item.product.discount,
      product: {
        id: item.product.id,
        title: item.product.title,
        images: item.product.images,
        category: item.product.category
      }
    }))
  };
}

export async function createOrder(req: Request, res: Response) {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user!.sub },
    include: { items: { include: { product: true } } }
  });
  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400, 'EMPTY_CART');
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    return sum + productPrice(item.product.price, item.product.discount) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: req.user!.sub,
        totalAmount,
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
  });

  res.status(201).json({ order: serializeOrder(order) });
}

export async function listOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.sub },
    include: { user: { include: { addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] } } }, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ orders: orders.map(serializeOrder) });
}

export async function getOrder(req: Request, res: Response) {
  const order = await prisma.order.findFirst({
    where: {
      id: req.params.orderId,
      userId: req.user!.sub
    },
    include: { user: { include: { addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] } } }, items: { include: { product: true } } }
  });

  if (!order) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  res.json({ order: serializeOrder(order) });
}
