import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, MapPin, ShoppingCart, Plus, Minus, ThermometerSnowflake, Clock, Check, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { farmProducts } from '@/data/farmData';

export default function FarmProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = farmProducts.find(p => p.id === id) || farmProducts[0];

  const discountPercent = product.oldPrice 
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  // Get similar products from same category
  const similarProducts = farmProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const handleAddToCart = () => {
    toast({
      title: 'Добавлено в корзину',
      description: `${product.name} x${quantity}`,
    });
  };

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">Фермерский продукт</h1>
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
            src={product.images[selectedImage]} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discountPercent > 0 && (
            <Badge className="bg-destructive text-destructive-foreground">
              -{discountPercent}%
            </Badge>
          )}
          <Badge className="bg-green-500 text-white">
            <Leaf className="h-3 w-3 mr-1" />
            Эко
          </Badge>
        </div>
        {/* Image Thumbnails */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === idx ? 'border-primary' : 'border-background'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} отзывов)</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{product.name}</h2>
        <p className="text-muted-foreground mb-4">{product.fullDescription}</p>

        {/* Farm Info */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{product.farm.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {product.farm.location}
              </p>
              {product.farm.certified && (
                <div className="flex items-center gap-1 mt-1">
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Сертифицированное хозяйство</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.badges.map((badge, idx) => (
            <Badge key={idx} variant="secondary">{badge}</Badge>
          ))}
        </div>

        {/* Price */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Цена</p>
              <p className="text-2xl font-bold text-primary">{product.price} ₽</p>
              {product.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">{product.oldPrice} ₽</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">за {product.unit}</p>
              <p className="text-sm font-medium">{product.weight}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition */}
      <section className="px-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Пищевая ценность на 100г</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold text-primary">{product.nutrition.calories}</p>
            <p className="text-xs text-muted-foreground">ккал</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{product.nutrition.protein}</p>
            <p className="text-xs text-muted-foreground">белки, г</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{product.nutrition.fat}</p>
            <p className="text-xs text-muted-foreground">жиры, г</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{product.nutrition.carbs}</p>
            <p className="text-xs text-muted-foreground">углев., г</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl">
            <TabsTrigger value="composition">Состав</TabsTrigger>
            <TabsTrigger value="storage">Хранение</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>

          <TabsContent value="composition" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-2">Состав</h4>
              <p className="text-muted-foreground">{product.composition}</p>
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
                  <p className="text-sm text-muted-foreground">{product.storageConditions}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Срок годности</p>
                  <p className="text-sm text-muted-foreground">{product.shelfLife}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-3">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{review.author}</span>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="px-4 mb-24">
          <h3 className="font-bold text-lg mb-3">Похожие товары</h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {similarProducts.map((p) => (
              <Link 
                key={p.id}
                to={`/farm-product/${p.id}`}
                className="flex-shrink-0 w-40 bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="aspect-square bg-muted relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {p.oldPrice && (
                    <Badge className="absolute top-2 left-2 bg-destructive text-xs">
                      -{Math.round((1 - p.price / p.oldPrice) * 100)}%
                    </Badge>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2 mb-1">{p.name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold">{p.price} ₽</span>
                    {p.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through">{p.oldPrice} ₽</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bought Together */}
      <section className="px-4 mb-24">
        <h3 className="font-bold text-lg mb-3">С этим покупают</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {farmProducts.filter(p => p.id !== product.id).slice(0, 4).map((p) => (
            <Link 
              key={p.id}
              to={`/farm-product/${p.id}`}
              className="flex-shrink-0 w-40 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-square bg-muted">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{p.name}</p>
                <span className="font-bold">{p.price} ₽</span>
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
            В корзину • {product.price * quantity} ₽
          </Button>
        </div>
      </div>
    </div>
  );
}
