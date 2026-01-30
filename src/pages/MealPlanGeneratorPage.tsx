import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChefHat, Calendar, Users, Flame, Apple, 
  Download, FileText, ShoppingCart, Heart, BookOpen,
  Check, X, Loader2, AlertCircle, ChevronDown
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { useQuery } from '@tanstack/react-query';

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
  { id: 'breakfast', label: 'Завтрак', emoji: '🍳' },
  { id: 'snack1', label: 'Перекус 1', emoji: '🍎' },
  { id: 'lunch', label: 'Обед', emoji: '🍲' },
  { id: 'snack2', label: 'Перекус 2', emoji: '🥜' },
  { id: 'dinner', label: 'Ужин', emoji: '🥗' },
  { id: 'late_snack', label: 'Поздний ужин', emoji: '🌙' },
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

interface FormData {
  cuisines: string[];
  diets: string[];
  calories: string;
  allergies: string;
  servings: number;
  meals: string[];
  days: string;
}

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch user preferences for dietary restrictions
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
  
  const [formData, setFormData] = useState<FormData>({
    cuisines: [],
    diets: [],
    calories: '',
    allergies: '',
    servings: 2,
    meals: ['breakfast', 'lunch', 'dinner'],
    days: '7',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{ day: number; meal: MealPlanMeal } | null>(null);
  const [mealImages, setMealImages] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('plan');
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  
  // Load user dietary restrictions as defaults
  useEffect(() => {
    if (userPreferences?.dietary_restrictions && userPreferences.dietary_restrictions.length > 0) {
      // Map profile dietary restrictions to our diet type IDs
      const mappedDiets = userPreferences.dietary_restrictions.map((r: string) => {
        const mapping: Record<string, string> = {
          'Вегетарианство': 'vegetarian',
          'Веганство': 'vegan',
          'Без глютена': 'gluten_free',
          'Без лактозы': 'lactose_free',
          'Кето': 'keto',
          'Палео': 'paleo',
        };
        return mapping[r] || r.toLowerCase();
      }).filter((d: string) => DIET_TYPES.some(dt => dt.id === d));
      
      if (mappedDiets.length > 0) {
        setFormData(prev => ({ ...prev, diets: mappedDiets }));
      }
    }
  }, [userPreferences]);
  
  const toggleCuisine = (id: string) => {
    setFormData(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(id)
        ? prev.cuisines.filter(c => c !== id)
        : [...prev.cuisines, id]
    }));
  };
  
  const toggleDiet = (id: string) => {
    setFormData(prev => ({
      ...prev,
      diets: prev.diets.includes(id)
        ? prev.diets.filter(d => d !== id)
        : [...prev.diets, id]
    }));
  };
  
  const toggleMeal = (id: string) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.includes(id)
        ? prev.meals.filter(m => m !== id)
        : [...prev.meals, id]
    }));
  };
  
  const handleGenerate = async () => {
    if (formData.meals.length === 0) {
      toast.error('Выберите хотя бы один приём пищи');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 500);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          cuisines: formData.cuisines.map(c => CUISINE_TYPES.find(ct => ct.id === c)?.label).filter(Boolean),
          diets: formData.diets.map(d => DIET_TYPES.find(dt => dt.id === d)?.label).filter(Boolean),
          calories: formData.calories ? parseInt(formData.calories) : null,
          allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
          servings: formData.servings,
          meals: formData.meals.map(m => MEAL_TYPES.find(mt => mt.id === m)?.label).filter(Boolean),
          days: parseInt(formData.days),
        }
      });
      
      if (error) throw error;
      
      setGenerationProgress(100);
      setGeneratedPlan(data.plan);
      setActiveTab('plan');
      setExpandedDays([1]);
      
      toast.success('План питания создан!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Ошибка при генерации плана');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };
  
  const getMealImage = async (query: string): Promise<string> => {
    if (mealImages[query]) return mealImages[query];
    
    const imageUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(query)},food`;
    setMealImages(prev => ({ ...prev, [query]: imageUrl }));
    return imageUrl;
  };
  
  const handleAddToFavorites = async (meal: MealPlanMeal) => {
    if (!user) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }
    
    toast.success(`"${meal.name}" добавлено в избранное`);
  };
  
  const handleAddToMyRecipes = async (meal: MealPlanMeal) => {
    if (!user) {
      toast.error('Войдите, чтобы сохранить рецепт');
      return;
    }
    
    toast.success(`"${meal.name}" добавлено в ваши рецепты`);
  };
  
  const toggleShoppingItem = (categoryIndex: number, itemIndex: number) => {
    if (!generatedPlan) return;
    
    const newPlan = { ...generatedPlan };
    newPlan.shopping_list[categoryIndex].items[itemIndex].checked = 
      !newPlan.shopping_list[categoryIndex].items[itemIndex].checked;
    setGeneratedPlan(newPlan);
  };
  
  const handleAddToCart = () => {
    if (!generatedPlan) return;
    
    const uncheckedItems = generatedPlan.shopping_list
      .flatMap(c => c.items.filter(i => !i.checked))
      .length;
    
    toast.success(`${uncheckedItems} товаров добавлено в корзину`);
  };
  
  const exportToPDF = () => {
    if (!generatedPlan) return;
    
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(20);
    doc.text('План питания', 105, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Создано: ${new Date().toLocaleDateString('ru-RU')}`, 20, y);
    y += 10;
    
    generatedPlan.days.forEach(day => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`День ${day.day}`, 20, y);
      y += 8;
      
      doc.setFontSize(10);
      day.meals.forEach(m => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${m.type}: ${m.meal.name} (${m.meal.calories} ккал)`, 25, y);
        y += 6;
      });
      
      y += 5;
    });
    
    doc.save('meal-plan.pdf');
    toast.success('PDF сохранён');
  };
  
  const exportToTXT = () => {
    if (!generatedPlan) return;
    
    let text = 'ПЛАН ПИТАНИЯ\n';
    text += `Создано: ${new Date().toLocaleDateString('ru-RU')}\n\n`;
    
    generatedPlan.days.forEach(day => {
      text += `=== День ${day.day} ===\n`;
      day.meals.forEach(m => {
        text += `${m.type}: ${m.meal.name} (${m.meal.calories} ккал)\n`;
      });
      text += `Всего: ${day.total_calories} ккал\n\n`;
    });
    
    text += '\n=== СПИСОК ПОКУПОК ===\n';
    generatedPlan.shopping_list.forEach(cat => {
      text += `\n${cat.category}:\n`;
      cat.items.forEach(item => {
        text += `- ${item.name}: ${item.amount}\n`;
      });
    });
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('TXT сохранён');
  };
  
  return (
    <div className="page-container pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Генератор меню</h1>
              <p className="text-xs text-muted-foreground">Персональный план питания с ИИ</p>
            </div>
          </div>
        </div>
      </header>
      
      {!generatedPlan ? (
        // Form
        <div className="p-4 space-y-6">
          {/* Cuisine Types */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2 mb-3">
              <ChefHat className="h-5 w-5 text-primary" />
              Тип кухни
            </Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(cuisine => (
                <button
                  key={cuisine.id}
                  onClick={() => toggleCuisine(cuisine.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.cuisines.includes(cuisine.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {cuisine.emoji} {cuisine.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Diet Types */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2 mb-3">
              <Apple className="h-5 w-5 text-green-500" />
              Диета
              {userPreferences?.dietary_restrictions && userPreferences.dietary_restrictions.length > 0 && (
                <Badge variant="outline" className="text-xs">Из профиля</Badge>
              )}
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(diet => (
                <button
                  key={diet.id}
                  onClick={() => toggleDiet(diet.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.diets.includes(diet.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {diet.emoji} {diet.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Calories & Allergies */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Калории/день
              </Label>
              <Input
                type="number"
                placeholder="1800"
                value={formData.calories}
                onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Аллергии
              </Label>
              <Input
                placeholder="орехи, морепродукты..."
                value={formData.allergies}
                onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
              />
            </div>
          </div>
          
          {/* Servings */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-500" />
              Порций (едоков): {formData.servings}
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setFormData(prev => ({ ...prev, servings: n }))}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    formData.servings === n
                      ? 'bg-blue-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          
          {/* Meal Types */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Приёмы пищи</Label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(meal => (
                <label
                  key={meal.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.meals.includes(meal.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Checkbox
                    checked={formData.meals.includes(meal.id)}
                    onCheckedChange={() => toggleMeal(meal.id)}
                  />
                  <span className="text-lg">{meal.emoji}</span>
                  <span className="text-sm font-medium">{meal.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Days */}
          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              Количество дней
            </Label>
            <RadioGroup
              value={formData.days}
              onValueChange={(value) => setFormData(prev => ({ ...prev, days: value }))}
              className="flex gap-2"
            >
              {DAY_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.days === option.value
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-border hover:border-purple-500/50'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          
          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Генерируем...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Сгенерировать план
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                ИИ составляет ваш персональный план...
              </p>
            </div>
          )}
        </div>
      ) : (
        // Results
        <div className="flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="w-full grid grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="plan" className="gap-1.5">
                <Calendar className="h-4 w-4" />
                План
              </TabsTrigger>
              <TabsTrigger value="shopping" className="gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                Покупки
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-1.5">
                <Download className="h-4 w-4" />
                Экспорт
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="plan" className="p-4 space-y-4 mt-0">
              {/* Summary */}
              <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-violet-600">{generatedPlan.summary.avg_calories}</p>
                      <p className="text-xs text-muted-foreground">ккал/день</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{generatedPlan.summary.avg_protein}г</p>
                      <p className="text-xs text-muted-foreground">белки</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{generatedPlan.summary.avg_carbs}г</p>
                      <p className="text-xs text-muted-foreground">углеводы</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{generatedPlan.summary.avg_fat}г</p>
                      <p className="text-xs text-muted-foreground">жиры</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Days */}
              {generatedPlan.days.map(day => (
                <Collapsible
                  key={day.day}
                  open={expandedDays.includes(day.day)}
                  onOpenChange={(open) => {
                    setExpandedDays(prev => 
                      open ? [...prev, day.day] : prev.filter(d => d !== day.day)
                    );
                  }}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-sm">
                              День {day.day}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {day.total_calories} ккал
                            </span>
                          </CardTitle>
                          <ChevronDown className={`h-5 w-5 transition-transform ${
                            expandedDays.includes(day.day) ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-2">
                        {day.meals.map((m, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedMeal({ day: day.day, meal: m.meal })}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                          >
                            <div className="text-2xl">
                              {MEAL_TYPES.find(mt => mt.label === m.type)?.emoji || '🍽️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">{m.type}</p>
                              <p className="font-medium truncate">{m.meal.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-primary">{m.meal.calories}</p>
                              <p className="text-xs text-muted-foreground">ккал</p>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setGeneratedPlan(null)}
                className="w-full"
              >
                Создать новый план
              </Button>
            </TabsContent>
            
            <TabsContent value="shopping" className="p-4 space-y-4 mt-0">
              {generatedPlan.shopping_list.map((category, catIdx) => (
                <Card key={catIdx}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {category.items.map((item, itemIdx) => (
                      <label
                        key={itemIdx}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={item.checked || false}
                          onCheckedChange={() => toggleShoppingItem(catIdx, itemIdx)}
                        />
                        <span className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {item.name}
                        </span>
                        <span className="text-sm text-muted-foreground">{item.amount}</span>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              ))}
              
              <Button onClick={handleAddToCart} className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Добавить в корзину
              </Button>
            </TabsContent>
            
            <TabsContent value="export" className="p-4 space-y-4 mt-0">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center mb-4">
                    <Download className="h-12 w-12 mx-auto text-primary mb-2" />
                    <h3 className="font-semibold">Экспорт плана</h3>
                    <p className="text-sm text-muted-foreground">
                      Сохраните план питания на устройство
                    </p>
                  </div>
                  
                  <Button onClick={exportToPDF} className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Скачать PDF
                  </Button>
                  
                  <Button onClick={exportToTXT} className="w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Скачать TXT
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Recipe Modal */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMeal.meal.name}</DialogTitle>
              </DialogHeader>
              
              {/* Image */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                <img
                  src={`https://source.unsplash.com/featured/800x600/?${encodeURIComponent(selectedMeal.meal.photo_search_query)},food`}
                  alt={selectedMeal.meal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Nutrition */}
              <div className="grid grid-cols-4 gap-2 text-center py-3 border-y">
                <div>
                  <p className="text-lg font-bold">{selectedMeal.meal.calories}</p>
                  <p className="text-xs text-muted-foreground">ккал</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{selectedMeal.meal.protein}г</p>
                  <p className="text-xs text-muted-foreground">белки</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{selectedMeal.meal.carbs}г</p>
                  <p className="text-xs text-muted-foreground">углеводы</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-600">{selectedMeal.meal.fat}г</p>
                  <p className="text-xs text-muted-foreground">жиры</p>
                </div>
              </div>
              
              {/* Info */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>⏱️ {selectedMeal.meal.recipe.cooking_time} мин</span>
                <span>👥 {selectedMeal.meal.recipe.servings} порций</span>
              </div>
              
              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-2">Ингредиенты:</h4>
                <ul className="space-y-1">
                  {selectedMeal.meal.recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span>{ing.name}</span>
                      <span className="text-muted-foreground">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Steps */}
              <div>
                <h4 className="font-semibold mb-2">Приготовление:</h4>
                <ol className="space-y-2">
                  {selectedMeal.meal.recipe.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleAddToFavorites(selectedMeal.meal)}
                >
                  <Heart className="h-4 w-4 mr-1.5" />
                  В избранное
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleAddToMyRecipes(selectedMeal.meal)}
                >
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  В рецепты
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
