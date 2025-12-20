import { useState } from 'react';
import { ArrowLeft, Trash2, ShoppingBag, Zap, Clock, Scale, MapPin, ChevronRight, Tag, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/useAppStore';
import { ProductCard } from '@/components/products/ProductCard';

const strategies = [
  {
    id: 'savings' as const,
    icon: Zap,
    label: 'Максимальная выгода',
    description: 'Разбивка по магазинам для лучшей цены',
    savings: '30%',
  },
  {
    id: 'time' as const,
    icon: Clock,
    label: 'Экономия времени',
    description: 'Всё в одном магазине',
    savings: '10%',
  },
  {
    id: 'balanced' as const,
    icon: Scale,
    label: 'Оптимальный баланс',
    description: 'Лучшее соотношение цены и удобства',
    savings: '20%',
  },
];

// Types that support store optimization strategies
const STORE_PRODUCT_TYPES = ['product'];

export default function CartPage() {
  const { cart, cartStrategy, setCartStrategy, clearCart, updateQuantity } = useAppStore();
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  // Separate cart items by type
  const storeProducts = cart.filter(item => STORE_PRODUCT_TYPES.includes(item.type));
  const otherItems = cart.filter(item => !STORE_PRODUCT_TYPES.includes(item.type));

  // Calculate store products total (strategies apply)
  const storeProductsSubtotal = storeProducts.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
  );
  const storeProductsOldTotal = storeProducts.reduce(
    (sum, item) => sum + ((item.product?.oldPrice || item.product?.price || 0) * item.quantity), 0
  );
  const storeProductsSavings = storeProductsOldTotal - storeProductsSubtotal;
  
  // Strategy savings only apply to store products
  const strategySavingsPercent = cartStrategy === 'savings' ? 0.3 : cartStrategy === 'time' ? 0.1 : 0.2;
  const strategySavings = Math.round(storeProductsSubtotal * strategySavingsPercent);

  // Calculate other items total (no strategy, but may have discounts)
  const otherItemsSubtotal = otherItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
  );
  const otherItemsOldTotal = otherItems.reduce(
    (sum, item) => sum + ((item.product?.oldPrice || item.product?.price || 0) * item.quantity), 0
  );
  const otherItemsSavings = otherItemsOldTotal - otherItemsSubtotal;

  // Promo code discount (applies to entire cart)
  const promoDiscount = appliedPromo ? Math.round((storeProductsSubtotal + otherItemsSubtotal) * (appliedPromo.discount / 100)) : 0;

  // Total calculations
  const totalSubtotal = storeProductsSubtotal + otherItemsSubtotal;
  const totalSavings = storeProductsSavings + otherItemsSavings;
  const finalTotal = totalSubtotal - strategySavings - promoDiscount;

  const currentStrategy = strategies.find((s) => s.id === cartStrategy)!;

  const handleApplyPromo = () => {
    // Simple promo code validation (mock)
    if (promoCode.toUpperCase() === 'СКИДКА10') {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: 10 });
    } else if (promoCode.toUpperCase() === 'НОВЫЙ20') {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: 20 });
    } else {
      setAppliedPromo(null);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Корзина пуста</h1>
        <p className="text-muted-foreground text-center mb-6">
          Добавьте товары из каталога, чтобы начать экономить
        </p>
        <Link to="/catalog">
          <Button variant="hero" size="lg">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon-sm">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Корзина</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              Очистить
            </Button>
          </div>
        </div>
      </header>

      {/* Strategy Selector */}
      <section className="px-4 pt-4">
        <button
          onClick={() => setShowStrategySelector(!showStrategySelector)}
          className="w-full p-4 bg-primary-light rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <currentStrategy.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">{currentStrategy.label}</p>
              <p className="text-sm text-muted-foreground">{currentStrategy.description}</p>
            </div>
          </div>
          <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${showStrategySelector ? 'rotate-90' : ''}`} />
        </button>

        {showStrategySelector && (
          <div className="mt-2 space-y-2 animate-fade-in">
            {strategies.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => {
                  setCartStrategy(strategy.id);
                  setShowStrategySelector(false);
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                  cartStrategy === strategy.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <strategy.icon className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">{strategy.label}</p>
                    <p className={`text-sm ${cartStrategy === strategy.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {strategy.description}
                    </p>
                  </div>
                </div>
                <span className="font-bold">-{strategy.savings}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Cart Items */}
      <section className="px-4 pt-4 space-y-3">
        {cart.map((item) => item.product && (
          <ProductCard key={item.id} product={item.product} variant="horizontal" />
        ))}
      </section>

      {/* Promo Code */}
      <section className="px-4 pt-4">
        <div className="flex gap-2">
          <Input
            placeholder="Промокод"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={handleApplyPromo}>
            <Tag className="h-4 w-4" />
          </Button>
        </div>
        {appliedPromo && (
          <p className="text-sm text-primary mt-2">Промокод {appliedPromo.code} применён: -{appliedPromo.discount}%</p>
        )}
      </section>

      {/* Summary */}
      <section className="px-4 pt-6 pb-32">
        <div className="bg-muted rounded-2xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Подытог</span>
            <span className="font-semibold">{totalSubtotal} ₽</span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between text-primary">
              <span>Скидки на товары</span>
              <span className="font-semibold">-{totalSavings} ₽</span>
            </div>
          )}
          {storeProducts.length > 0 && (
            <div className="flex justify-between text-accent">
              <span>Экономия ({currentStrategy.label})</span>
              <span className="font-semibold">-{strategySavings} ₽</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Промокод</span>
              <span className="font-semibold">-{promoDiscount} ₽</span>
            </div>
          )}
          <div className="pt-3 border-t border-border flex justify-between">
            <span className="text-lg font-bold">Итого</span>
            <span className="text-lg font-bold">{finalTotal} ₽</span>
          </div>
        </div>
      </section>

      {/* Fixed Bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
        <Button variant="hero" size="xl" className="w-full">
          <MapPin className="h-5 w-5 mr-2" />
          Построить маршрут и купить
        </Button>
      </div>
    </div>
  );
}
