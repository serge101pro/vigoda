import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, ShoppingBag, Zap, Clock, Scale, MapPin, ChevronRight, Tag, Sparkles, Loader2, Package, Utensils, UtensilsCrossed, Leaf, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore, CartItem } from '@/stores/useAppStore';
import { ProductCard } from '@/components/products/ProductCard';
import { AggregatedIngredientsSection } from '@/components/cart/AggregatedIngredientsSection';
import { RecipeRecommendations } from '@/components/cart/RecipeRecommendations';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useCart, CartItemDB } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
const STORE_PRODUCT_TYPES = ['product', 'recipe-ingredients', 'meal-plan-diy'];

// Cart item type labels and icons
const CART_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  'product': { label: 'Продукты', icon: Package, color: 'bg-blue-500/10 text-blue-600' },
  'recipe-ingredients': { label: 'Ингредиенты рецептов', icon: Utensils, color: 'bg-orange-500/10 text-orange-600' },
  'meal-plan': { label: 'Готовые рационы', icon: UtensilsCrossed, color: 'bg-green-500/10 text-green-600' },
  'meal-plan-ingredients': { label: 'Наборы ингредиентов', icon: Package, color: 'bg-yellow-500/10 text-yellow-600' },
  'meal-plan-diy': { label: 'Ингредиенты для рационов', icon: Utensils, color: 'bg-purple-500/10 text-purple-600' },
  'farm-product': { label: 'Фермерские продукты', icon: Leaf, color: 'bg-emerald-500/10 text-emerald-600' },
  'catering': { label: 'Кейтеринг', icon: Users, color: 'bg-pink-500/10 text-pink-600' },
};

