import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, Clock, Flame, Users, Calendar, ThermometerSnowflake, ShoppingCart, Check, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { extendedMealPlans } from '@/data/mealPlansData';

export default function MealPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<'3' | '7' | '14'>('7');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Find meal plan by id or use first one
  const mealPlan = extendedMealPlans.find(p => p.id === id) || extendedMealPlans[0];
  
  const priceMultiplier = { '3': 0.5, '7': 1, '14': 1.8 };
  const finalPrice = Math.round(mealPlan.price * priceMultiplier[selectedDuration]);

  const handleOrder = () => {
    toast({
      title: 'Заказ оформлен!',
      description: `Рацион "${mealPlan.name}" на ${selectedDuration} дней`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  // Get similar plans (excluding current)
  const similarPlans = extendedMealPlans.filter(p => p.id !== mealPlan.id).slice(0, 3);

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
            src={mealPlan.image} 
            alt={mealPlan.name}
            className="w-full h-full object-cover"
          />
        </div>
        {mealPlan.discount && (
          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
            -{mealPlan.discount}%
          </Badge>
        )}
        {mealPlan.isPopular && (
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
            🔥 Популярный
          </Badge>
        )}
      </section>

      {/* Plan Info */}
      <section className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {mealPlan.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{mealPlan.rating}</span>
          <span className="text-sm text-muted-foreground">({mealPlan.reviewCount} отзывов)</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{mealPlan.name}</h2>
        <p className="text-muted-foreground mb-4">{mealPlan.description}</p>

        {/* Benefits */}
        <div className="bg-green-500/10 rounded-xl p-4 mb-4 border border-green-500/20">
          <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">✓ Преимущества</h4>
          <ul className="space-y-1">
            {mealPlan.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Дней</p>
            <p className="font-bold">{mealPlan.days}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Flame className="h-5 w-5 mx-auto mb-1 text-accent" />
            <p className="text-xs text-muted-foreground">Ккал/день</p>
            <p className="font-bold">{mealPlan.caloriesPerDay}</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xs text-muted-foreground">Приёмов</p>
            <p className="font-bold">{mealPlan.mealsPerDay}</p>
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
                  {Math.round(mealPlan.price * priceMultiplier[dur])} ₽
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-muted rounded-xl">
            <TabsTrigger value="menu">Меню</TabsTrigger>
            <TabsTrigger value="nutrition">КБЖУ</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            <TabsTrigger value="info">Инфо</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-4">
            <div className="space-y-3">
              {mealPlan.dailyMenu.map((day) => (
                <div key={day.day} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{day.dayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.meals.length} приёмов • {day.totalCalories} ккал
                      </p>
                    </div>
                    <div className={`transition-transform ${expandedDay === day.day ? 'rotate-180' : ''}`}>
                      ▼
                    </div>
                  </button>
                  {expandedDay === day.day && (
                    <div className="border-t border-border p-4 space-y-3">
                      {day.meals.map((meal, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                            {meal.time === '08:00' || meal.time === '07:00' ? '🍳' : 
                             meal.time === '13:00' || meal.time === '12:00' ? '🍲' :
                             meal.time === '19:00' ? '🥗' : '🍎'}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-primary font-medium">{meal.time}</p>
                            <p className="font-medium text-sm">{meal.name}</p>
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              <span>{meal.calories} ккал</span>
                              <span>Б: {meal.protein}г</span>
                              <span>Ж: {meal.fat}г</span>
                              <span>У: {meal.carbs}г</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Day totals */}
                      <div className="pt-2 border-t border-border flex justify-between text-sm">
                        <span className="text-muted-foreground">Итого за день:</span>
                        <div className="flex gap-3 font-medium">
                          <span>{day.totalCalories} ккал</span>
                          <span>Б: {day.totalProtein}г</span>
                          <span>Ж: {day.totalFat}г</span>
                          <span>У: {day.totalCarbs}г</span>
                        </div>
                      </div>
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
                  <p className="text-2xl font-bold text-primary">{mealPlan.caloriesPerDay}</p>
                  <p className="text-xs text-muted-foreground">ккал</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mealPlan.proteinPerDay}</p>
                  <p className="text-xs text-muted-foreground">белки, г</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mealPlan.fatPerDay}</p>
                  <p className="text-xs text-muted-foreground">жиры, г</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-2xl font-bold text-foreground">{mealPlan.carbsPerDay}</p>
                  <p className="text-xs text-muted-foreground">углеводы, г</p>
                </div>
              </div>
            </div>

            {/* What's included */}
            <div className="mt-4 bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">📦 Что входит</h4>
              <ul className="space-y-1">
                {mealPlan.includes.map((item, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contraindications */}
            {mealPlan.contraindications.length > 0 && (
              <div className="mt-4 bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                <h4 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">⚠️ Противопоказания</h4>
                <ul className="space-y-1">
                  {mealPlan.contraindications.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-4">
              {mealPlan.reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    {review.weightLost && (
                      <Badge className="bg-green-500 text-white">
                        -{review.weightLost} кг
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                </div>
              ))}
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
                  <p className="text-sm text-muted-foreground">Хранить при температуре от +2°C до +6°C</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Срок годности</p>
                  <p className="text-sm text-muted-foreground">5 суток с момента приготовления</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Доставка</p>
                  <p className="text-sm text-muted-foreground">Доставка 2 раза в неделю: понедельник и четверг</p>
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
            <Link 
              key={plan.id}
              to={`/meal-plan/${plan.id}`}
              className="flex-shrink-0 w-44 bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-video bg-muted">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{plan.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{plan.caloriesPerDay} ккал/день</p>
                <p className="text-sm font-bold text-primary">{plan.price} ₽</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-background/95 backdrop-blur-md border-t border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-sm text-muted-foreground">Итого за {selectedDuration} дней</p>
            <p className="text-2xl font-bold text-foreground">{finalPrice} ₽</p>
          </div>
          <Button variant="hero" size="lg" onClick={handleOrder}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Заказать
          </Button>
        </div>
      </div>
    </div>
  );
}
