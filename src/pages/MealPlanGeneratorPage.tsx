import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChefHat,
  Calendar,
  Users,
  Flame,
  Apple,
  Download,
  FileText,
  ShoppingCart,
  Heart,
  BookOpen,
  Check,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  Share2,
  CalendarDays,
  List,
  Crown,
  Soup,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/stores/useAppStore";
import { useCart } from "@/hooks/useCart";

const CUISINE_TYPES = [
  { id: "italian", label: "Итальянская", emoji: "🍝" },
  { id: "french", label: "Французская", emoji: "🥐" },
  { id: "georgian", label: "Грузинская", emoji: "🫓" },
  { id: "russian", label: "Русская", emoji: "🥟" },
  { id: "japanese", label: "Японская", emoji: "🍣" },
  { id: "thai", label: "Тайская", emoji: "🍜" },
  { id: "mexican", label: "Мексиканская", emoji: "🌮" },
  { id: "indian", label: "Индийская", emoji: "🍛" },
  { id: "chinese", label: "Китайская", emoji: "🥡" },
  { id: "greek", label: "Греческая", emoji: "🥙" },
  { id: "spanish", label: "Испанская", emoji: "🥘" },
  { id: "korean", label: "Корейская", emoji: "🍲" },
  { id: "vietnamese", label: "Вьетнамская", emoji: "🍜" },
  { id: "american", label: "Американская", emoji: "🍔" },
  { id: "middle_eastern", label: "Ближневосточная", emoji: "🧆" },
  { id: "turkish", label: "Турецкая", emoji: "🥙" },
  { id: "moroccan", label: "Марокканская", emoji: "🥘" },
  { id: "brazilian", label: "Бразильская", emoji: "🍖" },
  { id: "mediterranean", label: "Средиземноморская", emoji: "🫒" },
  { id: "asian_fusion", label: "Азиатский фьюжн", emoji: "🥢" },
];

const DIET_TYPES = [
  { id: "vegan", label: "Веганская", emoji: "🌱" },
  { id: "keto", label: "Кето", emoji: "🥑" },
  { id: "paleo", label: "Палео", emoji: "🍖" },
  { id: "lactose_free", label: "Безлактозная", emoji: "🥛" },
  { id: "gluten_free", label: "Безглютеновая", emoji: "🌾" },
  { id: "vegetarian", label: "Вегетарианская", emoji: "🥬" },
  { id: "low_carb", label: "Низкоуглеводная", emoji: "📉" },
  { id: "high_protein", label: "Высокобелковая", emoji: "💪" },
];

const MEAL_TYPES = [
  { id: "breakfast", label: "Завтрак", emoji: "🍳" },
  { id: "snack1", label: "Перекус 1", emoji: "🍎" },
  { id: "lunch", label: "Обед", emoji: "🍲" },
  { id: "snack2", label: "Перекус 2", emoji: "🥜" },
  { id: "dinner", label: "Ужин", emoji: "🥗" },
  { id: "late_snack", label: "Поздний ужин", emoji: "🌙" },
];

const DAY_OPTIONS = [
  { value: "1", label: "1 день" },
  { value: "3", label: "3 дня" },
  { value: "7", label: "7 дней" },
  { value: "14", label: "14 дней" },
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
  meals: {
    type: string;
    meal: MealPlanMeal;
  }[];
  total_calories: number;
}

