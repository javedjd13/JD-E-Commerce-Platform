import type { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { ok } from '../../utils/http';
import { readPositiveInt } from '../../utils/ids';
import { serializeProduct } from './product.serializer';

const AppError = require('../../utils/AppError');

export async function listProducts(req: Request, res: Response) {
  const { search, category, minPrice, maxPrice, rating } = req.query;

  const where: any = {
    NOT: { tags: { has: 'archived' } }
  };
  if (category) where.category = String(category);
  if (rating) where.rating = { gte: Number(rating) };
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {})
    };
  }
  if (search) {
    where.OR = [
      { title: { contains: String(search), mode: 'insensitive' } },
      { description: { contains: String(search), mode: 'insensitive' } }
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
    take: 60
  });

  return ok(res, {
    products: products.map(serializeProduct),
    filters: {
      categories: await prisma.product.findMany({
        distinct: ['category'],
        select: { category: true },
        orderBy: { category: 'asc' }
      })
    }
  });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { publicId: readPositiveInt(req.params.id, 'Product', 'INVALID_PRODUCT_ID') }
  });
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  return ok(res, { product: serializeProduct(product) });
}
