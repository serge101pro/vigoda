import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, Clock, Flame, ShoppingCart, Plus, Minus, ThermometerSnowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Import images
import chickenQuinoa from '@/assets/meals/chicken-quinoa.jpg';
import salmonTeriyaki from '@/assets/meals/salmon-teriyaki.jpg';
import saladImg from '@/assets/products/salad.jpg';

interface ReadyMeal {
  id: string;
  name: string;
  description: string;
  image: string;
  weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  cookTime: number;
  ingredients: string[];
  allergens: string[];
  storageConditions: string;
  shelfLife: string;
  reviews: { author: string; rating: number; text: string; date: string }[];
}

const meals: ReadyMeal[] = [
  {
    id: '1',
    name: 'Куриная грудка с киноа и овощами',
    description: 'Нежное филе курицы на гриле с гарниром из киноа, брокколи и моркови. Идеально для здорового обеда или ужина.',
    image: chickenQuinoa,
    weight: 350,
    calories: 420,
    protein: 38,
    fat: 12,
    carbs: 35,
    price: 449,
    oldPrice: 549,
    rating: 4.8,
    reviewCount: 234,
    cookTime: 3,
    ingredients: ['Куриная грудка', 'Киноа', 'Брокколи', 'Морковь', 'Оливковое масло', 'Специи'],
    allergens: [],
    storageConditions: 'Хранить при температуре от 0°C до +4°C',
    shelfLife: '5 суток',
    reviews: [
      { author: 'Мария П.', rating: 5, text: 'Очень вкусно и сытно! Идеально для обеда в офисе.', date: '18.12.2024' },
      { author: 'Алексей К.', rating: 5, text: 'Отличное соотношение белка и калорий. Рекомендую!', date: '15.12.2024' },
      { author: 'Елена С.', rating: 4, text: 'Хорошее блюдо, немного не хватило соуса.', date: '12.12.2024' },
    ],
  },
  {
    id: '2',
    name: 'Лосось терияки с рисом',
    description: 'Запечённое филе лосося в соусе терияки с рисом и свежими овощами. Богато Омега-3.',
    image: salmonTeriyaki,
    weight: 380,
    calories: 520,
    protein: 32,
    fat: 18,
    carbs: 48,
    price: 649,
    rating: 4.9,
    reviewCount: 189,
    cookTime: 3,
    ingredients: ['Лосось', 'Рис', 'Соус терияки', 'Кунжут', 'Имбирь', 'Зелёный лук'],
    allergens: ['Рыба', 'Соя', 'Кунжут'],
    storageConditions: 'Хранить при температуре от 0°C до +4°C',
    shelfLife: '3 суток',
    reviews: [
      { author: 'Дмитрий В.', rating: 5, text: 'Невероятно вкусный лосось! Как в ресторане.', date: '17.12.2024' },
      { author: 'Ольга М.', rating: 5, text: 'Обожаю это блюдо! Заказываю каждую неделю.', date: '14.12.2024' },
      { author: 'Игорь Л.', rating: 4, text: 'Очень вкусно, но цена немного высокая.', date: '10.12.2024' },
    ],
  },
];

export default function ReadyMealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const meal = meals.find(m => m.id === id) || meals[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const handleAddToCart = () => {
    toast({
      title: 'Добавлено в корзину',
      description: `${meal.name} x${quantity}`,
    });
  };

  const discountPercent = meal.oldPrice 
    ? Math.round((1 - meal.price / meal.oldPrice) * 100)
    : 0;

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">Готовое блюдо</h1>
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
            src={meal.image} 
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
        {discountPercent > 0 && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
            -{discountPercent}%
          </Badge>
        )}
      </section>

      {/* Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{meal.rating}</span>
            <span className="text-sm text-muted-foreground">({meal.reviewCount} отзывов)</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{meal.name}</h2>
        <p className="text-muted-foreground mb-4">{meal.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {meal.cookTime} мин разогрев
          </span>
          <span>{meal.weight}г</span>
        </div>

        {/* Price */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Цена</p>
              <p className="text-2xl font-bold text-primary">{meal.price} ₽</p>
              {meal.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">{meal.oldPrice} ₽</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{(meal.price / (meal.weight / 100)).toFixed(0)} ₽/100г</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition */}
      <section className="px-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Пищевая ценность</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold text-primary">{meal.calories}</p>
            <p className="text-xs text-muted-foreground">ккал</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{meal.protein}</p>
            <p className="text-xs text-muted-foreground">белки, г</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{meal.fat}</p>
            <p className="text-xs text-muted-foreground">жиры, г</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{meal.carbs}</p>
            <p className="text-xs text-muted-foreground">углеводы, г</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl">
            <TabsTrigger value="ingredients">Состав</TabsTrigger>
            <TabsTrigger value="storage">Хранение</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-3">Ингредиенты</h4>
              <p className="text-muted-foreground mb-4">{meal.ingredients.join(', ')}</p>
              
              {meal.allergens.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="font-semibold mb-2 text-destructive">Аллергены</h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.allergens.map((a, i) => (
                      <Badge key={i} variant="destructive">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
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
                  <p className="text-sm text-muted-foreground">{meal.storageConditions}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Срок годности</p>
                  <p className="text-sm text-muted-foreground">{meal.shelfLife}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-3">
              {meal.reviews.map((review, idx) => (
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

      {/* Similar meals */}
      <section className="px-4 mb-24">
        <h3 className="font-bold text-lg mb-3">Похожие блюда</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {meals.filter(m => m.id !== meal.id).map((m) => (
            <Link 
              key={m.id}
              to={`/ready-meal/${m.id}`}
              className="flex-shrink-0 w-40 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-square bg-muted">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{m.name}</p>
                <span className="font-bold">{m.price} ₽</span>
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
            В корзину • {meal.price * quantity} ₽
          </Button>
        </div>
      </div>
    </div>
  );
}
