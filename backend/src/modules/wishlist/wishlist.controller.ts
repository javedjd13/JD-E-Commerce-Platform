import type { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { created, ok } from '../../utils/http';
import { readPositiveInt } from '../../utils/ids';
import { serializeProduct } from '../product/product.serializer';

const AppError = require('../../utils/AppError');

function serializeWishlistItem(item: any) {
  return {
    id: item.publicId,
    productId: item.product.publicId,
    createdAt: item.createdAt,
    product: serializeProduct(item.product)
  };
}

function serializeWishlist(items: any[]) {
  return {
    items: items.map(serializeWishlistItem),
    productIds: items.map((item) => item.product.publicId),
    count: items.length
  };
}

async function findProductByPublicId(value: unknown) {
  const product = await prisma.product.findFirst({
    where: {
      publicId: readPositiveInt(value, 'Product', 'INVALID_PRODUCT_ID'),
      NOT: { tags: { has: 'archived' } }
    },
    select: { id: true }
  });

  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  return product;
}

async function getWishlistItems(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getWishlist(req: Request, res: Response) {
  return ok(res, { wishlist: serializeWishlist(await getWishlistItems(req.user!.sub)) });
}

export async function addToWishlist(req: Request, res: Response) {
  const product = await findProductByPublicId(req.params.productId);
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user!.sub, productId: product.id } },
    update: {},
    create: { userId: req.user!.sub, productId: product.id },
    include: { product: true }
  });

  return created(res, {
    item: serializeWishlistItem(item),
    wishlist: serializeWishlist(await getWishlistItems(req.user!.sub))
  });
}

export async function removeFromWishlist(req: Request, res: Response) {
  const product = await findProductByPublicId(req.params.productId);
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.user!.sub, productId: product.id }
  });

  return ok(res, { wishlist: serializeWishlist(await getWishlistItems(req.user!.sub)) });
}
