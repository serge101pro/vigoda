import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Users, Flame, ShoppingCart, Filter, 
  ChevronRight, Star, Leaf, Wheat, X, SlidersHorizontal,
  AlertTriangle, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Import local images
import saladImg from '@/assets/products/salad.jpg';
import chickenImg from '@/assets/products/chicken.jpg';
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
  allergens: string[];
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
    allergens: [],
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
    allergens: ['Рыба', 'Соя', 'Кунжут'],
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
    allergens: ['Молоко', 'Орехи'],
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
    allergens: ['Молоко'],
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
    allergens: [],
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
    allergens: [],
  },
];

const categories = ['Все', 'Завтраки', 'Обеды', 'Ужины', 'Салаты', 'Супы', 'Десерты'];

// All possible allergens
const allAllergens = ['Молоко', 'Орехи', 'Рыба', 'Соя', 'Кунжут', 'Глютен', 'Яйца'];

export default function ReadyMealsPage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('popular');
  const [addingMealId, setAddingMealId] = useState<string | null>(null);
  
  // Filter states
  const [caloriesRange, setCaloriesRange] = useState<[number, number]>([0, 1000]);
  const [cookTimeMax, setCookTimeMax] = useState<number>(60);
  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleAllergen = (allergen: string) => {
    setExcludeAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const clearFilters = () => {
    setCaloriesRange([0, 1000]);
    setCookTimeMax(60);
    setExcludeAllergens([]);
  };

  const hasActiveFilters = caloriesRange[0] > 0 || caloriesRange[1] < 1000 || cookTimeMax < 60 || excludeAllergens.length > 0;

  // Filter and sort meals
  const filteredMeals = useMemo(() => {
    let meals = readyMeals;

    // Category filter
    if (selectedCategory !== 'Все') {
      meals = meals.filter(m => m.category === selectedCategory);
    }

    // Calories filter
    meals = meals.filter(m => m.calories >= caloriesRange[0] && m.calories <= caloriesRange[1]);

    // Cook time filter
    meals = meals.filter(m => m.cookTime <= cookTimeMax);

    // Allergens filter
    if (excludeAllergens.length > 0) {
      meals = meals.filter(m => 
        !m.allergens.some(a => excludeAllergens.includes(a))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        meals = [...meals].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        meals = [...meals].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        meals = [...meals].sort((a, b) => b.rating - a.rating);
        break;
      case 'calories-asc':
        meals = [...meals].sort((a, b) => a.calories - b.calories);
        break;
      case 'calories-desc':
        meals = [...meals].sort((a, b) => b.calories - a.calories);
        break;
      default:
        // popular - keep original order
        break;
    }

    return meals;
  }, [selectedCategory, sortBy, caloriesRange, cookTimeMax, excludeAllergens]);

  const handleAddPlanToCart = async (plan: MealPlan) => {
    if (!user) {
      toast.error('Войдите в систему для добавления в корзину');
      return;
    }
    
    const success = await addItem(plan.name, 1, 'рацион', 'Рационы питания');
    if (success) {
      toast.success(`Рацион "${plan.name}" добавлен в корзину`);
    }
  };

  const handleAddMealToCart = async (meal: ReadyMeal) => {
    if (!user) {
      toast.error('Войдите в систему для добавления в корзину');
      return;
    }

    setAddingMealId(meal.id);
    try {
      const success = await addItem(meal.name, 1, 'порц.', 'Готовые блюда');
      if (success) {
        toast.success(`${meal.name} добавлено в корзину`);
      }
    } finally {
      setAddingMealId(null);
    }
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
                    <SafeImage src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
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
            {/* Filters Row */}
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

            <div className="flex justify-between items-center gap-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Фильтры
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 py-6">
                    {/* Calories Range */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          Калории
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {caloriesRange[0]} - {caloriesRange[1]} ккал
                        </span>
                      </div>
                      <Slider
                        value={caloriesRange}
                        onValueChange={(v) => setCaloriesRange(v as [number, number])}
                        min={0}
                        max={1000}
                        step={50}
                        className="w-full"
                      />
                    </div>

                    {/* Cook Time */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium flex items-center gap-2">
                          <Timer className="h-4 w-4 text-blue-500" />
                          Время приготовления
                        </span>
                        <span className="text-sm text-muted-foreground">
                          до {cookTimeMax} мин
                        </span>
                      </div>
                      <Slider
                        value={[cookTimeMax]}
                        onValueChange={(v) => setCookTimeMax(v[0])}
                        min={0}
                        max={60}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Allergens */}
                    <div>
                      <span className="font-medium flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        Исключить аллергены
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        {allAllergens.map((allergen) => (
                          <div
                            key={allergen}
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                              excludeAllergens.includes(allergen)
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border hover:border-muted-foreground'
                            }`}
                            onClick={() => toggleAllergen(allergen)}
                          >
                            <Checkbox
                              checked={excludeAllergens.includes(allergen)}
                              onCheckedChange={() => toggleAllergen(allergen)}
                            />
                            <span className="text-sm">{allergen}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button variant="outline" className="flex-1" onClick={clearFilters}>
                        Сбросить
                      </Button>
                      <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                        Показать ({filteredMeals.length})
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">{filteredMeals.length} блюд</p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">По популярности</SelectItem>
                    <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                    <SelectItem value="price-desc">Сначала дороже</SelectItem>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="calories-asc">Калории ↑</SelectItem>
                    <SelectItem value="calories-desc">Калории ↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {caloriesRange[0] > 0 || caloriesRange[1] < 1000 ? (
                  <Badge variant="secondary" className="gap-1">
                    <Flame className="h-3 w-3" />
                    {caloriesRange[0]}-{caloriesRange[1]} ккал
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setCaloriesRange([0, 1000])} 
                    />
                  </Badge>
                ) : null}
                {cookTimeMax < 60 && (
                  <Badge variant="secondary" className="gap-1">
                    <Timer className="h-3 w-3" />
                    до {cookTimeMax} мин
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setCookTimeMax(60)} 
                    />
                  </Badge>
                )}
                {excludeAllergens.map(a => (
                  <Badge key={a} variant="destructive" className="gap-1">
                    Без {a}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleAllergen(a)} 
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Meals Grid */}
            {filteredMeals.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">Блюда не найдены</p>
                <p className="text-muted-foreground mb-4">Попробуйте изменить параметры фильтров</p>
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMeals.map((meal) => (
                  <Link 
                    key={meal.id} 
                    to={`/ready-meal/${meal.id}`}
                    className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="relative h-40">
                      <SafeImage src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                      {meal.oldPrice && (
                        <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                          -{Math.round((1 - meal.price / meal.oldPrice) * 100)}%
                        </Badge>
                      )}
                      {meal.allergens.length > 0 && (
                        <Badge className="absolute top-2 right-2 bg-amber-500/80 text-white text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {meal.allergens.length}
                        </Badge>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-foreground mb-1">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{meal.description}</p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span>{meal.weight}г</span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {meal.calories} ккал
                        </span>
                        <span>{meal.protein}г белка</span>
                        {meal.cookTime > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {meal.cookTime} мин
                          </span>
                        )}
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
                            disabled={addingMealId === meal.id}
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
