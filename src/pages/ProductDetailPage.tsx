import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Plus, Minus, Star, Clock, ThermometerSnowflake, Package, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface StorePrice {
  store: string;
  logo: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  delivery: string;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

const mockProduct = {
  id: '1',
  name: 'Филе куриное охлаждённое "Петелинка" высший сорт',
  brand: 'Петелинка',
  category: 'Мясо и птица',
  image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
  images: [
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&q=80',
  ],
  description: 'Нежное куриное филе высшего сорта от проверенного производителя. Без костей и кожи, идеально для диетического питания.',
  weight: '1 кг',
  rating: 4.8,
  reviewCount: 1256,
  nutrition: {
    calories: 110,
    protein: 23.1,
    fat: 1.2,
    carbs: 0,
    fiber: 0,
  } as NutritionInfo,
  composition: 'Куриное филе (грудка куриная)',
  storageConditions: 'Хранить при температуре от 0°C до +4°C',
  shelfLife: '7 суток',
  manufacturer: 'ООО "Петелинка"',
  country: 'Россия',
};

const storePrices: StorePrice[] = [
  { store: 'Пятёрочка', logo: '🏪', price: 389, oldPrice: 459, inStock: true, delivery: '30-60 мин' },
  { store: 'Перекрёсток', logo: '🛒', price: 399, inStock: true, delivery: '45-90 мин' },
  { store: 'ВкусВилл', logo: '🥬', price: 429, inStock: true, delivery: '60-120 мин' },
  { store: 'Магнит', logo: '🧲', price: 379, oldPrice: 449, inStock: false, delivery: '1-2 дня' },
  { store: 'Лента', logo: '📦', price: 359, inStock: true, delivery: '1-2 дня' },
];

const similarProducts = [
  { id: '2', name: 'Филе индейки охл.', image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&q=80', price: 499, oldPrice: 599 },
  { id: '3', name: 'Куриные бёдра', image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80', price: 259, oldPrice: null },
  { id: '4', name: 'Грудка утиная', image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400&q=80', price: 649, oldPrice: 799 },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const bestPrice = Math.min(...storePrices.filter(s => s.inStock).map(s => s.price));

  const handleAddToCart = () => {
    if (!selectedStore) {
      toast({
        title: 'Выберите магазин',
        description: 'Для добавления в корзину выберите магазин',
      });
      return;
    }
    toast({
      title: 'Добавлено в корзину',
      description: `${mockProduct.name} x${quantity} из ${selectedStore}`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

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
              onClick={() => setIsFavorite(!isFavorite)} 
              className="p-2 rounded-full hover:bg-muted"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Image */}
      <section className="relative">
        <div className="aspect-square bg-muted">
          <img 
            src={mockProduct.images[selectedImage]} 
            alt={mockProduct.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Image Thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {mockProduct.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === idx ? 'border-primary' : 'border-background'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* Product Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{mockProduct.category}</Badge>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{mockProduct.rating}</span>
            <span className="text-sm text-muted-foreground">({mockProduct.reviewCount} отзывов)</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{mockProduct.name}</h2>
        <p className="text-muted-foreground mb-4">{mockProduct.description}</p>

        {/* Best Price Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Лучшая цена</p>
              <p className="text-2xl font-bold text-primary">{bestPrice} ₽</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">за {mockProduct.weight}</p>
              <p className="text-xs text-primary">Экономия до 90₽</p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Prices */}
      <section className="px-4 mb-6">
        <h3 className="font-bold text-lg mb-3">Цены в магазинах</h3>
        <div className="space-y-2">
          {storePrices.map((store) => (
            <button
              key={store.store}
              onClick={() => store.inStock && setSelectedStore(store.store)}
              disabled={!store.inStock}
              className={`w-full p-4 rounded-xl border transition-all ${
                selectedStore === store.store 
                  ? 'border-primary bg-primary/5' 
                  : store.inStock 
                    ? 'border-border hover:border-primary/50' 
                    : 'border-border opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{store.logo}</span>
                  <div className="text-left">
                    <p className="font-semibold">{store.store}</p>
                    <p className="text-xs text-muted-foreground">
                      {store.inStock ? `Доставка: ${store.delivery}` : 'Нет в наличии'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className={`font-bold text-lg ${store.price === bestPrice ? 'text-primary' : ''}`}>
                      {store.price} ₽
                    </p>
                    {store.oldPrice && (
                      <p className="text-xs text-muted-foreground line-through">{store.oldPrice} ₽</p>
                    )}
                  </div>
                  {selectedStore === store.store && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl">
            <TabsTrigger value="composition">Состав</TabsTrigger>
            <TabsTrigger value="nutrition">КБЖУ</TabsTrigger>
            <TabsTrigger value="storage">Хранение</TabsTrigger>
          </TabsList>

          <TabsContent value="composition" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-2">Состав</h4>
              <p className="text-muted-foreground">{mockProduct.composition}</p>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Производитель</p>
                  <p className="font-medium">{mockProduct.manufacturer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Страна</p>
                  <p className="font-medium">{mockProduct.country}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-4">Пищевая ценность на 100г</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-primary">{mockProduct.nutrition.calories}</p>
                  <p className="text-xs text-muted-foreground">ккал</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mockProduct.nutrition.protein}</p>
                  <p className="text-xs text-muted-foreground">белки, г</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mockProduct.nutrition.fat}</p>
                  <p className="text-xs text-muted-foreground">жиры, г</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mockProduct.nutrition.carbs}</p>
                  <p className="text-xs text-muted-foreground">углеводы, г</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ThermometerSnowflake className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Условия хранения</p>
                  <p className="text-sm text-muted-foreground">{mockProduct.storageConditions}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Срок годности</p>
                  <p className="text-sm text-muted-foreground">{mockProduct.shelfLife}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Вес нетто</p>
                  <p className="text-sm text-muted-foreground">{mockProduct.weight}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Products */}
      <section className="px-4 mb-24">
        <h3 className="font-bold text-lg mb-3">Похожие товары</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {similarProducts.map((product) => (
            <Link 
              key={product.id}
              to={`/product/${product.id}`}
              className="flex-shrink-0 w-36 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-square bg-muted">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{product.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold">{product.price} ₽</span>
                  {product.oldPrice && (
                    <span className="text-xs text-muted-foreground line-through">{product.oldPrice} ₽</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="flex-1 h-12 rounded-xl text-base"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            В корзину • {selectedStore ? storePrices.find(s => s.store === selectedStore)?.price! * quantity : bestPrice * quantity} ₽
          </Button>
        </div>
      </div>
    </div>
  );
}
