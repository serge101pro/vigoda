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
    calories: "",
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
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);
  const [editingMeal, setEditingMeal] = useState<{ dayIndex: number; mealIndex: number; meal: MealPlanMeal } | null>(
    null,
  );
  const [editedMealName, setEditedMealName] = useState("");
  const [editedMealCalories, setEditedMealCalories] = useState("");

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
          },
        },
      });

      if (error) throw error;

      // Парсинг результата от Groq
      const result = typeof data === "string" ? JSON.parse(data) : data;

      if (!result || !result.meal_plan) {
        throw new Error("Некорректный формат ответа от ИИ");
      }

      setGeneratedPlan(result);
      setGenerationProgress(100);
      setActiveTab("plan");
      toast.success("План успешно создан!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error("Ошибка: " + (error.message || "Не удалось создать план"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Вспомогательные функции для UI
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

  const handleAddToCart = async () => {
    if (!generatedPlan) return;
    const items = generatedPlan.shopping_list.flatMap((c) => c.items);
    for (const item of items) {
      if (!item.checked) {
        if (user) await addToDbCart(item.name, 1, item.amount, "Ингредиенты");
        else
          addToCart(
            {
              id: item.name,
              name: item.name,
              price: 0,
              category: "Ингредиенты",
              image: "",
              unit: "шт",
              rating: 5,
              reviewCount: 0,
            },
            1,
          );
      }
    }
    toast.success("Товары добавлены в корзину");
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
          <Sparkles className="h-6 w-6 text-violet-500" />
          <h1 className="text-xl font-bold">ИИ Генератор Меню</h1>
        </div>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-6">
          <section>
            <Label className="mb-2 block">Кухни мира</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((c) => (
                <Badge
                  key={c.id}
                  variant={formData.cuisines.includes(c.id) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3"
                  onClick={() => toggleCuisine(c.id)}
                >
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <Label className="mb-2 block">Диета</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map((d) => (
                <Badge
                  key={d.id}
                  variant={formData.diets.includes(d.id) ? "secondary" : "outline"}
                  className={`cursor-pointer py-1.5 px-3 ${formData.diets.includes(d.id) ? "bg-green-500 text-white" : ""}`}
                  onClick={() => toggleDiet(d.id)}
                >
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Цель калорий</Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="2000"
              />
            </div>
            <div>
              <Label>Срок (дней)</Label>
              <Select value={formData.days} onValueChange={(v) => setFormData({ ...formData, days: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full h-12 bg-violet-600 hover:bg-violet-700"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isGenerating ? "Создаем план..." : "Сгенерировать меню"}
          </Button>

          {isGenerating && <Progress value={generationProgress} className="h-2" />}
        </div>
      ) : (
        <div className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="plan">📅 План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Список покупок</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-4">
              <Card className="bg-violet-50 border-violet-200">
                <CardContent className="p-4 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="font-bold">{generatedPlan.total_metrics.calories_avg}</p>
                    <span className="text-[10px]">ккал</span>
                  </div>
                  <div>
                    <p className="font-bold">{generatedPlan.total_metrics.protein}г</p>
                    <span className="text-[10px]">белки</span>
                  </div>
                  <div>
                    <p className="font-bold">{generatedPlan.total_metrics.carbs}г</p>
                    <span className="text-[10px]">угл</span>
                  </div>
                  <div>
                    <p className="font-bold">{generatedPlan.total_metrics.fat}г</p>
                    <span className="text-[10px]">жиры</span>
                  </div>
                </CardContent>
              </Card>

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
                        className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedMeal({ day: day.day, meal: m.meal })}
                      >
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground">{m.type}</p>
                          <p className="text-sm font-medium">{m.meal.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{m.meal.calories} ккал</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setGeneratedPlan(null)}>
                Сбросить и создать новый
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
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <Checkbox id={`item-${i}-${j}`} />
                        <label htmlFor={`item-${i}-${j}`} className="flex-1">
                          {item.name}
                        </label>
                        <span className="text-muted-foreground">{item.amount}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full" onClick={handleAddToCart}>
                Добавить все в корзину
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Модальное окно рецепта */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedMeal.meal.name}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(selectedMeal.meal.photo_search_query)},food`}
                  className="w-full h-full object-cover"
                  alt="food"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center border-y py-2">
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
