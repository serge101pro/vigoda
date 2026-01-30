import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Users, Flame, ShoppingCart, Filter, 
  ChevronRight, Star, Leaf, Wheat, Milk, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

// Import local images
import saladImg from '@/assets/products/salad.jpg';
import chickenImg from '@/assets/products/chicken.jpg';
import honeyImg from '@/assets/products/honey.jpg';
import milkImg from '@/assets/products/milk.jpg';
import broccoliImg from '@/assets/products/broccoli.jpg';
import beefImg from '@/assets/products/beef.jpg';

interface MealPlan {
  id: string;
  name: string;
  description: string;
  image: string;
  days: number;
  mealsPerDay: number;
  caloriesPerDay: number;
  price: number;
  pricePerDay: number;
  discount?: number;
  tags: string[];
  rating: number;
  reviews: number;
  isPopular?: boolean;
}

interface ReadyMeal {
  id: string;
  name: string;
  description: string;
  image: string;
  weight: number;
  calories: number;
  protein: number;
  price: number;
  oldPrice?: number;
  category: string;
  tags: string[];
  rating: number;
  cookTime: number;
}

const mealPlans: MealPlan[] = [
  {
    id: '1',
    name: 'Сбалансированное питание',
    description: 'Идеальный рацион для поддержания здоровья и энергии на каждый день',
    image: saladImg,
    days: 7,
    mealsPerDay: 5,
    caloriesPerDay: 1800,
    price: 6990,
    pricePerDay: 999,
    discount: 15,
    tags: ['Сбалансированное', 'Здоровое'],
    rating: 4.9,
    reviews: 324,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Похудение без голода',
    description: 'Дефицит калорий с максимальным насыщением. Результат через 2 недели!',
    image: broccoliImg,
    days: 14,
    mealsPerDay: 5,
    caloriesPerDay: 1400,
    price: 11990,
    pricePerDay: 857,
    discount: 20,
    tags: ['Низкокалорийное', 'Для похудения'],
    rating: 4.8,
    reviews: 567,
  },
  {
    id: '3',
    name: 'Набор массы',
    description: 'Высокобелковый рацион для спортсменов и активного образа жизни',
    image: beefImg,
    days: 7,
    mealsPerDay: 6,
    caloriesPerDay: 2800,
    price: 8990,
    pricePerDay: 1284,
    tags: ['Высокобелковое', 'Для спорта'],
    rating: 4.7,
    reviews: 189,
  },
  {
    id: '4',
    name: 'Вегетарианский',
    description: 'Полноценный растительный рацион со всеми необходимыми нутриентами',
    image: saladImg,
    days: 7,
    mealsPerDay: 4,
    caloriesPerDay: 1600,
    price: 5990,
    pricePerDay: 856,
    tags: ['Вегетарианское', 'Растительное'],
    rating: 4.6,
    reviews: 234,
  },
  {
    id: '5',
    name: 'Кето-рацион',
    description: 'Низкоуглеводное меню для быстрого жиросжигания',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=250&fit=crop',
    days: 7,
    mealsPerDay: 4,
    caloriesPerDay: 1500,
    price: 7490,
    pricePerDay: 1070,
    discount: 10,
    tags: ['Кето', 'Низкоуглеводное'],
    rating: 4.5,
    reviews: 156,
  },
];

const readyMeals: ReadyMeal[] = [
  {
    id: '1',
    name: 'Куриная грудка с киноа и овощами',
    description: 'Нежное филе с полезным гарниром',
    image: chickenImg,
    weight: 350,
    calories: 420,
    protein: 38,
    price: 449,
    oldPrice: 549,
    category: 'Обеды',
    tags: ['Высокобелковое', 'Без глютена'],
    rating: 4.8,
    cookTime: 3,
  },
  {
    id: '2',
    name: 'Лосось терияки с рисом',
    description: 'Запечённый лосось в соусе терияки',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
    weight: 380,
    calories: 520,
    protein: 32,
    price: 649,
    category: 'Обеды',
    tags: ['Омега-3', 'Премиум'],
    rating: 4.9,
    cookTime: 3,
  },
  {
    id: '3',
    name: 'Овсянка с ягодами и орехами',
    description: 'Идеальный завтрак для бодрого утра',
    image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=300&h=200&fit=crop',
    weight: 280,
    calories: 340,
    protein: 12,
    price: 249,
    category: 'Завтраки',
    tags: ['Завтрак', 'Растительное'],
    rating: 4.7,
    cookTime: 2,
  },
  {
    id: '4',
    name: 'Греческий салат с фетой',
    description: 'Свежие овощи с оливками и сыром',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop',
    weight: 250,
    calories: 280,
    protein: 8,
    price: 349,
    oldPrice: 399,
    category: 'Салаты',
    tags: ['Вегетарианское', 'Лёгкое'],
    rating: 4.6,
    cookTime: 0,
  },
  {
    id: '5',
    name: 'Говядина с брокколи',
    description: 'Стир-фрай из мраморной говядины',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop',
    weight: 320,
    calories: 480,
    protein: 42,
    price: 549,
    category: 'Обеды',
    tags: ['Высокобелковое', 'Безглютеновое'],
    rating: 4.8,
    cookTime: 3,
  },
  {
    id: '6',
    name: 'Крем-суп из тыквы',
    description: 'Нежный суп с имбирём и кокосовым молоком',
    image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=300&h=200&fit=crop',
    weight: 300,
    calories: 220,
    protein: 6,
    price: 299,
    category: 'Супы',
    tags: ['Веган', 'Безмолочное'],
    rating: 4.5,
    cookTime: 2,
  },
];

