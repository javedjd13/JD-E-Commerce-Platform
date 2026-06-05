import { Baby, Beef, BookOpen, Car, Dumbbell, Gamepad2, Gift, Headphones, Laptop, Shirt, ShoppingBasket, Smartphone, Sofa, Watch } from 'lucide-react';

const categories = [
  { label: 'Fashion', icon: Shirt },
  { label: 'Mobiles', icon: Smartphone },
  { label: 'Electronics', icon: Laptop },
  { label: 'Grocery', icon: ShoppingBasket },
  { label: 'Watches', icon: Watch },
  { label: 'Home', icon: Sofa },
  { label: 'Beauty', icon: Baby },
  { label: 'Food', icon: Beef },
  { label: 'Audio', icon: Headphones },
  { label: 'Gaming', icon: Gamepad2 },
  { label: 'Sports', icon: Dumbbell },
  { label: 'Books', icon: BookOpen },
  { label: 'Toys', icon: Gift },
  { label: 'Auto', icon: Car }
];

export function CategoryNav() {
  return (
    <nav className="border-b bg-card text-card-foreground">
      <div className="scrollbar-none mx-auto flex max-w-7xl justify-between gap-2 overflow-x-auto px-4 py-3">
        {categories.map(({ label, icon: Icon }) => (
          <a
            href={`/products?category=${encodeURIComponent(label)}`}
            className="flex min-w-[84px] flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