// Catering cart item component
function CateringCartItem({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  const includedServices = item.services?.filter(s => s.included) || [];
  
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex gap-3">
        {item.cateringImage && (
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <SafeImage src={item.cateringImage} alt={item.cateringName} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground line-clamp-1">{item.cateringName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {item.guestCount} гостей
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onRemove} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          {includedServices.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Услуги:</span> {includedServices.map(s => s.name).join(', ')}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Итого: {item.totalPrice?.toLocaleString()} ₽</p>
              <p className="text-sm font-semibold text-primary">Предоплата: {item.depositAmount?.toLocaleString()} ₽</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Farm product cart item
function FarmProductCartItem({ item, onRemove, onUpdateQuantity }: { item: CartItem; onRemove: () => void; onUpdateQuantity: (qty: number) => void }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex gap-3">
        {item.product?.image && (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <SafeImage src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.product?.name}</h4>
              <p className="text-xs text-muted-foreground">{item.farmName}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onRemove} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-sm" onClick={() => onUpdateQuantity(item.quantity - 1)}>-</Button>
              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
              <Button variant="outline" size="icon-sm" onClick={() => onUpdateQuantity(item.quantity + 1)}>+</Button>
            </div>
            <p className="font-semibold text-primary">{(item.product?.price || 0) * item.quantity} ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// DB Cart item for optimized display
function DBCartItem({ item, onRemove, onUpdateQuantity }: { 
  item: CartItemDB; 
  onRemove: () => void; 
  onUpdateQuantity: (qty: number) => void;
}) {
  const displayQuantity = item.is_optimized 
    ? `${item.quantity} ${item.unit || 'шт'} (${item.packs_count || 1} уп.)`
    : `${item.quantity} ${item.unit || 'шт'}`;

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.name}</h4>
            {item.is_optimized && (
              <Badge className="bg-green-500/10 text-green-600 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{displayQuantity}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon-sm" onClick={() => onUpdateQuantity(item.quantity - 1)}>-</Button>
            <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
            <Button variant="outline" size="icon-sm" onClick={() => onUpdateQuantity(item.quantity + 1)}>+</Button>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onRemove} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { user } = useAuth();
  const { cart, cartStrategy, setCartStrategy, clearCart: clearLocalCart, updateQuantity, removeFromCart } = useAppStore();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const { 
    items: dbItems, 
    groupedItems: dbGroupedItems, 
    loading: cartLoading, 
    optimizing, 
    importItems,
    optimizeCart, 
    removeItem: removeDbItem,
    updateItemQuantity: updateDbItemQuantity,
    clearCart: clearDbCart,
    refetch: refetchCart
  } = useCart();
  
  const [showStrategySelector, setShowStrategySelector] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use DB items if user is logged in, otherwise use local cart
  const useDbCart = !!user && dbItems.length > 0;

  // Group cart items by type (for local cart)
  const groupedItems = cart.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  // Separate cart items by optimization eligibility
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
    (sum, item) => {
      if (item.type === 'catering') {
        return sum + (item.depositAmount || 0);
      }
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0
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

  const handleOptimize = async () => {
    if (!user) {
      toast.error('Войдите в систему для использования AI-оптимизации');
      return;
    }

    if (!isPremium) {
      toast.error('AI-оптимизация доступна только для Premium пользователей', {
        description: 'Перейдите на платный тариф для доступа к этой функции',
        action: {
          label: 'Подробнее',
          onClick: () => window.location.href = '/profile/premium'
        }
      });
      return;
    }

    // If the user has items only in the local cart (e.g. added before auth finished loading),
    // sync them into Supabase first so optimization doesn't see an "empty" DB cart.
    if (dbItems.length === 0 && cart.length > 0) {
      const merged = new Map<string, { name: string; quantity: number; unit: string; category: string | null }>();

      for (const ci of cart) {
        const p = ci.product;
        if (!p) continue;

        const key = `${p.name}`.trim().toLowerCase();
        if (!key) continue;

        const prev = merged.get(key);
        merged.set(key, {
          name: p.name,
          quantity: (prev?.quantity || 0) + (ci.quantity || 0),
          unit: p.unit || prev?.unit || 'шт',
          category: p.category || prev?.category || null,
        });
      }

      const ok = await importItems(Array.from(merged.values()));
      if (!ok) return;

      // Ensure UI is in sync after import
      await refetchCart();
    }

    await optimizeCart();
  };

  const handleClearCart = async () => {
    if (user && dbItems.length > 0) {
      await clearDbCart();
    }
    clearLocalCart();
    toast.success('Корзина очищена');
  };

  const handleSyncWithAccount = async () => {
    if (!user) {
      toast.error('Войдите в систему для синхронизации');
      return;
    }

    if (cart.length === 0) {
      toast.info('Локальная корзина пуста');
      return;
    }

    setIsSyncing(true);

    try {
      const merged = new Map<string, { name: string; quantity: number; unit: string; category: string | null }>();

      for (const ci of cart) {
        const p = ci.product;
        if (!p) continue;

        const key = `${p.name}`.trim().toLowerCase();
        if (!key) continue;

        const prev = merged.get(key);
        merged.set(key, {
          name: p.name,
          quantity: (prev?.quantity || 0) + (ci.quantity || 0),
          unit: p.unit || prev?.unit || 'шт',
          category: p.category || prev?.category || null,
        });
      }

      const ok = await importItems(Array.from(merged.values()));
      if (ok) {
        clearLocalCart();
        await refetchCart();
        toast.success('Корзина синхронизирована с аккаунтом');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Ошибка синхронизации');
    } finally {
      setIsSyncing(false);
    }
  };

  // Show empty state if both carts are empty
  const isEmpty = cart.length === 0 && dbItems.length === 0;

  if (isEmpty && !cartLoading) {
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Очистить
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Очистить корзину?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Все товары будут удалены из корзины. Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCart} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Очистить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* AI Optimization Button */}
      <section className="px-4 pt-4">
        <Button
          onClick={handleOptimize}
          disabled={optimizing || (!dbItems.length && !cart.length)}
          className={`w-full ${isPremium ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'bg-muted text-muted-foreground'}`}
          size="lg"
        >
          {optimizing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Оптимизация...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Оптимизировать (AI)
              {!isPremium && <Badge className="ml-2 bg-white/20">Premium</Badge>}
            </>
          )}
        </Button>

        {/* Sync with account button - show only when user is logged in and has local cart items */}
        {user && cart.length > 0 && (
          <Button
            onClick={handleSyncWithAccount}
            disabled={isSyncing}
            variant="outline"
            className="w-full mt-2"
            size="lg"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Синхронизация...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Синхронизировать с аккаунтом
              </>
            )}
          </Button>
        )}
      </section>

      {/* Strategy Selector - only show if there are store products */}
      {storeProducts.length > 0 && (
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
      )}

      {/* DB Cart Items (grouped by category) */}
      {useDbCart && (
        <section className="px-4 pt-4 space-y-6">
          {cartLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            Object.entries(dbGroupedItems).map(([category, items]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary">
                    <Package className="h-3 w-3 mr-1" />
                    {category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({items.length})</span>
                </div>
                
                <div className="space-y-2">
                  {items.map((item) => (
                    <DBCartItem
                      key={item.id}
                      item={item}
                      onRemove={() => removeDbItem(item.id)}
                      onUpdateQuantity={(qty) => updateDbItemQuantity(item.id, qty)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* Aggregated Ingredients */}
      <AggregatedIngredientsSection />

      {/* Recipe Recommendations */}
      <RecipeRecommendations />

      {/* Grouped Cart Items (local cart) */}
      {!useDbCart && cart.length > 0 && (
        <section className="px-4 pt-4 space-y-6">
          {Object.entries(groupedItems).map(([type, items]) => {
            const config = CART_TYPE_CONFIG[type] || { label: 'Прочее', icon: Package, color: 'bg-gray-500/10 text-gray-600' };
            const Icon = config.icon;
            
            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={config.color}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">({items.length})</span>
                  {STORE_PRODUCT_TYPES.includes(type) && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      <Zap className="h-3 w-3 mr-1" />
                      Оптимизация
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  {items.map((item) => {
                    if (type === 'catering') {
                      return (
                        <CateringCartItem 
                          key={item.id} 
                          item={item} 
                          onRemove={() => removeFromCart(item.id)} 
                        />
                      );
                    }
                    
                    if (type === 'farm-product') {
                      return (
                        <FarmProductCartItem 
                          key={item.id} 
                          item={item} 
                          onRemove={() => removeFromCart(item.id)}
                          onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
                        />
                      );
                    }
                    
                    if (item.product) {
                      return (
                        <ProductCard key={item.id} product={item.product} variant="horizontal" />
                      );
                    }
                    
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

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
            <span className="font-semibold">{totalSubtotal.toLocaleString()} ₽</span>
          </div>
          {totalSavings > 0 && (
            <div className="flex justify-between text-primary">
              <span>Скидки на товары</span>
              <span className="font-semibold">-{totalSavings.toLocaleString()} ₽</span>
            </div>
          )}
          {storeProducts.length > 0 && (
            <div className="flex justify-between text-accent">
              <span>Экономия ({currentStrategy.label})</span>
              <span className="font-semibold">-{strategySavings.toLocaleString()} ₽</span>
            </div>
          )}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Промокод</span>
              <span className="font-semibold">-{promoDiscount.toLocaleString()} ₽</span>
            </div>
          )}
          <div className="pt-3 border-t border-border flex justify-between">
            <span className="text-lg font-bold">Итого</span>
            <span className="text-lg font-bold">{finalTotal.toLocaleString()} ₽</span>
          </div>
        </div>
      </section>

      {/* Fixed Bottom */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border space-y-2">
        {storeProducts.length > 0 && (
          <Link to="/shopping-route" className="block">
            <Button variant="outline" size="lg" className="w-full border-primary text-primary hover:bg-primary/10">
              <MapPin className="h-5 w-5 mr-2" />
              Построить маршрут по магазинам
            </Button>
          </Link>
        )}
        <Link to="/checkout" className="block">
          <Button variant="hero" size="lg" className="w-full">
            Оформить заказ • {finalTotal.toLocaleString()} ₽
          </Button>
        </Link>
      </div>
    </div>
  );
}
