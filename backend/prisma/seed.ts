import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const legacyDemoTitles = [
  'Men Regular Fit Casual Shirt',
  'Astra X1 5G Smartphone',
  'PulseFit Smart Watch',
  'NovaBook Pro Laptop',
  'StreetRun Sneakers',
  'Fresh Pantry Basket',
  'MetroSlim Linen Shirt',
  'ArcPods Wireless Earbuds',
  'Astra Max 5G Smartphone',
  'CloudStep Running Shoes',
  'WorkMate Laptop 14',
  'Organic Breakfast Pack'
];

const products = [
  {
    title: 'Apple iPhone 16 Pro Max 5G',
    description: 'Titanium flagship phone with pro camera system, bright OLED display, and all-day battery.',
    price: 144900,
    discount: 12,
    category: 'Mobiles',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['banner', 'top-rated', 'featured', 'premium']
  },
  {
    title: 'Apple MacBook Air M3 13-inch',
    description: 'Ultra-thin laptop with M-series performance, long battery life, and Liquid Retina display.',
    price: 114900,
    discount: 18,
    category: 'Laptops',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['banner', 'top-rated', 'featured', 'creator']
  },
  {
    title: 'Samsung Galaxy S26 Ultra 5G',
    description: 'Premium Android flagship experience with high-refresh AMOLED display and pro-grade cameras.',
    price: 129999,
    discount: 16,
    category: 'Mobiles',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['banner', 'top-rated', 'featured', 'new-range']
  },
  {
    title: 'Sony Bravia 55-inch 4K OLED TV',
    description: 'Immersive 4K OLED smart TV with cinematic contrast, vivid color, and powerful sound.',
    price: 149990,
    discount: 34,
    category: 'TVs & Appliances',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'deal', 'home-entertainment']
  },
  {
    title: 'Apple AirPods Pro ANC Earbuds',
    description: 'Wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging case.',
    price: 24900,
    discount: 28,
    category: 'Audio',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'top-rated', 'audio']
  },
  {
    title: 'Samsung Galaxy Watch Ultra LTE',
    description: 'Rugged smartwatch with health tracking, LTE calling, bright display, and long battery life.',
    price: 59999,
    discount: 30,
    category: 'Wearables',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'top-rated', 'wearable']
  },
  {
    title: 'Dell XPS 14 OLED Laptop',
    description: 'Premium Windows laptop with OLED display, slim metal build, and powerful creator performance.',
    price: 159990,
    discount: 22,
    category: 'Laptops',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'creator', 'top-rated']
  },
  {
    title: 'OnePlus Nord Buds Pro',
    description: 'Compact wireless earbuds with deep bass, low latency mode, and fast charging.',
    price: 4999,
    discount: 46,
    category: 'Audio',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['deal', 'suggested', 'audio']
  },
  {
    title: 'Samsung Neo QLED 65-inch Smart TV',
    description: 'Large screen mini-LED TV with 4K clarity, rich contrast, and smooth gaming performance.',
    price: 189990,
    discount: 41,
    category: 'TVs & Appliances',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['deal', 'featured', 'home-entertainment']
  },
  {
    title: 'Google Pixel 9 Pro 5G',
    description: 'AI-first smartphone with polished camera software, smooth Android, and sharp OLED display.',
    price: 109999,
    discount: 20,
    category: 'Mobiles',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['top-rated', 'new-range', 'featured']
  },
  {
    title: 'Lenovo Yoga Slim 7 OLED',
    description: 'Portable OLED laptop for students, creators, and everyday productivity.',
    price: 92990,
    discount: 33,
    category: 'Laptops',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['deal', 'suggested', 'creator']
  },
  {
    title: 'Bose QuietComfort Ultra Headphones',
    description: 'Premium wireless headphones with immersive audio and flagship noise cancellation.',
    price: 35900,
    discount: 24,
    category: 'Audio',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'top-rated', 'audio']
  },
  {
    title: 'LG AI Wash 10kg Front Load Washer',
    description: 'Smart washing machine with AI wash modes, inverter motor, and steam care.',
    price: 58990,
    discount: 36,
    category: 'TVs & Appliances',
    rating: 4.3,
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['deal', 'suggested', 'appliance']
  },
  {
    title: 'iPad Air M2 11-inch Wi-Fi',
    description: 'Powerful tablet for sketching, streaming, gaming, and everyday productivity.',
    price: 59900,
    discount: 15,
    category: 'Tablets',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'top-rated', 'premium']
  },
  {
    title: 'JBL Charge 6 Bluetooth Speaker',
    description: 'Portable waterproof speaker with punchy sound, long battery, and outdoor-ready design.',
    price: 17999,
    discount: 38,
    category: 'Audio',
    rating: 4.4,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['deal', 'audio', 'suggested']
  },
  {
    title: 'Canon EOS R50 Mirrorless Camera',
    description: 'Compact mirrorless camera for travel, vlogging, and crisp 4K content.',
    price: 75995,
    discount: 19,
    category: 'Cameras',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=85'
    ],
    tags: ['featured', 'creator', 'top-rated']
  }
];

async function main() {
  const password = await bcrypt.hash('Password123!', 12);

  await prisma.user.upsert({
    where: { email: 'javed@example.com' },
    update: { name: 'Javed Ansari', password },
    create: {
      name: 'Javed Ansari',
      email: 'javed@example.com',
      password
    }
  });

  await prisma.product.updateMany({
    where: {
      title: { in: legacyDemoTitles }
    },
    data: {
      tags: ['archived'],
      rating: 1
    }
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { title: product.title },
      update: product,
      create: product
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
