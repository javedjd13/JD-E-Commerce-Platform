import type { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { productPrice } from '../../utils/money';

const AppError = require('../../utils/AppError');

function serializeOrder(order: any) {
  return {
    id: order.id,
    status: order.status.toLowerCase(),
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    items: order.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        title: item.product.title,
        images: item.product.images
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
      include: { items: { include: { product: true } } }
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });

  res.status(201).json({ order: serializeOrder(order) });
}

export async function listOrders(req: Request, res: Response) {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.sub },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ orders: orders.map(serializeOrder) });
}
