import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, TrendingDown, Flame, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FlashDealCard } from '@/components/deals/FlashDealCard';
import { mockProducts } from '@/data/mockData';

// Demo data for daily deals
const dailyDeals = [
  ...mockProducts.filter(p => p.badge === 'sale' || p.badge === 'hot'),
  ...mockProducts.slice(0, 8).map((p, i) => ({
    ...p,
    id: `deal-${p.id}-${i}`,
    oldPrice: Math.round(p.price * 1.3),
    badge: (i % 3 === 0 ? 'sale' : i % 3 === 1 ? 'hot' : undefined) as 'sale' | 'hot' | 'new' | undefined,
  }))
].slice(0, 20);

// Flash deals with timer - using real-time countdown
const flashDeals = [
  {
    id: 'flash-1',
    product: mockProducts[0],
    originalPrice: 299,
    dealPrice: 149,
    discount: 50,
    remaining: 12,
    total: 50,
    endsIn: 7200, // 2 hours
  },
  {
    id: 'flash-2',
    product: mockProducts[2],
    originalPrice: 159,
    dealPrice: 79,
    discount: 50,
    remaining: 8,
    total: 30,
    endsIn: 3600, // 1 hour
  },
  {
    id: 'flash-3',
    product: mockProducts[4],
    originalPrice: 199,
    dealPrice: 99,
    discount: 50,
    remaining: 25,
    total: 100,
    endsIn: 14400, // 4 hours
  },
];

// Category deals
const categoryDeals = [
  { id: 'cat-1', name: 'Молочные продукты', discount: 30, emoji: '🥛', count: 45 },
  { id: 'cat-2', name: 'Мясо и птица', discount: 25, emoji: '🍖', count: 32 },
  { id: 'cat-3', name: 'Овощи и фрукты', discount: 40, emoji: '🥬', count: 67 },
  { id: 'cat-4', name: 'Хлеб и выпечка', discount: 20, emoji: '🍞', count: 23 },
  { id: 'cat-5', name: 'Напитки', discount: 35, emoji: '🧃', count: 41 },
];

export default function DailyDealsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'rating'>('discount');

  const filteredDeals = selectedCategory
    ? dailyDeals.filter(p => p.category === selectedCategory)
    : dailyDeals;

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'discount') {
      const discA = a.oldPrice ? ((a.oldPrice - a.price) / a.oldPrice) * 100 : 0;
      const discB = b.oldPrice ? ((b.oldPrice - b.price) / b.oldPrice) * 100 : 0;
      return discB - discA;
    }
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Скидки дня</h1>
              <p className="text-xs text-muted-foreground">До 50% на популярные товары</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-2">
        <Breadcrumbs />
      </div>

      <div className="space-y-6 pb-8">
        {/* Flash Deals Banner */}
        <section className="px-4 pt-2">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5" />
              <span className="font-bold text-lg">Flash-скидки</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                Ограничено
              </Badge>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {flashDeals.map((deal) => (
                <FlashDealCard
                  key={deal.id}
                  id={deal.id}
                  product={deal.product}
                  originalPrice={deal.originalPrice}
                  dealPrice={deal.dealPrice}
                  discount={deal.discount}
                  remaining={deal.remaining}
                  total={deal.total}
                  endsIn={deal.endsIn}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Category Deals */}
        <section className="px-4">
          <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Скидки по категориям
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categoryDeals.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`shrink-0 rounded-xl p-3 border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl block mb-1">{cat.emoji}</span>
                <p className="text-xs font-medium whitespace-nowrap">{cat.name}</p>
                <p className={`text-xs ${selectedCategory === cat.id ? 'text-primary-foreground/80' : 'text-primary'} font-bold`}>
                  до -{cat.discount}%
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Sorting */}
        <section className="px-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-foreground">
              Все скидки <span className="text-muted-foreground font-normal text-sm">({sortedDeals.length})</span>
            </h2>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'discount' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('discount')}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Скидка
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
              >
                Цена
              </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating')}
              >
                <Star className="h-4 w-4 mr-1" />
                Рейтинг
              </Button>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Tips Banner */}
        <section className="px-4">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl p-4 border border-green-500/20">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              💡 Совет дня
            </h3>
            <p className="text-sm text-muted-foreground">
              Добавьте товары в избранное, чтобы получать уведомления о скидках на них через Telegram!
            </p>
            <Link to="/favorites">
              <Button variant="outline" size="sm" className="mt-3">
                Перейти в избранное
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
