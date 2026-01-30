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

// Meal types with dish count
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
  const [mealImages, setMealImages] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('plan');
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number; meal: MealPlanMeal } | null>(null);
  const [editedMealName, setEditedMealName] = useState('');
  const [editedMealCalories, setEditedMealCalories] = useState('');
  
  // Load user dietary restrictions as defaults
  useEffect(() => {
    if (userPreferences?.dietary_restrictions && userPreferences.dietary_restrictions.length > 0) {
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
      mealSettings: {
        ...prev.mealSettings,
        [id]: {
          ...prev.mealSettings[id],
          enabled: !prev.mealSettings[id].enabled,
        }
      }
    }));
  };
  
  const setMealDishCount = (id: string, count: number) => {
    setFormData(prev => ({
      ...prev,
      mealSettings: {
        ...prev.mealSettings,
        [id]: {
          ...prev.mealSettings[id],
          dishCount: count,
        }
      }
    }));
  };
  
  const setSoupMeal = (mealId: 'lunch' | 'dinner' | null) => {
    setFormData(prev => {
      const newSettings = { ...prev.mealSettings };
      // Reset all soup settings
      Object.keys(newSettings).forEach(key => {
        newSettings[key] = { ...newSettings[key], includeSoup: false };
      });
      // Set the new soup meal
      if (mealId) {
        newSettings[mealId] = { ...newSettings[mealId], includeSoup: true };
      }
      return {
        ...prev,
        mealSettings: newSettings,
        soupMeal: mealId,
      };
    });
  };
  
  const handleGenerate = async () => {
    // Prevent duplicate clicks / parallel invocations
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
      // Prepare meal data with dish counts and soup info
      const mealsData = enabledMeals.map(id => {
        const mealType = MEAL_TYPES.find(m => m.id === id);
        const settings = formData.mealSettings[id];
        return {
          type: mealType?.label || id,
          dishCount: settings.dishCount,
          includeSoup: settings.includeSoup,
        };
      });
      
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
      
      if (error) {
        console.error('Edge function error:', error);

        // supabase-js returns non-2xx responses as FunctionsHttpError and `data` will be null.
        // We still want to show a meaningful message for 429 (Gemini quota/rate limit).
        const ctx = (error as any)?.context;
        const status: number | undefined = typeof ctx?.status === 'number' ? ctx.status : undefined;

        let payload: any = null;
        if (typeof ctx?.json === 'function') {
          try {
            payload = await ctx.json();
          } catch {
            // ignore
          }
        }

        if (status === 429 || payload?.errorCode === 'RATE_LIMIT') {
          toast.error(
            payload?.error || 'Квота/лимит сервиса ИИ исчерпан (429). Проверьте биллинг/лимиты Gemini API и попробуйте позже.',
            { duration: 7000 }
          );
          throw new Error('RATE_LIMIT');
        }

        if (payload?.errorCode === 'CONFIG_ERROR') {
          toast.error(payload?.error || 'Сервис не настроен. Обратитесь в поддержку.');
          throw new Error('CONFIG_ERROR');
        }

        if (payload?.error) {
          toast.error(payload.error);
          throw new Error('EDGE_ERROR_HANDLED');
        }

        throw new Error(error.message || 'Ошибка вызова сервиса');
      }
      
      // Check for API-level errors in the response
      if (data?.error) {
        console.error('API error:', data.error, data.errorCode);
        
        // Show specific error messages based on error code
        if (data.errorCode === 'RATE_LIMIT') {
          toast.error('Сервис временно перегружен. Попробуйте через 2-3 минуты.', {
            duration: 5000,
          });
          throw new Error('RATE_LIMIT');
        } else if (data.errorCode === 'CONFIG_ERROR') {
          toast.error('Сервис не настроен. Обратитесь в поддержку.');
          throw new Error('CONFIG_ERROR');
        } else {
          throw new Error(data.error);
        }
      }
      
      if (!data?.plan) {
        throw new Error('Пустой ответ от сервиса');
      }
      
      // Generate images for each meal
      const planWithImages = { ...data.plan };
      const imagePromises: Promise<void>[] = [];
      
      for (let dayIdx = 0; dayIdx < planWithImages.days.length; dayIdx++) {
        const day = planWithImages.days[dayIdx];
        for (let mealIdx = 0; mealIdx < day.meals.length; mealIdx++) {
          const meal = day.meals[mealIdx].meal;
          
          // Generate image for this meal
          const promise = (async () => {
            try {
              const { data: imgData } = await supabase.functions.invoke('generate-meal-images', {
                body: {
                  mealName: meal.name,
                  searchQuery: meal.photo_search_query,
                  dayIndex: dayIdx,
                  mealIndex: mealIdx,
                }
              });
              
              if (imgData?.imageUrl) {
                planWithImages.days[dayIdx].meals[mealIdx].meal.image_url = imgData.imageUrl;
              }
            } catch (imgError) {
              console.log(`Failed to generate image for ${meal.name}, using fallback`);
              planWithImages.days[dayIdx].meals[mealIdx].meal.image_url = 
                `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(meal.photo_search_query)},food`;
            }
          })();
          
          imagePromises.push(promise);
        }
      }
      
      // Wait for all images to be generated (with timeout)
      await Promise.race([
        Promise.all(imagePromises),
        new Promise(resolve => setTimeout(resolve, 15000)) // 15 second timeout
      ]);
      
      setGenerationProgress(100);
      setGeneratedPlan(planWithImages);
      setActiveTab('plan');
      setExpandedDays([1]);
      
      toast.success('План питания создан с изображениями!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Only show generic error if we haven't already shown a specific toast
      if (!['RATE_LIMIT', 'CONFIG_ERROR', 'EDGE_ERROR_HANDLED'].includes(errorMessage)) {
        toast.error('Ошибка при генерации плана. Попробуйте ещё раз.');
      }
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };
  
  const handleSaveRecipeToDb = async (meal: MealPlanMeal) => {
    if (!user) {
      toast.error('Войдите, чтобы сохранить рецепт');
      return;
    }
    
    setIsSavingRecipe(true);
    
    try {
      // First, download and save the image
      let imageUrl = meal.image_url;
      if (!imageUrl) {
        // Generate a stable image URL from Unsplash
        imageUrl = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(meal.photo_search_query)},food`;
      }
      
      // Create the recipe in the database
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          name: meal.name,
          image: imageUrl,
          time_minutes: meal.recipe.cooking_time,
          servings: meal.recipe.servings,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          author_id: user.id,
          is_user_created: true,
          difficulty: 'medium',
          category: 'Сгенерировано ИИ',
        })
        .select()
        .single();
      
      if (recipeError) throw recipeError;
      
      // Add ingredients
      const ingredientsToInsert = meal.recipe.ingredients.map(ing => ({
        recipe_id: recipe.id,
        name: ing.name,
        amount: ing.amount,
      }));
      
      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert);
      
      if (ingredientsError) throw ingredientsError;
      
      // Add steps
      const stepsToInsert = meal.recipe.steps.map((step, idx) => ({
        recipe_id: recipe.id,
        step_number: idx + 1,
        description: step,
      }));
      
      const { error: stepsError } = await supabase
        .from('recipe_steps')
        .insert(stepsToInsert);
      
      if (stepsError) throw stepsError;
      
      toast.success(`"${meal.name}" сохранён в ваши рецепты!`);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Ошибка при сохранении рецепта');
    } finally {
      setIsSavingRecipe(false);
    }
  };
  
  const handleAddToFavorites = async (meal: MealPlanMeal) => {
    if (!user) {
      toast.error('Войдите, чтобы добавить в избранное');
      return;
    }
    
    // First save the recipe, then add to favorites
    await handleSaveRecipeToDb(meal);
  };
  
  const toggleShoppingItem = (categoryIndex: number, itemIndex: number) => {
    if (!generatedPlan) return;
    
    const newPlan = { ...generatedPlan };
    newPlan.shopping_list[categoryIndex].items[itemIndex].checked = 
      !newPlan.shopping_list[categoryIndex].items[itemIndex].checked;
    setGeneratedPlan(newPlan);
  };
  
  const handleAddToCart = async () => {
    if (!generatedPlan) return;
    
    const uncheckedItems = generatedPlan.shopping_list
      .flatMap(cat => cat.items.filter(i => !i.checked).map(i => ({ ...i, category: cat.category })));
    
    if (uncheckedItems.length === 0) {
      toast.info('Все товары уже отмечены');
      return;
    }
    
    let addedCount = 0;
    
    // Add each item to cart (DB or local depending on auth)
    for (const item of uncheckedItems) {
      try {
        // Parse amount to get quantity
        const amountMatch = item.amount.match(/^([\d.,]+)/);
        const quantity = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 1;
        const unit = item.amount.replace(/^[\d.,]+\s*/, '') || 'шт';
        
        if (user) {
          // Add to Supabase cart_items for authenticated users
          const success = await addToDbCart(item.name, Math.ceil(quantity) || 1, unit, item.category);
          if (success) addedCount++;
        } else {
          // Fallback to local Zustand store for guests
          addToCart({
            id: `generated-${item.name}-${Date.now()}`,
            name: item.name,
            category: item.category || 'Ингредиенты',
            image: '/placeholder.svg',
            price: 0,
            unit: unit,
            rating: 0,
            reviewCount: 0,
          }, Math.ceil(quantity) || 1);
          addedCount++;
        }
      } catch (error) {
        console.error(`Failed to add ${item.name} to cart:`, error);
      }
    }
    
    toast.success(`${addedCount} товаров добавлено в корзину`);
  };
  
  const handleShareMenu = async () => {
    if (!generatedPlan) return;
    
    let shareText = '🍽️ Мой план питания\n\n';
    
    generatedPlan.days.forEach(day => {
      shareText += `📅 День ${day.day}:\n`;
      day.meals.forEach(m => {
        shareText += `• ${m.type}: ${m.meal.name} (${m.meal.calories} ккал)\n`;
      });
      shareText += '\n';
    });
    
    shareText += `📊 Среднее в день: ${generatedPlan.summary.avg_calories} ккал\n`;
    shareText += '\nСоздано в Вигодно Тут 🛒';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Мой план питания',
          text: shareText,
        });
      } catch (error) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast.success('План скопирован в буфер обмена!');
    }
  };
  
  const handleEditMeal = (dayIndex: number, mealIndex: number, meal: MealPlanMeal) => {
    setEditingMeal({ dayIndex, mealIndex, meal });
    setEditedMealName(meal.name);
    setEditedMealCalories(meal.calories.toString());
  };
  
  const handleSaveEditedMeal = () => {
    if (!editingMeal || !generatedPlan) return;
    
    const newPlan = { ...generatedPlan };
    const dayIdx = editingMeal.dayIndex;
    const mealIdx = editingMeal.mealIndex;
    
    newPlan.days[dayIdx].meals[mealIdx].meal = {
      ...newPlan.days[dayIdx].meals[mealIdx].meal,
      name: editedMealName,
      calories: parseInt(editedMealCalories) || newPlan.days[dayIdx].meals[mealIdx].meal.calories,
    };
    
    // Recalculate day totals
    newPlan.days[dayIdx].total_calories = newPlan.days[dayIdx].meals.reduce(
      (sum, m) => sum + m.meal.calories, 0
    );
    
    // Recalculate summary
    const allMeals = newPlan.days.flatMap(d => d.meals.map(m => m.meal));
    const totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = allMeals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = allMeals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFat = allMeals.reduce((sum, m) => sum + m.fat, 0);
    const daysCount = newPlan.days.length;
    
    newPlan.summary = {
      avg_calories: Math.round(totalCalories / daysCount),
      avg_protein: Math.round(totalProtein / daysCount),
      avg_carbs: Math.round(totalCarbs / daysCount),
      avg_fat: Math.round(totalFat / daysCount),
    };
    
    setGeneratedPlan(newPlan);
    setEditingMeal(null);
    toast.success('Блюдо обновлено!');
  };
  
  const handleDeleteMeal = (dayIndex: number, mealIndex: number) => {
    if (!generatedPlan) return;
    
    const newPlan = { ...generatedPlan };
    newPlan.days[dayIndex].meals.splice(mealIndex, 1);
    
    // Recalculate day totals
    newPlan.days[dayIndex].total_calories = newPlan.days[dayIndex].meals.reduce(
      (sum, m) => sum + m.meal.calories, 0
    );
    
    setGeneratedPlan(newPlan);
    toast.success('Блюдо удалено');
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
  
  // Get weekday name for calendar view
  const getWeekdayName = (dayNum: number): string => {
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return weekdays[(dayNum - 1) % 7];
  };
  
  // Check premium access
  if (!subscriptionLoading && !hasPaidPlan) {
    return (
      <div className="page-container pb-24">
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
        
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full mb-6">
            <Crown className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Премиум-функция</h2>
          <p className="text-muted-foreground mb-6 max-w-sm">
            ИИ-генератор персонального меню доступен для пользователей платных тарифов
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <Button 
              onClick={() => navigate('/profile/premium')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Перейти на платный тариф
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              На главную
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
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
          
          {/* Meal Types with Dish Count */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Приёмы пищи</Label>
            <div className="space-y-3">
              {MEAL_TYPES.map(meal => (
                <div
                  key={meal.id}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.mealSettings[meal.id].enabled
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <Checkbox
                        checked={formData.mealSettings[meal.id].enabled}
                        onCheckedChange={() => toggleMeal(meal.id)}
                      />
                      <span className="text-lg">{meal.emoji}</span>
                      <span className="text-sm font-medium">{meal.label}</span>
                    </label>
                    
                    {formData.mealSettings[meal.id].enabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Блюд:</span>
                        <Select
                          value={formData.mealSettings[meal.id].dishCount.toString()}
                          onValueChange={(v) => setMealDishCount(meal.id, parseInt(v))}
                        >
                          <SelectTrigger className="w-16 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Soup option */}
            <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Label className="flex items-center gap-2 mb-3">
                <Soup className="h-5 w-5 text-amber-600" />
                Первое блюдо (суп)
              </Label>
              <RadioGroup
                value={formData.soupMeal || ''}
                onValueChange={(v) => setSoupMeal(v as 'lunch' | 'dinner' | null)}
                className="flex flex-wrap gap-2"
              >
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                  formData.soupMeal === null ? 'border-primary bg-primary/10' : 'border-border'
                }`}>
                  <RadioGroupItem value="" className="sr-only" />
                  <span className="text-sm">Без супа</span>
                </label>
                {formData.mealSettings.lunch.enabled && (
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                    formData.soupMeal === 'lunch' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}>
                    <RadioGroupItem value="lunch" className="sr-only" />
                    <span className="text-sm">🍲 На обед</span>
                  </label>
                )}
                {formData.mealSettings.dinner.enabled && (
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                    formData.soupMeal === 'dinner' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}>
                    <RadioGroupItem value="dinner" className="sr-only" />
                    <span className="text-sm">🥗 На ужин</span>
                  </label>
                )}
              </RadioGroup>
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
                Создать
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
              {/* View Mode Toggle */}
              <div className="flex justify-end gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-1" />
                  Список
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarDays className="h-4 w-4 mr-1" />
                  Календарь
                </Button>
              </div>
              
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
              
              {/* Days - List View */}
              {viewMode === 'list' && generatedPlan.days.map(day => (
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
                        {day.meals.map((m, mealIdx) => {
                          const dayIdx = generatedPlan.days.findIndex(d => d.day === day.day);
                          return (
                            <div
                              key={mealIdx}
                              className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <button
                                onClick={() => setSelectedMeal({ day: day.day, meal: m.meal })}
                                className="flex items-center gap-3 flex-1 text-left"
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
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMeal(dayIdx, mealIdx, m.meal);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMeal(dayIdx, mealIdx);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
              
              {/* Days - Calendar View */}
              {viewMode === 'calendar' && (
                <div className="grid grid-cols-7 gap-1">
                  {/* Weekday headers */}
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Day cells */}
                  {generatedPlan.days.map(day => (
                    <button
                      key={day.day}
                      onClick={() => {
                        setExpandedDays([day.day]);
                        setViewMode('list');
                      }}
                      className="aspect-square p-1 rounded-lg border bg-card hover:bg-muted transition-colors flex flex-col items-center justify-center"
                    >
                      <span className="text-lg font-bold">{day.day}</span>
                      <span className="text-[10px] text-muted-foreground">{day.total_calories}</span>
                      <span className="text-[10px] text-muted-foreground">ккал</span>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setGeneratedPlan(null)}
                  className="flex-1"
                >
                  Создать новый план
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareMenu}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Поделиться
                </Button>
              </div>
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
                  
                  <Button onClick={handleShareMenu} className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Поделиться меню
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
                  src={selectedMeal.meal.image_url || `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(selectedMeal.meal.photo_search_query)},food`}
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
                  disabled={isSavingRecipe}
                >
                  {isSavingRecipe ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4 mr-1.5" />
                  )}
                  В избранное
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleSaveRecipeToDb(selectedMeal.meal)}
                  disabled={isSavingRecipe}
                >
                  {isSavingRecipe ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <BookOpen className="h-4 w-4 mr-1.5" />
                  )}
                  В рецепты
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Meal Dialog */}
      <Dialog open={!!editingMeal} onOpenChange={() => setEditingMeal(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Редактировать блюдо
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Название блюда</Label>
              <Input
                value={editedMealName}
                onChange={(e) => setEditedMealName(e.target.value)}
                placeholder="Название блюда"
              />
            </div>
            <div>
              <Label>Калории</Label>
              <Input
                type="number"
                value={editedMealCalories}
                onChange={(e) => setEditedMealCalories(e.target.value)}
                placeholder="Калории"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingMeal(null)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSaveEditedMeal}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
