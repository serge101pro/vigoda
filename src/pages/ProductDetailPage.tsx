import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Plus, Minus, Star, Clock, ThermometerSnowflake, Package, ShoppingCart, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAppStore, Product } from '@/stores/useAppStore';
import { useFavorites } from '@/hooks/useFavorites';
import { mockProducts } from '@/data/mockData';
import { petProducts } from '@/data/petData';
import { perfumeProducts, extendedHouseholdProducts, accessoriesProducts } from '@/data/extendedMockData';
import { ProductCard } from '@/components/products/ProductCard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

// Mock reviews
const mockReviews = [
  { id: '1', author: 'Анна К.', date: '15 декабря 2024', rating: 5, text: 'Отличный товар! Качество супер, доставка быстрая. Рекомендую!', avatar: '👩' },
  { id: '2', author: 'Михаил П.', date: '10 декабря 2024', rating: 4, text: 'Хороший продукт за свои деньги. Минус — упаковка немного помятая.', avatar: '👨' },
  { id: '3', author: 'Елена С.', date: '5 декабря 2024', rating: 5, text: 'Покупаю уже третий раз. Всегда довольна качеством!', avatar: '👩‍🦰' },
  { id: '4', author: 'Дмитрий Н.', date: '1 декабря 2024', rating: 5, text: 'Соотношение цена/качество на высоте. Буду заказывать ещё.', avatar: '👨‍🦱' },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, addToCart, updateQuantity, removeFromCart } = useAppStore();
  const { isProductFavorite, addProductToFavorites, removeProductFromFavorites } = useFavorites();
  
  // Combine all products
  const allProducts = useMemo(() => [
    ...mockProducts, 
    ...petProducts, 
    ...perfumeProducts, 
    ...extendedHouseholdProducts, 
    ...accessoriesProducts
  ], []);
  
  const product = allProducts.find(p => p.id === id);
  
  const [selectedStore, setSelectedStore] = useState<number>(0);

  const cartItem = cart.find(item => item.type === 'product' && item.product?.id === id);
  const quantity = cartItem?.quantity || 0;
  const isFavorite = product ? isProductFavorite(product.id) : false;

  // Get similar products
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 6);
  }, [product, allProducts]);

  if (!product) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <p className="text-lg font-semibold text-foreground mb-2">Товар не найден</p>
          <Link to="/catalog">
            <Button variant="outline">Перейти в каталог</Button>
          </Link>
        </div>
      </div>
    );
  }

  const bestPrice = product.stores 
    ? Math.min(...product.stores.map(s => s.price))
    : product.price;

  const handleAddToCart = () => {
    addToCart(product, 1);
    toast({
      title: 'Добавлено в корзину',
      description: product.name,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Ссылка скопирована!' });
    }
  };

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await removeProductFromFavorites(product.id);
    } else {
      await addProductToFavorites(product.id);
    }
  };

  const discount = product.oldPrice 
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">Товар</h1>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={handleToggleFavorite} 
              className="p-2 rounded-full hover:bg-muted"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Main Image */}
      <section className="relative px-4">
        <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
          <SafeImage 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.badge && (
            <Badge className={`absolute top-4 left-4 ${
              product.badge === 'sale' ? 'bg-red-500' :
              product.badge === 'new' ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              {product.badge === 'sale' ? `-${discount}%` :
               product.badge === 'new' ? 'Новинка' : 'Хит'}
            </Badge>
          )}
        </div>
      </section>

      {/* Product Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{product.category}</Badge>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} отзывов)</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{product.name}</h2>
        {product.description && (
          <p className="text-muted-foreground mb-4">{product.description}</p>
        )}

        {/* Best Price Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Лучшая цена</p>
              <p className="text-2xl font-bold text-primary">{bestPrice} ₽</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">за {product.unit}</p>
              {product.oldPrice && (
                <p className="text-xs text-primary">Экономия {product.oldPrice - product.price} ₽</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Store Prices */}
      {product.stores && product.stores.length > 0 && (
        <section className="px-4 mb-6">
          <h3 className="font-bold text-lg mb-3">Цены в магазинах</h3>
          <div className="space-y-2">
            {product.stores.map((store, index) => (
              <button
                key={store.name}
                onClick={() => setSelectedStore(index)}
                className={`w-full p-4 rounded-xl border transition-all ${
                  selectedStore === index 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏪</span>
                    <div className="text-left">
                      <p className="font-semibold">{store.name}</p>
                      <p className="text-xs text-muted-foreground">Доставка: 30-60 мин</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`font-bold text-lg ${store.price === bestPrice ? 'text-primary' : ''}`}>
                        {store.price} ₽
                      </p>
                    </div>
                    {selectedStore === index && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-muted rounded-xl">
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            <TabsTrigger value="characteristics">Характеристики</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {mockReviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{review.avatar}</span>
                    <div>
                      <p className="font-medium text-foreground">{review.author}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground">{review.text}</p>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Написать отзыв
            </Button>
          </TabsContent>

          <TabsContent value="characteristics" className="mt-4">
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {product.characteristics ? (
                Object.entries(product.characteristics).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 px-4">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between py-3 px-4">
                    <span className="text-muted-foreground">Категория</span>
                    <span className="font-medium text-foreground">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-3 px-4">
                    <span className="text-muted-foreground">Единица</span>
                    <span className="font-medium text-foreground">{product.unit}</span>
                  </div>
                  <div className="flex justify-between py-3 px-4">
                    <span className="text-muted-foreground">Рейтинг</span>
                    <span className="font-medium text-foreground">{product.rating} ⭐</span>
                  </div>
                  <div className="flex justify-between py-3 px-4">
                    <span className="text-muted-foreground">Отзывов</span>
                    <span className="font-medium text-foreground">{product.reviewCount}</span>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mb-24">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-lg">Похожие товары</h3>
            <Link to={`/catalog?category=${product.category}`} className="text-sm text-primary flex items-center">
              Все <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {similarProducts.map((p) => (
              <div key={p.id} className="flex-shrink-0 w-[140px]">
                <ProductCard product={p} variant="compact" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="flex items-center gap-4">
          {quantity > 0 ? (
            <>
              <div className="flex items-center gap-2 bg-primary/10 rounded-xl px-3 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => quantity > 1 ? updateQuantity(product.id, quantity - 1) : removeFromCart(product.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-muted-foreground">В корзине</p>
                <p className="font-bold text-lg">{product.price * quantity} ₽</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{bestPrice} ₽</p>
                {product.oldPrice && (
                  <p className="text-sm text-muted-foreground line-through">{product.oldPrice} ₽</p>
                )}
              </div>
              <Button 
                className="flex-1 h-12 rounded-xl text-base"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                В корзину
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
