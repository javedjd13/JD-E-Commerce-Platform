import type { Request, Response } from 'express';
import prisma from '../../lib/prisma';

const AppError = require('../../utils/AppError');

function serializeProduct(product: any) {
  const { publicId, ...rest } = product;

  return {
    ...rest,
    id: publicId,
    price: Number(product.price),
    rating: Number(product.rating)
  };
}

function readProductPublicId(value: unknown) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError('Product id must be a positive integer', 400, 'INVALID_PRODUCT_ID');
  }
  return id;
}

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

  res.json({
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
  const product = await prisma.product.findUnique({ where: { publicId: readProductPublicId(req.params.id) } });
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  res.json({ product: serializeProduct(product) });
}