interface GeneratedMealPlan {
  meal_plan: MealPlanDay[];
  shopping_list: { category: string; items: { name: string; amount: string; checked?: boolean }[] }[];
  total_metrics: {
    calories_avg: number;
    protein: number;
    fat: number;
    carbs: number;
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
  soupMeal: "lunch" | "dinner" | null;
}

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaidPlan, loading: subscriptionLoading } = useSubscription();
  const { addItem: addToDbCart } = useCart();
  const { addToCart } = useAppStore();

  const { data: userPreferences } = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("user_preferences")
        .select("dietary_restrictions")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const initialMealSettings: Record<string, MealSettings> = {};
  MEAL_TYPES.forEach((meal) => {
    initialMealSettings[meal.id] = {
      enabled: ["breakfast", "lunch", "dinner"].includes(meal.id),
      dishCount: 1,
      includeSoup: false,
    };
  });

  const [formData, setFormData] = useState<FormData>({
    cuisines: [],
    diets: [],
    calories: "1800",
    allergies: "",
    servings: 2,
    mealSettings: initialMealSettings,
    days: "7",
    soupMeal: null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{ day: number; meal: MealPlanMeal } | null>(null);
  const [activeTab, setActiveTab] = useState("plan");
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const toggleCuisine = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(id) ? prev.cuisines.filter((c) => c !== id) : [...prev.cuisines, id],
    }));
  };

  const toggleDiet = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      diets: prev.diets.includes(id) ? prev.diets.filter((d) => d !== id) : [...prev.diets, id],
    }));
  };

  const toggleMeal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      mealSettings: {
        ...prev.mealSettings,
        [id]: { ...prev.mealSettings[id], enabled: !prev.mealSettings[id].enabled },
      },
    }));
  };

  const setMealDishCount = (id: string, count: number) => {
    setFormData((prev) => ({
      ...prev,
      mealSettings: {
        ...prev.mealSettings,
        [id]: { ...prev.mealSettings[id], dishCount: count },
      },
    }));
  };

  const setSoupMeal = (mealId: "lunch" | "dinner" | null) => {
    setFormData((prev) => {
      const newSettings = { ...prev.mealSettings };
      Object.keys(newSettings).forEach((key) => {
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
      toast.error("Выберите хотя бы один приём пищи");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          prompt_params: {
            cuisines: formData.cuisines.map((c) => CUISINE_TYPES.find((ct) => ct.id === c)?.label),
            diets: formData.diets.map((d) => DIET_TYPES.find((dt) => dt.id === d)?.label),
            calories: parseInt(formData.calories) || 2000,
            allergies: formData.allergies,
            days: parseInt(formData.days),
            servings: formData.servings,
            meals: enabledMeals.map((id) => ({
              type: MEAL_TYPES.find((m) => m.id === id)?.label,
              dishCount: formData.mealSettings[id].dishCount,
              includeSoup: formData.mealSettings[id].includeSoup,
            })),
          },
        },
      });

      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;

      setGeneratedPlan(result);
      setGenerationProgress(100);
      setActiveTab("plan");
      toast.success("План питания успешно сформирован!");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Ошибка: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!subscriptionLoading && !hasPaidPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Crown className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Премиум-функция</h2>
        <p className="text-muted-foreground mb-6">Подпишитесь на тариф "Семья", чтобы использовать ИИ-генератор.</p>
        <Button onClick={() => navigate("/profile/premium")}>Улучшить тариф</Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b p-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Генератор меню</h1>
            <p className="text-xs text-muted-foreground">Персональный план питания с ИИ</p>
          </div>
        </div>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-6">
          {/* Кухни мира */}
          <section>
            <Label className="text-base font-semibold flex items-center gap-2 mb-3">
              <ChefHat className="h-5 w-5 text-primary" />
              Тип кухни
            </Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleCuisine(c.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.cuisines.includes(c.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </section>

          {/* Диета */}
          <section>
            <Label className="text-base font-semibold flex items-center gap-2 mb-3">
              <Apple className="h-5 w-5 text-green-500" />
              Диета
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDiet(d.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.diets.includes(d.id) ? "bg-green-500 text-white" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {d.emoji} {d.label}
                </button>
              ))}
            </div>
          </section>

          {/* Калории и Аллергии */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Калории/день
              </Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" /> Аллергии
              </Label>
              <Input
                placeholder="орехи, лактоза..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>
          </div>

          {/* Порции */}
          <section>
            <Label className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-500" /> Порций (едоков): {formData.servings}
            </Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setFormData((prev) => ({ ...prev, servings: n }))}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    formData.servings === n ? "bg-blue-500 text-white" : "bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* Приёмы пищи */}
          <section className="space-y-3">
            <Label className="text-base font-semibold block mb-2">Приёмы пищи</Label>
            {MEAL_TYPES.map((meal) => (
              <div
                key={meal.id}
                className={`p-3 rounded-xl border transition-all ${formData.mealSettings[meal.id].enabled ? "border-primary bg-primary/5" : "border-border"}`}
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
          </section>

          {/* Выбор супа */}
          <section className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Label className="flex items-center gap-2 mb-3 text-amber-700 font-semibold">
              <Soup className="h-5 w-5" /> Первое блюдо (суп)
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSoupMeal(null)}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${formData.soupMeal === null ? "bg-white border-amber-500 shadow-sm" : "bg-transparent border-amber-200"}`}
              >
                Без супа
              </button>
              {formData.mealSettings.lunch.enabled && (
                <button
                  onClick={() => setSoupMeal("lunch")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${formData.soupMeal === "lunch" ? "bg-white border-amber-500 shadow-sm" : "bg-transparent border-amber-200"}`}
                >
                  🍲 На обед
                </button>
              )}
              {formData.mealSettings.dinner.enabled && (
                <button
                  onClick={() => setSoupMeal("dinner")}
                  className={`px-4 py-2 rounded-lg border text-sm transition-all ${formData.soupMeal === "dinner" ? "bg-white border-amber-500 shadow-sm" : "bg-transparent border-amber-200"}`}
                >
                  🥣 На ужин
                </button>
              )}
            </div>
          </section>

          {/* Количество дней */}
          <section>
            <Label className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-purple-500" /> Количество дней
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {DAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFormData({ ...formData, days: opt.value })}
                  className={`py-3 rounded-xl border text-sm font-medium transition-all ${formData.days === opt.value ? "border-purple-500 bg-purple-50 text-purple-700" : "bg-muted"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <Button
            className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isGenerating ? "Генерируем план..." : "Создать"}
          </Button>
          {isGenerating && <Progress value={generationProgress} className="h-2" />}
        </div>
      ) : (
        /* UI РЕЗУЛЬТАТОВ (Остается как в прошлом ответе для совместимости с Groq) */
        <div className="p-4 space-y-4">
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-4 grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="font-bold">{generatedPlan.total_metrics.calories_avg}</p>
                <span className="text-[10px]">ккал/день</span>
              </div>
              <div>
                <p className="font-bold">{generatedPlan.total_metrics.protein}г</p>
                <span className="text-[10px]">белки</span>
              </div>
              <div>
                <p className="font-bold">{generatedPlan.total_metrics.carbs}г</p>
                <span className="text-[10px]">углеводы</span>
              </div>
              <div>
                <p className="font-bold">{generatedPlan.total_metrics.fat}г</p>
                <span className="text-[10px]">жиры</span>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="plan">📅 План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Продукты</TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="space-y-4">
              {generatedPlan.meal_plan.map((day) => (
                <Card key={day.day}>
                  <CardHeader className="p-3 bg-muted/30">
                    <CardTitle className="text-sm">
                      День {day.day} — {day.total_calories} ккал
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {day.meals.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg border bg-card cursor-pointer"
                        onClick={() => setSelectedMeal({ day: day.day, meal: m.meal })}
                      >
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground">{m.type}</p>
                          <p className="text-sm font-medium">{m.meal.name}</p>
                        </div>
                        <p className="text-xs font-bold">{m.meal.calories} ккал</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setGeneratedPlan(null)}>
                Изменить параметры
              </Button>
            </TabsContent>
            <TabsContent value="shopping" className="space-y-4">
              {generatedPlan.shopping_list.map((cat, i) => (
                <Card key={i}>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{cat.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="flex justify-between text-sm border-b pb-1">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">{item.amount}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Модалка рецепта */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedMeal.meal.name}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                <img
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(selectedMeal.meal.photo_search_query)},food`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center py-2 border-y">
                <div>
                  <p className="font-bold">{selectedMeal.meal.calories}</p>
                  <p className="text-[10px]">ккал</p>
                </div>
                <div>
                  <p className="font-bold text-green-600">{selectedMeal.meal.protein}г</p>
                  <p className="text-[10px]">белки</p>
                </div>
                <div>
                  <p className="font-bold text-orange-600">{selectedMeal.meal.carbs}г</p>
                  <p className="text-[10px]">угл</p>
                </div>
                <div>
                  <p className="font-bold text-yellow-600">{selectedMeal.meal.fat}г</p>
                  <p className="text-[10px]">жиры</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Ингредиенты:</h4>
                <ul className="text-sm space-y-1">
                  {selectedMeal.meal.recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{ing.name}</span>
                      <span className="text-muted-foreground">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Инструкция:</h4>
                <ol className="text-sm space-y-2 list-decimal pl-4">
                  {selectedMeal.meal.recipe.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
