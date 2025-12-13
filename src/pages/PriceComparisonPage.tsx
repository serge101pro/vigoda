import { ArrowLeft, Check, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StoreComparison {
  id: string;
  name: string;
  logo: string;
  total: number;
  overpay: number;
  isBest: boolean;
  items: {
    name: string;
    quantity: number;
    price: number;
    diff: number;
    isBest: boolean;
  }[];
}

const mockComparison: StoreComparison[] = [
  {
    id: '1',
    name: 'Пятёрочка',
    logo: '🏪',
    total: 1480,
    overpay: 45,
    isBest: false,
    items: [
      { name: 'Молоко "Простоквашино" 3.2% 1л', quantity: 3, price: 325, diff: 0, isBest: true },
      { name: 'Хлеб белый 400г', quantity: 2, price: 90, diff: 13, isBest: false },
      { name: 'Яйца С1 10шт', quantity: 2, price: 210, diff: 18, isBest: false },
      { name: 'Куриная грудка', quantity: 1, price: 325, diff: 50, isBest: false },
      { name: 'Картофель', quantity: 3, price: 156, diff: 17, isBest: false },
      { name: 'Морковь', quantity: 2, price: 90, diff: 17, isBest: false },
      { name: 'Помидоры', quantity: 1, price: 165, diff: 20, isBest: false },
      { name: 'Масло сливочное 180г', quantity: 1, price: 189, diff: 0, isBest: true },
    ]
  },
  {
    id: '2',
    name: 'Магнит',
    logo: '🛒',
    total: 1435,
    overpay: 0,
    isBest: true,
    items: [
      { name: 'Молоко "Простоквашино" 3.2% 1л', quantity: 3, price: 294, diff: -13, isBest: false },
      { name: 'Хлеб белый 400г', quantity: 2, price: 64, diff: 0, isBest: true },
      { name: 'Яйца С1 10шт', quantity: 2, price: 178, diff: 0, isBest: true },
      { name: 'Куриная грудка', quantity: 1, price: 345, diff: 70, isBest: false },
      { name: 'Картофель', quantity: 3, price: 105, diff: 0, isBest: true },
      { name: 'Морковь', quantity: 2, price: 56, diff: 0, isBest: true },
      { name: 'Помидоры', quantity: 1, price: 178, diff: 33, isBest: false },
      { name: 'Масло сливочное 180г', quantity: 1, price: 215, diff: 26, isBest: false },
    ]
  },
  {
    id: '3',
    name: 'Перекрёсток',
    logo: '🛍️',
    total: 1548,
    overpay: 113,
    isBest: false,
    items: [
      { name: 'Молоко "Простоквашино" 3.2% 1л', quantity: 3, price: 306, diff: 17, isBest: false },
      { name: 'Хлеб белый 400г', quantity: 2, price: 96, diff: 16, isBest: false },
      { name: 'Яйца С1 10шт', quantity: 2, price: 224, diff: 23, isBest: false },
      { name: 'Куриная грудка', quantity: 1, price: 275, diff: 0, isBest: true },
      { name: 'Картофель', quantity: 3, price: 174, diff: 23, isBest: false },
      { name: 'Морковь', quantity: 2, price: 96, diff: 20, isBest: false },
      { name: 'Помидоры', quantity: 1, price: 172, diff: 27, isBest: false },
      { name: 'Масло сливочное 180г', quantity: 1, price: 205, diff: 16, isBest: false },
    ]
  },
  {
    id: '4',
    name: 'ВкусВилл',
    logo: '🥬',
    total: 1781,
    overpay: 346,
    isBest: false,
    items: [
      { name: 'Молоко "Простоквашино" 3.2% 1л', quantity: 3, price: 345, diff: 30, isBest: false },
      { name: 'Хлеб белый 400г', quantity: 2, price: 116, diff: 26, isBest: false },
      { name: 'Яйца С1 10шт', quantity: 2, price: 250, diff: 36, isBest: false },
      { name: 'Куриная грудка', quantity: 1, price: 385, diff: 110, isBest: false },
      { name: 'Картофель', quantity: 3, price: 195, diff: 30, isBest: false },
      { name: 'Морковь', quantity: 2, price: 110, diff: 27, isBest: false },
      { name: 'Помидоры', quantity: 1, price: 145, diff: 0, isBest: true },
      { name: 'Масло сливочное 180г', quantity: 1, price: 235, diff: 46, isBest: false },
    ]
  },
];

export default function PriceComparisonPage() {
  const bestStore = mockComparison.find(s => s.isBest);
  const totalSavings = bestStore ? mockComparison[mockComparison.length - 1].total - bestStore.total : 0;
  const savingsPercent = bestStore ? Math.round((totalSavings / mockComparison[mockComparison.length - 1].total) * 100) : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/cart">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Сравнение цен</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {mockComparison.map(store => (
          <div 
            key={store.id}
            className={`bg-card rounded-2xl border-2 overflow-hidden ${
              store.isBest ? 'border-primary' : 'border-border'
            }`}
          >
            {/* Store Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{store.logo}</span>
                  <span className="font-bold text-lg">{store.name}</span>
                </div>
                <span className="text-xl font-bold">{store.total}₽</span>
              </div>
              {store.isBest ? (
                <Badge className="mt-2 bg-primary text-primary-foreground">
                  <Check className="h-3 w-3 mr-1" />
                  САМЫЙ ВЫГОДНЫЙ
                </Badge>
              ) : (
                <p className="text-sm text-destructive mt-1">
                  Переплата: +{store.overpay}₽
                </p>
              )}
            </div>

            {/* Items */}
            <div className="p-4 space-y-2">
              {store.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    • {item.name} × {item.quantity}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.price}₽</span>
                    {item.isBest ? (
                      <Badge variant="outline" className="text-primary border-primary text-xs">
                        ✓ ЛУЧШАЯ
                      </Badge>
                    ) : item.diff !== 0 && (
                      <Badge variant="outline" className="text-destructive border-destructive text-xs">
                        {item.diff > 0 ? '+' : ''}{item.diff}₽
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Savings Summary */}
        <div className="bg-gradient-to-br from-primary-light to-primary/20 rounded-2xl p-6 text-center">
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            💰 Экономия при умном выборе
          </p>
          <p className="text-4xl font-bold text-primary mt-2">{totalSavings}₽</p>
          <p className="text-primary font-semibold mt-1">
            Это {savingsPercent}% экономии!
          </p>
          {bestStore && (
            <p className="text-sm text-muted-foreground mt-2">
              Если покупать всё в {bestStore.logo} {bestStore.name}
            </p>
          )}
        </div>

        <Button variant="hero" size="lg" className="w-full">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Создать оптимальный список
        </Button>
      </div>
    </div>
  );
}
