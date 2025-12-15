import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, Clock, Flame, Users, Calendar, ThermometerSnowflake, ShoppingCart, Check, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface MealItem {
  time: string;
  name: string;
  calories: number;
  image: string;
}

interface DayMenu {
  day: string;
  meals: MealItem[];
  totalCalories: number;
}

const mockMealPlan = {
  id: '1',
  name: 'Сбалансированный рацион "Здоровье"',
  description: 'Полноценное питание на неделю с оптимальным балансом белков, жиров и углеводов. Подходит для поддержания веса и здорового образа жизни.',
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  images: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  ],
  rating: 4.9,
  reviewCount: 342,
  duration: '7 дней',
  mealsPerDay: 5,
  caloriesPerDay: 1800,
  price: 8990,
  pricePerDay: 1284,
  tags: ['Сбалансированное', 'Похудение', 'Без глютена'],
  chef: {
    name: 'Шеф Михаил Орлов',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80',
  },
  nutrition: {
    calories: 1800,
    protein: 90,
    fat: 60,
    carbs: 180,
  },
  storageConditions: 'Хранить при температуре от +2°C до +6°C',
  shelfLife: '5 суток с момента приготовления',
  deliveryInfo: 'Доставка 2 раза в неделю: понедельник и четверг',
};

const weekMenu: DayMenu[] = [
  {
    day: 'Понедельник',
    totalCalories: 1820,
    meals: [
      { time: 'Завтрак', name: 'Овсянка с ягодами и орехами', calories: 380, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=200&q=80' },
      { time: 'Перекус', name: 'Греческий йогурт с мёдом', calories: 150, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80' },
      { time: 'Обед', name: 'Куриная грудка с киноа', calories: 520, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80' },
      { time: 'Перекус', name: 'Фруктовый салат', calories: 180, image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=200&q=80' },
      { time: 'Ужин', name: 'Лосось с овощами гриль', calories: 590, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&q=80' },
    ],
  },
  {
    day: 'Вторник',
    totalCalories: 1780,
    meals: [
      { time: 'Завтрак', name: 'Омлет со шпинатом', calories: 350, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80' },
      { time: 'Перекус', name: 'Смузи с бананом', calories: 180, image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=200&q=80' },
      { time: 'Обед', name: 'Паста с морепродуктами', calories: 480, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=200&q=80' },
      { time: 'Перекус', name: 'Орехи и сухофрукты', calories: 200, image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&q=80' },
      { time: 'Ужин', name: 'Индейка с брокколи', calories: 570, image: 'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=200&q=80' },
    ],
  },
  {
    day: 'Среда',
    totalCalories: 1850,
    meals: [
      { time: 'Завтрак', name: 'Творожная запеканка', calories: 400, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&q=80' },
      { time: 'Перекус', name: 'Зелёный смузи', calories: 160, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=200&q=80' },
      { time: 'Обед', name: 'Говядина с гречкой', calories: 550, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80' },
      { time: 'Перекус', name: 'Хумус с овощами', calories: 170, image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=200&q=80' },
      { time: 'Ужин', name: 'Рыбные котлеты с салатом', calories: 570, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&q=80' },
    ],
  },
];

const similarPlans = [
  { id: '2', name: 'Рацион "Энергия"', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', price: 7990, calories: 2200 },
  { id: '3', name: 'Детокс-программа', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80', price: 6990, calories: 1500 },
  { id: '4', name: 'Спортивный рацион', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80', price: 9990, calories: 2500 },
];

export default function MealPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'3' | '7' | '14'>('7');
  const [selectedImage, setSelectedImage] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>('Понедельник');

  const priceMultiplier = { '3': 0.5, '7': 1, '14': 1.8 };
  const finalPrice = Math.round(mockMealPlan.price * priceMultiplier[selectedDuration]);

  const handleOrder = () => {
    toast({
      title: 'Заказ оформлен!',
      description: `Рацион "${mockMealPlan.name}" на ${selectedDuration} дней`,
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
          <h1 className="font-bold text-lg truncate max-w-[200px]">Рацион</h1>
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
        <div className="aspect-video bg-muted">
          <img 
            src={mockMealPlan.images[selectedImage]} 
            alt={mockMealPlan.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {mockMealPlan.images.map((img, idx) => (
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
      </section>

      {/* Plan Info */}
      <section className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {mockMealPlan.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{mockMealPlan.rating}</span>
          <span className="text-sm text-muted-foreground">({mockMealPlan.reviewCount} отзывов)</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{mockMealPlan.name}</h2>
        <p className="text-muted-foreground mb-4">{mockMealPlan.description}</p>

        {/* Chef Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-xl">
          <img 
            src={mockMealPlan.chef.avatar} 
            alt={mockMealPlan.chef.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{mockMealPlan.chef.name}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <ChefHat className="h-4 w-4" /> Автор рациона
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Дней</p>
            <p className="font-bold">{mockMealPlan.duration}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Flame className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-xs text-muted-foreground">Ккал/день</p>
            <p className="font-bold">{mockMealPlan.caloriesPerDay}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xs text-muted-foreground">Приёмов</p>
            <p className="font-bold">{mockMealPlan.mealsPerDay}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Users className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xs text-muted-foreground">Персон</p>
            <p className="font-bold">1</p>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Выберите срок</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['3', '7', '14'] as const).map((dur) => (
              <button
                key={dur}
                onClick={() => setSelectedDuration(dur)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  selectedDuration === dur 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-bold">{dur} дней</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round(mockMealPlan.price * priceMultiplier[dur])} ₽
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl">
            <TabsTrigger value="menu">Меню</TabsTrigger>
            <TabsTrigger value="nutrition">КБЖУ</TabsTrigger>
            <TabsTrigger value="info">Инфо</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-4">
            <div className="space-y-3">
              {weekMenu.map((day) => (
                <div key={day.day} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{day.day}</p>
                      <p className="text-sm text-muted-foreground">{day.meals.length} приёмов • {day.totalCalories} ккал</p>
                    </div>
                    <div className={`transition-transform ${expandedDay === day.day ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </button>
                  {expandedDay === day.day && (
                    <div className="border-t border-border p-4 space-y-3">
                      {day.meals.map((meal, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img 
                            src={meal.image} 
                            alt={meal.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-primary font-medium">{meal.time}</p>
                            <p className="font-medium">{meal.name}</p>
                            <p className="text-sm text-muted-foreground">{meal.calories} ккал</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-4">Среднее значение в день</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-primary">{mockMealPlan.nutrition.calories}</p>
                  <p className="text-xs text-muted-foreground">ккал</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mockMealPlan.nutrition.protein}</p>
                  <p className="text-xs text-muted-foreground">белки, г</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mockMealPlan.nutrition.fat}</p>
                  <p className="text-xs text-muted-foreground">жиры, г</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mockMealPlan.nutrition.carbs}</p>
                  <p className="text-xs text-muted-foreground">углеводы, г</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ThermometerSnowflake className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Условия хранения</p>
                  <p className="text-sm text-muted-foreground">{mockMealPlan.storageConditions}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Срок годности</p>
                  <p className="text-sm text-muted-foreground">{mockMealPlan.shelfLife}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Доставка</p>
                  <p className="text-sm text-muted-foreground">{mockMealPlan.deliveryInfo}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Plans */}
      <section className="px-4 mb-24">
        <h3 className="font-bold text-lg mb-3">Похожие рационы</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {similarPlans.map((plan) => (
            <div 
              key={plan.id}
              className="flex-shrink-0 w-44 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-video bg-muted">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{plan.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{plan.calories} ккал/день</p>
                <p className="font-bold text-primary">{plan.price} ₽</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Итого за {selectedDuration} дней</p>
            <p className="text-2xl font-bold text-primary">{finalPrice} ₽</p>
          </div>
          <Button 
            className="flex-1 h-12 rounded-xl text-base max-w-[200px]"
            onClick={handleOrder}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Заказать
          </Button>
        </div>
      </div>
    </div>
  );
}
