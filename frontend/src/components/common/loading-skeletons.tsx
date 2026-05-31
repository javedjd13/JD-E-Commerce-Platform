import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <article className="min-w-[184px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="space-y-3 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </article>
  );
}

export function ProductRailSkeleton({ title = 'Loading products' }: { title?: string }) {
  return (
    <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-4 overflow-hidden pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <Skeleton className="h-12 w-full rounded-none" />
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5">
        <Skeleton className="h-52 w-full rounded-3xl" />
        <ProductRailSkeleton title="Suggested for You" />
        <ProductRailSkeleton title="Trending" />
        <ProductRailSkeleton title="Best Deals" />
      </div>
    </>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <Skeleton className="h-6 w-20" />
        <div className="mt-5 space-y-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </aside>
      <section className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-3 h-8 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProductDetailPageSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="grid gap-3 md:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-2 overflow-hidden md:order-1 md:block md:space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="h-20 w-20 shrink-0 rounded-xl" key={index} />
            ))}
          </div>
          <div className="order-1 grid gap-3 sm:grid-cols-2 md:order-2">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="hidden grid-rows-2 gap-3 sm:grid">
              <Skeleton className="rounded-2xl" />
              <Skeleton className="rounded-2xl" />
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-4/5" />
            <Skeleton className="mt-3 h-6 w-40" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="mt-5 h-10 w-56" />
          </div>
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </section>
      </div>
    </main>
  );
}

export function CartPageSkeleton({ titleWidth = 'w-28' }: { titleWidth?: string }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <Skeleton className={`h-8 ${titleWidth}`} />
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-[120px_1fr_auto]" key={index}>
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-36 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </section>
      <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="mt-5 h-12 w-full rounded-xl" />
      </aside>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-4 py-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Skeleton className="h-8 w-36" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl sm:col-span-2" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <Skeleton className="mt-6 h-12 w-44 rounded-xl" />
      </section>
      <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-6 w-full" />
        </div>
      </aside>
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <Skeleton className="h-8 w-28" />
      {Array.from({ length: 3 }).map((_, index) => (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200" key={index}>
          <div className="flex justify-between gap-3 border-b pb-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, itemIndex) => (
              <div className="flex items-center gap-3" key={itemIndex}>
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-3 h-9 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-12 w-24 rounded-xl" />
          <Skeleton className="h-12 w-20 rounded-xl" />
        </div>
      </section>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <article className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr_auto]" key={index}>
            <Skeleton className="aspect-[16/10] rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function EventDetailSkeleton() {
  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <Skeleton className="h-4 w-32 bg-slate-800" />
            <Skeleton className="h-12 w-4/5 bg-slate-800" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-6 bg-slate-800" />
              <Skeleton className="h-6 bg-slate-800" />
            </div>
          </div>
          <Skeleton className="aspect-[16/11] rounded-2xl bg-slate-800" />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <Skeleton className="h-8 w-48" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </article>
        <aside className="rounded-2xl bg-white p-5 shadow-sm">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-4 h-24 rounded-xl" />
          <Skeleton className="mt-4 h-11 rounded-xl" />
        </aside>
      </section>
    </div>
  );
}
