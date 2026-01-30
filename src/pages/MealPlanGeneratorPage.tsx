import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChefHat, Calendar, Users, Flame, Apple, 
  Download, FileText, ShoppingCart, Heart, BookOpen,
  Check, X, Loader2, AlertCircle, ChevronDown, Share2,
  CalendarDays, List, Crown, Soup, Pencil, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/stores/useAppStore';
import { useCart } from '@/hooks/useCart';

// Cuisine types (Top 20)
const CUISINE_TYPES = [
  { id: 'italian', label: 'Итальянская', emoji: '🍝' },
  { id: 'french', label: 'Французская', emoji: '🥐' },
  { id: 'georgian', label: 'Грузинская', emoji: '🫓' },
  { id: 'russian', label: 'Русская', emoji: '🥟' },
  { id: 'japanese', label: 'Японская', emoji: '🍣' },
  { id: 'thai', label: 'Тайская', emoji: '🍜' },
  { id: 'mexican', label: 'Мексиканская', emoji: '🌮' },
  { id: 'indian', label: 'Индийская', emoji: '🍛' },
  { id: 'chinese', label: 'Китайская', emoji: '🥡' },
  { id: 'greek', label: 'Греческая', emoji: '🥙' },
  { id: 'spanish', label: 'Испанская', emoji: '🥘' },
  { id: 'korean', label: 'Корейская', emoji: '🍲' },
  { id: 'vietnamese', label: 'Вьетнамская', emoji: '🍜' },
  { id: 'american', label: 'Американская', emoji: '🍔' },
  { id: 'middle_eastern', label: 'Ближневосточная', emoji: '🧆' },
  { id: 'turkish', label: 'Турецкая', emoji: '🥙' },
  { id: 'moroccan', label: 'Марокканская', emoji: '🥘' },
  { id: 'brazilian', label: 'Бразильская', emoji: '🍖' },
  { id: 'mediterranean', label: 'Средиземноморская', emoji: '🫒' },
  { id: 'asian_fusion', label: 'Азиатский фьюжн', emoji: '🥢' },
];

// Diet types
const DIET_TYPES = [
  { id: 'vegan', label: 'Веганская', emoji: '🌱' },
  { id: 'keto', label: 'Кето', emoji: '🥑' },
  { id: 'paleo', label: 'Палео', emoji: '🍖' },
  { id: 'lactose_free', label: 'Безлактозная', emoji: '🥛' },
  { id: 'gluten_free', label: 'Безглютеновая', emoji: '🌾' },
  { id: 'vegetarian', label: 'Вегетарианская', emoji: '🥬' },
  { id: 'low_carb', label: 'Низкоуглеводная', emoji: '📉' },
  { id: 'high_protein', label: 'Высокобелковая', emoji: '💪' },
];

// Meal types
const MEAL_TYPES = [
  { id: 'breakfast', label: 'Завтрак', emoji: '🍳', allowSoup: false },
  { id: 'snack1', label: 'Перекус 1', emoji: '🍎', allowSoup: false },
  { id: 'lunch', label: 'Обед', emoji: '🍲', allowSoup: true },
  { id: 'snack2', label: 'Перекус 2', emoji: '🥜', allowSoup: false },
  { id: 'dinner', label: 'Ужин', emoji: '🥗', allowSoup: true },
  { id: 'late_snack', label: 'Поздний ужин', emoji: '🌙', allowSoup: false },
];

// Day options
const DAY_OPTIONS = [
  { value: '1', label: '1 день' },
  { value: '3', label: '3 дня' },
  { value: '7', label: '7 дней' },
  { value: '14', label: '14 дней' },
];

interface MealPlanMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  photo_search_query: string;
  image_url?: string;
  recipe: {
    ingredients: { name: string; amount: string; category: string }[];
    steps: string[];
    cooking_time: number;
    servings: number;
  };
}

interface MealPlanDay {
  day: number;
  date: string;
  meals: {
    type: string;
    meal: MealPlanMeal;
  }[];
  total_calories: number;
}

interface GeneratedMealPlan {
  days: MealPlanDay[];
  shopping_list: { category: string; items: { name: string; amount: string; checked?: boolean }[] }[];
  summary: {
    avg_calories: number;
    avg_protein: number;
    avg_carbs: number;
    avg_fat: number;
  };
}

interface MealSettings {
  enabled: boolean;
  dishCount: number;
  includeSoup: boolean;
}

