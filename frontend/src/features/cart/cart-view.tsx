'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { currency } from '@/lib/api';
import { useCart } from './use-cart';

export function CartView() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const items = cart?.items || [];
  const total = cart?.subtotal ?? items.reduce((sum, item) => sum + item.lineTotal, 0);

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{item.product.title}</p>
                <p className="text-sm text-muted-foreground">{item.product.category}</p>
                <p className="mt-1 font-semibold">{currency(item.unitPrice)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateItem.mutate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(item.productId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="h-fit">
        <CardContent className="space-y-4 p-5">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{currency(total)}</span>
          </div>
          <Button className="w-full">Place order</Button>
        </CardContent>
      </Card>
    </div>
  );
}
