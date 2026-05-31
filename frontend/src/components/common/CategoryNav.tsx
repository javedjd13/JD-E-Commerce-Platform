import { Baby, Beef, Laptop, Shirt, ShoppingBasket, Smartphone, Sofa, Watch } from 'lucide-react';

const categories = [
  { label: 'Fashion', icon: Shirt },
  { label: 'Mobiles', icon: Smartphone },
  { label: 'Electronics', icon: Laptop },
  { label: 'Grocery', icon: ShoppingBasket },
  { label: 'Watches', icon: Watch },
  { label: 'Home', icon: Sofa },
  { label: 'Beauty', icon: Baby },
  { label: 'Food', icon: Beef }
];

export function CategoryNav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-3">
        {categories.map(({ label, icon: Icon }) => (
          <a
            href={`/products?category=${encodeURIComponent(label)}`}
            className="flex min-w-[92px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            key={label}
          >
            <Icon className="h-5 w-5" />
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