interface FormData {
  cuisines: string[];
  diets: string[];
  calories: string;
  allergies: string;
  servings: number;
  mealSettings: Record<string, MealSettings>;
  days: string;
  soupMeal: 'lunch' | 'dinner' | null;
}

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaidPlan, loading: subscriptionLoading } = useSubscription();
  const { addItem: addToDbCart } = useCart();
  const { addToCart } = useAppStore();
  
  const { data: userPreferences } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_preferences')
        .select('dietary_restrictions')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });
  
  const initialMealSettings: Record<string, MealSettings> = {};
  MEAL_TYPES.forEach(meal => {
    initialMealSettings[meal.id] = {
      enabled: ['breakfast', 'lunch', 'dinner'].includes(meal.id),
      dishCount: 1,
      includeSoup: false,
    };
  });
  
  const [formData, setFormData] = useState<FormData>({
    cuisines: [],
    diets: [],
    calories: '',
    allergies: '',
    servings: 2,
    mealSettings: initialMealSettings,
    days: '7',
    soupMeal: null,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{ day: number; meal: MealPlanMeal } | null>(null);
  const [activeTab, setActiveTab] = useState('plan');
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number; meal: MealPlanMeal } | null>(null);
  const [editedMealName, setEditedMealName] = useState('');
  const [editedMealCalories, setEditedMealCalories] = useState('');
  
  useEffect(() => {
    if (userPreferences?.dietary_restrictions && userPreferences.dietary_restrictions.length > 0) {
      const mapping: Record<string, string> = {
        'Вегетарианство': 'vegetarian',
        'Веганство': 'vegan',
        'Без глютена': 'gluten_free',
        'Без лактозы': 'lactose_free',
        'Кето': 'keto',
        'Палео': 'paleo',
      };
      const mappedDiets = userPreferences.dietary_restrictions
        .map((r: string) => mapping[r] || r.toLowerCase())
        .filter((d: string) => DIET_TYPES.some(dt => dt.id === d));
      
      if (mappedDiets.length > 0) {
        setFormData(prev => ({ ...prev, diets: mappedDiets }));
      }
    }
  }, [userPreferences]);
  
  const toggleCuisine = (id: string) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(id) ? prev.cuisines.filter(c => c !== id) : [...prev.cuisines, id]
    }));
  };
  
  const toggleDiet = (id: string) => {
    setFormData(prev => ({
      ...prev,
      diets: prev.diets.includes(id) ? prev.diets.filter(d => d !== id) : [...prev.diets, id]
    }));
  };
  
  const toggleMeal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      mealSettings: {
        ...prev.mealSettings,
        [id]: { ...prev.mealSettings[id], enabled: !prev.mealSettings[id].enabled }
      }
    }));
  };
  
  const setMealDishCount = (id: string, count: number) => {
    setFormData(prev => ({
      ...prev,
      mealSettings: {
        ...prev.mealSettings,
        [id]: { ...prev.mealSettings[id], dishCount: count }
      }
    }));
  };
  
  const setSoupMeal = (mealId: 'lunch' | 'dinner' | null) => {
    setFormData(prev => {
      const newSettings = { ...prev.mealSettings };
      Object.keys(newSettings).forEach(key => {
        newSettings[key] = { ...newSettings[key], includeSoup: false };
      });
      if (mealId) {
        newSettings[mealId] = { ...newSettings[mealId], includeSoup: true };
      }
      return { ...prev, mealSettings: newSettings, soupMeal: mealId };
    });
  };
  
  const handleGenerate = async () => {
    if (isGenerating) return;
    const enabledMeals = Object.entries(formData.mealSettings)
      .filter(([_, settings]) => settings.enabled)
      .map(([id]) => id);
    
    if (enabledMeals.length === 0) {
      toast.error('Выберите хотя бы один приём пищи');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);
    
    try {
      const mealsData = enabledMeals.map(id => ({
        type: MEAL_TYPES.find(m => m.id === id)?.label || id,
        dishCount: formData.mealSettings[id].dishCount,
        includeSoup: formData.mealSettings[id].includeSoup,
      }));
      
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          cuisines: formData.cuisines.map(c => CUISINE_TYPES.find(ct => ct.id === c)?.label).filter(Boolean),
          diets: formData.diets.map(d => DIET_TYPES.find(dt => dt.id === d)?.label).filter(Boolean),
          calories: formData.calories ? parseInt(formData.calories) : null,
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          servings: formData.servings,
          meals: mealsData,
          days: parseInt(formData.days),
        }
      });
      
      if (error || data?.error) throw new Error(error?.message || data?.error || 'Ошибка сервиса');
      
      setGeneratedPlan(data.plan);
      setGenerationProgress(100);
      setActiveTab('plan');
      setExpandedDays([1]);
      toast.success('План питания создан!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Ошибка при генерации');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleSaveRecipeToDb = async (meal: MealPlanMeal) => {
    if (!user) return toast.error('Войдите в аккаунт');
    setIsSavingRecipe(true);
    try {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          name: meal.name,
          image: meal.image_url || `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(meal.photo_search_query)},food`,
          time_minutes: meal.recipe.cooking_time,
          servings: meal.recipe.servings,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          author_id: user.id,
          is_user_created: true,
          category: 'Сгенерировано ИИ',
        })
        .select().single();
      
      if (recipeError) throw recipeError;

      await supabase.from('recipe_ingredients').insert(
        meal.recipe.ingredients.map(ing => ({ recipe_id: recipe.id, name: ing.name, amount: ing.amount }))
      );
      
      await supabase.from('recipe_steps').insert(
        meal.recipe.steps.map((step, idx) => ({ recipe_id: recipe.id, step_number: idx + 1, description: step }))
      );
      
      toast.success(`"${meal.name}" сохранён!`);
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const toggleShoppingItem = (categoryIndex: number, itemIndex: number) => {
    if (!generatedPlan) return;
    const newPlan = { ...generatedPlan };
    newPlan.shopping_list[categoryIndex].items[itemIndex].checked = !newPlan.shopping_list[categoryIndex].items[itemIndex].checked;
    setGeneratedPlan(newPlan);
  };

  const handleAddToCart = async () => {
    if (!generatedPlan) return;
    const items = generatedPlan.shopping_list.flatMap(cat => cat.items.filter(i => !i.checked).map(i => ({ ...i, category: cat.category })));
    for (const item of items) {
      const amountMatch = item.amount.match(/^([\d.,]+)/);
      const quantity = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 1;
      const unit = item.amount.replace(/^[\d.,]+\s*/, '') || 'шт';
      if (user) await addToDbCart(item.name, Math.ceil(quantity), unit, item.category);
      else addToCart({ id: `gen-${item.name}`, name: item.name, category: item.category, image: '/placeholder.svg', price: 0, unit, rating: 0, reviewCount: 0 }, Math.ceil(quantity));
    }
    toast.success('Товары добавлены в корзину');
  };

  const handleEditMeal = (dayIndex: number, mealIndex: number, meal: MealPlanMeal) => {
    setEditingMeal({ dayIndex, mealIndex, meal });
    setEditedMealName(meal.name);
    setEditedMealCalories(meal.calories.toString());
  };

  const handleSaveEditedMeal = () => {
    if (!editingMeal || !generatedPlan) return;
    const newPlan = { ...generatedPlan };
    const day = newPlan.days[editingMeal.dayIndex];
    day.meals[editingMeal.mealIndex].meal.name = editedMealName;
    day.meals[editingMeal.mealIndex].meal.calories = parseInt(editedMealCalories) || day.meals[editingMeal.mealIndex].meal.calories;
    day.total_calories = day.meals.reduce((sum, m) => sum + m.meal.calories, 0);
    setGeneratedPlan(newPlan);
    setEditingMeal(null);
    toast.success('Обновлено');
  };

  const handleDeleteMeal = (dayIndex: number, mealIndex: number) => {
    if (!generatedPlan) return;
    const newPlan = { ...generatedPlan };
    newPlan.days[dayIndex].meals.splice(mealIndex, 1);
    newPlan.days[dayIndex].total_calories = newPlan.days[dayIndex].meals.reduce((sum, m) => sum + m.meal.calories, 0);
    setGeneratedPlan(newPlan);
  };

  const exportToPDF = () => {
    if (!generatedPlan) return;
    const doc = new jsPDF();
    let y = 20;
    doc.text('План питания', 105, y, { align: 'center' });
    y += 15;
    generatedPlan.days.forEach(day => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`День ${day.day} (${day.total_calories} ккал)`, 20, y);
      y += 8;
      day.meals.forEach(m => {
        doc.text(`- ${m.type}: ${m.meal.name}`, 25, y);
        y += 6;
      });
      y += 5;
    });
    doc.save('meal-plan.pdf');
  };

  if (!subscriptionLoading && !hasPaidPlan) {
    return (
      <div className="page-container flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="bg-amber-500 p-4 rounded-full mb-6"><Crown className="h-12 w-12 text-white" /></div>
        <h2 className="text-2xl font-bold mb-3">Премиум-функция</h2>
        <p className="text-muted-foreground mb-6">Доступно только в платных тарифах</p>
        <Button onClick={() => navigate('/profile/premium')} className="bg-amber-500">Перейти на Premium</Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500 p-2 rounded-xl"><Sparkles className="h-5 w-5 text-white" /></div>
          <div><h1 className="text-lg font-bold">Генератор меню</h1><p className="text-xs text-muted-foreground">Персональный план с ИИ</p></div>
        </div>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-6">
          <section>
            <Label className="flex items-center gap-2 mb-3 font-semibold"><ChefHat className="h-5 w-5 text-primary" /> Тип кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(c => (
                <Badge key={c.id} variant={formData.cuisines.includes(c.id) ? "default" : "outline"} className="cursor-pointer py-1.5 px-3" onClick={() => toggleCuisine(c.id)}>
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <Label className="flex items-center gap-2 mb-3 font-semibold"><Apple className="h-5 w-5 text-green-500" /> Диета</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <Badge key={d.id} variant={formData.diets.includes(d.id) ? "secondary" : "outline"} className={`cursor-pointer py-1.5 px-3 ${formData.diets.includes(d.id) ? 'bg-green-500 text-white' : ''}`} onClick={() => toggleDiet(d.id)}>
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ккал/день</Label><Input type="number" placeholder="1800" value={formData.calories} onChange={e => setFormData(p => ({ ...p, calories: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Аллергии</Label><Input placeholder="орехи..." value={formData.allergies} onChange={e => setFormData(p => ({ ...p, allergies: e.target.value }))} /></div>
          </div>

          <section>
            <Label className="flex items-center gap-2 mb-3 font-semibold"><Users className="h-5 w-5 text-blue-500" /> Порций: {formData.servings}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button key={n} onClick={() => setFormData(p => ({ ...p, servings: n }))} className={`w-full h-10 rounded-lg ${formData.servings === n ? 'bg-blue-500 text-white' : 'bg-muted'}`}>{n}</button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="font-bold">Приёмы пищи</Label>
            {MEAL_TYPES.map(meal => (
              <div key={meal.id} className={`p-3 rounded-xl border flex items-center justify-between ${formData.mealSettings[meal.id].enabled ? 'border-primary bg-primary/5' : ''}`}>
                <label className="flex items-center gap-3 cursor-pointer"><Checkbox checked={formData.mealSettings[meal.id].enabled} onCheckedChange={() => toggleMeal(meal.id)} /><span>{meal.emoji} {meal.label}</span></label>
                {formData.mealSettings[meal.id].enabled && (
                  <Select value={formData.mealSettings[meal.id].dishCount.toString()} onValueChange={v => setMealDishCount(meal.id, parseInt(v))}>
                    <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="1">1 блюдо</SelectItem><SelectItem value="2">2 блюда</SelectItem><SelectItem value="3">3 блюда</SelectItem></SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </section>

          <section className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Label className="flex items-center gap-2 mb-3 font-semibold"><Soup className="h-5 w-5 text-amber-600" /> Первое блюдо (суп)</Label>
            <div className="flex gap-2">
              <Button variant={!formData.soupMeal ? "default" : "outline"} className="flex-1" onClick={() => setSoupMeal(null)}>Без супа</Button>
              {['lunch', 'dinner'].map(mId => formData.mealSettings[mId].enabled && (
                <Button key={mId} variant={formData.soupMeal === mId ? "default" : "outline"} className="flex-1" onClick={() => setSoupMeal(mId as any)}>🍲 {mId === 'lunch' ? 'Обед' : 'Ужин'}</Button>
              ))}
            </div>
          </section>

          <section>
            <Label className="flex items-center gap-2 mb-3 font-semibold"><Calendar className="h-5 w-5 text-purple-500" /> Срок</Label>
            <div className="flex gap-2">
              {DAY_OPTIONS.map(opt => (
                <Button key={opt.value} variant={formData.days === opt.value ? "default" : "outline"} className="flex-1" onClick={() => setFormData(p => ({ ...p, days: opt.value }))}>{opt.label}</Button>
              ))}
            </div>
          </section>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600">
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5" />} Создать
          </Button>
          {isGenerating && <Progress value={generationProgress} className="h-2" />}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="plan">📅 План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Покупки</TabsTrigger>
              <TabsTrigger value="export">💾 Экспорт</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center p-4 bg-muted rounded-xl">
                <div><p className="text-xl font-bold">{generatedPlan.summary.avg_calories}</p><p className="text-[10px]">ккал</p></div>
                <div><p className="text-xl font-bold text-green-600">{generatedPlan.summary.avg_protein}г</p><p className="text-[10px]">белки</p></div>
                <div><p className="text-xl font-bold text-orange-600">{generatedPlan.summary.avg_carbs}г</p><p className="text-[10px]">углеводы</p></div>
                <div><p className="text-xl font-bold text-yellow-600">{generatedPlan.summary.avg_fat}г</p><p className="text-[10px]">жиры</p></div>
              </div>

              {generatedPlan.days.map((day, dIdx) => (
                <Collapsible key={day.day} open={expandedDays.includes(day.day)} onOpenChange={o => setExpandedDays(p => o ? [...p, day.day] : p.filter(x => x !== day.day))}>
                  <Card>
                    <CollapsibleTrigger className="w-full p-4 flex justify-between items-center">
                      <span className="font-bold">День {day.day}</span>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{day.total_calories} ккал</span><ChevronDown className="h-4" /></div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0 space-y-2">
                      {day.meals.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                          <div className="flex-1 cursor-pointer" onClick={() => setSelectedMeal({ day: day.day, meal: m.meal })}>
                            <p className="text-[10px] uppercase text-muted-foreground">{m.type}</p>
                            <p className="font-medium">{m.meal.name}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditMeal(dIdx, mIdx, m.meal)}><Pencil className="h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMeal(dIdx, mIdx)}><Trash2 className="h-4" /></Button>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setGeneratedPlan(null)}>Новый план</Button>
            </TabsContent>

            <TabsContent value="shopping" className="space-y-4">
              {generatedPlan.shopping_list.map((cat, cIdx) => (
                <Card key={cIdx} className="p-4">
                  <h3 className="font-bold mb-3 border-b pb-2">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, iIdx) => (
                      <label key={iIdx} className="flex justify-between items-center cursor-pointer">
                        <div className="flex gap-2"><Checkbox checked={item.checked} onCheckedChange={() => toggleShoppingItem(cIdx, iIdx)} /> <span className={item.checked ? 'line-through text-muted-foreground' : ''}>{item.name}</span></div>
                        <span className="text-xs text-muted-foreground">{item.amount}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
              <Button onClick={handleAddToCart} className="w-full"><ShoppingCart className="mr-2 h-4" /> В корзину</Button>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card className="p-6 flex flex-col gap-4">
                <Button onClick={exportToPDF} variant="outline"><FileText className="mr-2 h-4" /> Сохранить PDF</Button>
                <Button onClick={() => toast.success('Скопировано!')} variant="outline"><Share2 className="mr-2 h-4" /> Поделиться</Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-4">
              <DialogTitle className="text-xl">{selectedMeal.meal.name}</DialogTitle>
              <img src={selectedMeal.meal.image_url || '/placeholder.svg'} className="w-full aspect-video object-cover rounded-xl" />
              <div className="grid grid-cols-4 text-center border-y py-3">
                <div className="font-bold">{selectedMeal.meal.calories}<p className="text-[10px] font-normal">ккал</p></div>
                <div className="text-green-600 font-bold">{selectedMeal.meal.protein}г<p className="text-[10px] font-normal">белки</p></div>
                <div className="text-orange-600 font-bold">{selectedMeal.meal.carbs}г<p className="text-[10px] font-normal">углеводы</p></div>
                <div className="text-yellow-600 font-bold">{selectedMeal.meal.fat}г<p className="text-[10px] font-normal">жиры</p></div>
              </div>
              <div><h4 className="font-bold mb-2">Ингредиенты:</h4>
                <ul className="text-sm space-y-1">{selectedMeal.meal.recipe.ingredients.map((ing, i) => (<li key={i} className="flex justify-between"><span>{ing.name}</span><span className="text-muted-foreground">{ing.amount}</span></li>))}</ul>
              </div>
              <div><h4 className="font-bold mb-2">Приготовление:</h4>
                <ol className="text-sm space-y-2">{selectedMeal.meal.recipe.steps.map((step, i) => (<li key={i} className="flex gap-2"><b>{i+1}.</b> {step}</li>))}</ol>
              </div>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => handleSaveRecipeToDb(selectedMeal.meal)}>В рецепты</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
        <DialogContent className="max-w-xs">
          <DialogTitle>Редактировать</DialogTitle>
          <div className="space-y-4 pt-4">
            <Label>Название</Label><Input value={editedMealName} onChange={e => setEditedMealName(e.target.value)} />
            <Label>Калории</Label><Input type="number" value={editedMealCalories} onChange={e => setEditedMealCalories(e.target.value)} />
            <Button className="w-full" onClick={handleSaveEditedMeal}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