const categories = ['Все', 'Завтраки', 'Обеды', 'Ужины', 'Салаты', 'Супы', 'Десерты'];

export default function ReadyMealsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('popular');

  const filteredMeals = selectedCategory === 'Все' 
    ? readyMeals 
    : readyMeals.filter(m => m.category === selectedCategory);

  const handleAddPlanToCart = (plan: MealPlan) => {
    toast({ title: `Рацион "${plan.name}" добавлен в корзину` });
  };

  const handleAddMealToCart = (meal: ReadyMeal) => {
    toast({ title: `${meal.name} добавлено в корзину` });
  };

  return (
    <div className="page-container pt-4">

      <div className="px-4 py-4 space-y-6">
        <Tabs defaultValue="plans">
          <TabsList className="w-full">
            <TabsTrigger value="plans" className="flex-1">📅 Рационы</TabsTrigger>
            <TabsTrigger value="meals" className="flex-1">🍱 Блюда</TabsTrigger>
          </TabsList>

          {/* Meal Plans */}
          <TabsContent value="plans" className="mt-4 space-y-4">
            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary-light rounded-xl p-3 text-center">
                <span className="text-2xl">🚀</span>
                <p className="text-xs font-medium text-foreground mt-1">Доставка за 2ч</p>
              </div>
              <div className="bg-accent-light rounded-xl p-3 text-center">
                <span className="text-2xl">🥗</span>
                <p className="text-xs font-medium text-foreground mt-1">Свежие продукты</p>
              </div>
              <div className="bg-muted rounded-xl p-3 text-center">
                <span className="text-2xl">📊</span>
                <p className="text-xs font-medium text-foreground mt-1">КБЖУ расчитано</p>
              </div>
            </div>

            {/* Plans */}
            <div className="space-y-4">
              {mealPlans.map((plan) => (
                <Link key={plan.id} to={`/meal-plan/${plan.id}`} className="block bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:border-primary/50 transition-colors">
                  <div className="relative h-44">
                    <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                    {plan.isPopular && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        🔥 Хит продаж
                      </Badge>
                    )}
                    {plan.discount && (
                      <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
                        -{plan.discount}%
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {plan.days} дней
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {plan.mealsPerDay} приёмов
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        {plan.caloriesPerDay} ккал/день
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {plan.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{plan.rating}</span>
                        <span className="text-sm text-muted-foreground">({plan.reviews})</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{plan.price}₽</p>
                        <p className="text-sm text-muted-foreground">{plan.pricePerDay}₽/день</p>
                      </div>
                    </div>

                    <Button variant="hero" className="w-full" onClick={(e) => { e.preventDefault(); handleAddPlanToCart(plan); }}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Заказать рацион
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* Ready Meals */}
          <TabsContent value="meals" className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{filteredMeals.length} блюд</p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">По популярности</SelectItem>
                  <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                  <SelectItem value="price-desc">Сначала дороже</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Meals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeals.map((meal) => (
                <Link 
                  key={meal.id} 
                  to={`/ready-meal/${meal.id}`}
                  className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="relative h-40">
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                    {meal.oldPrice && (
                      <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                        -{Math.round((1 - meal.price / meal.oldPrice) * 100)}%
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{meal.weight}г</span>
                      <span>{meal.calories} ккал</span>
                      <span>{meal.protein}г белка</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {meal.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-foreground">{meal.price}₽</span>
                        {meal.oldPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">{meal.oldPrice}₽</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {meal.rating}
                        </div>
                        <Button 
                          variant="hero" 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddMealToCart(meal);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
