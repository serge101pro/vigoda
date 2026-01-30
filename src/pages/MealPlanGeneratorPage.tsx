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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAppStore } from "@/stores/useAppStore";
import { useCart } from "@/hooks/useCart";

// --- Константы данных ---
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

// --- Интерфейсы ---
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
    cooking_time?: number;
    servings?: number;
  };
}

interface GeneratedMealPlan {
  days: {
    day: number;
    total_calories: number;
    meals: { type: string; meal: MealPlanMeal }[];
  }[];
  shopping_list: { category: string; items: { name: string; amount: string; checked?: boolean }[] }[];
  summary: { avg_calories: number; avg_protein: number; avg_carbs: number; avg_fat: number };
}

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaidPlan, loading: subLoading } = useSubscription();
  const { addItem: addToDbCart } = useCart();
  const { addToCart } = useAppStore();

  // Состояние формы
  const [formData, setFormData] = useState({
    cuisines: [] as string[],
    diets: [] as string[],
    calories: "1800",
    allergies: "",
    servings: 2,
    mealSettings: MEAL_TYPES.reduce(
      (acc, m) => ({
        ...acc,
        [m.id]: { enabled: ["breakfast", "lunch", "dinner"].includes(m.id), dishCount: 1, includeSoup: false },
      }),
      {} as any,
    ),
    days: "7",
    soupMeal: null as string | null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealPlanMeal | null>(null);
  const [activeTab, setActiveTab] = useState("plan");

  // Хэндлеры
  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);
    try {
      const enabledMeals = Object.entries(formData.mealSettings)
        .filter(([_, s]: any) => s.enabled)
        .map(([id]) => ({
          type: MEAL_TYPES.find((m) => m.id === id)?.label,
          dishCount: formData.mealSettings[id].dishCount,
          includeSoup: formData.mealSettings[id].includeSoup,
        }));

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          cuisines: formData.cuisines.map((c) => CUISINE_TYPES.find((ct) => ct.id === c)?.label),
          diets: formData.diets.map((d) => DIET_TYPES.find((dt) => dt.id === d)?.label),
          calories: parseInt(formData.calories),
          allergies: formData.allergies,
          servings: formData.servings,
          meals: enabledMeals,
          days: parseInt(formData.days),
        },
      });

      if (error) throw error;

      // Парсинг результата (защита от разных форматов ответа)
      const result = data?.plan || data;
      setGeneratedPlan(result);
      setProgress(100);
      toast.success("План питания успешно создан!");
    } catch (e: any) {
      console.error(e);
      toast.error("Ошибка генерации. Попробуйте уменьшить количество дней или блюд.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMeal = (id: string) => {
    setFormData((p) => ({
      ...p,
      mealSettings: {
        ...p.mealSettings,
        [id]: { ...p.mealSettings[id], enabled: !p.mealSettings[id].enabled },
      },
    }));
  };

  const setSoupMeal = (mealId: string | null) => {
    setFormData((p) => {
      const newSettings = { ...p.mealSettings };
      Object.keys(newSettings).forEach((k) => (newSettings[k].includeSoup = false));
      if (mealId) newSettings[mealId].includeSoup = true;
      return { ...p, mealSettings: newSettings, soupMeal: mealId };
    });
  };

  if (!subLoading && !hasPaidPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
        <div className="bg-amber-100 p-4 rounded-full mb-4">
          <Crown className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Требуется Premium</h2>
        <p className="text-muted-foreground mb-6">Генерация меню доступна только подписчикам.</p>
        <Button onClick={() => navigate("/profile/premium")}>Улучшить тариф</Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-24 max-w-2xl mx-auto">
      <header className="p-4 border-b bg-background/95 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-bold">ИИ Генератор Меню</h1>
        </div>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-8">
          {/* Кухни */}
          <section>
            <Label className="flex items-center gap-2 text-base mb-3">
              <ChefHat className="h-5 w-5" /> Кухни мира
            </Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((c) => (
                <Badge
                  key={c.id}
                  variant={formData.cuisines.includes(c.id) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3 text-sm"
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      cuisines: p.cuisines.includes(c.id)
                        ? p.cuisines.filter((x) => x !== c.id)
                        : [...p.cuisines, c.id],
                    }))
                  }
                >
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* Диеты */}
          <section>
            <Label className="flex items-center gap-2 text-base mb-3">
              <Apple className="h-5 w-5" /> Диета
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map((d) => (
                <Badge
                  key={d.id}
                  variant={formData.diets.includes(d.id) ? "secondary" : "outline"}
                  className={`cursor-pointer py-1.5 px-3 text-sm ${formData.diets.includes(d.id) ? "bg-green-600 text-white hover:bg-green-700" : ""}`}
                  onClick={() =>
                    setFormData((p) => ({
                      ...p,
                      diets: p.diets.includes(d.id) ? p.diets.filter((x) => x !== d.id) : [...p.diets, d.id],
                    }))
                  }
                >
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* Калории и Аллергии */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Цель калорий
              </Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData((p) => ({ ...p, calories: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" /> Аллергии
              </Label>
              <Input
                placeholder="Орехи, мед..."
                value={formData.allergies}
                onChange={(e) => setFormData((p) => ({ ...p, allergies: e.target.value }))}
              />
            </div>
          </div>

          {/* Порции */}
          <section>
            <Label className="flex items-center gap-2 text-base mb-4">
              <Users className="h-5 w-5" /> Порций (едоков): {formData.servings}
            </Label>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setFormData((p) => ({ ...p, servings: n }))}
                  className={`flex-1 h-10 rounded-lg text-sm transition-colors ${formData.servings === n ? "bg-blue-600 text-white" : "bg-muted"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* Приёмы пищи */}
          <section className="space-y-3">
            <Label className="text-base font-bold">Приёмы пищи</Label>
            {MEAL_TYPES.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center justify-between p-4 border rounded-xl transition-all ${formData.mealSettings[meal.id].enabled ? "border-primary bg-primary/5" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.mealSettings[meal.id].enabled}
                    onCheckedChange={() => toggleMeal(meal.id)}
                  />
                  <span className="text-xl">{meal.emoji}</span>
                  <span className="font-medium">{meal.label}</span>
                </div>
                {formData.mealSettings[meal.id].enabled && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Блюд:</span>
                    <Select
                      value={formData.mealSettings[meal.id].dishCount.toString()}
                      onValueChange={(v) =>
                        setFormData((p) => ({
                          ...p,
                          mealSettings: {
                            ...p.mealSettings,
                            [meal.id]: { ...p.mealSettings[meal.id], dishCount: parseInt(v) },
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="w-16 h-9">
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
            ))}
          </section>

          {/* Суп */}
          <section className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Label className="flex items-center gap-2 mb-3">
              <Soup className="h-5 w-5 text-amber-600" /> Первое блюдо (суп)
            </Label>
            <RadioGroup
              value={formData.soupMeal || "none"}
              onValueChange={(v) => setSoupMeal(v === "none" ? null : v)}
              className="flex gap-2 flex-wrap"
            >
              <label
                className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer ${!formData.soupMeal ? "bg-white border-amber-500 shadow-sm" : "bg-white/50"}`}
              >
                <RadioGroupItem value="none" className="sr-only" /> <span>Без супа</span>
              </label>
              {formData.mealSettings.lunch.enabled && (
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer ${formData.soupMeal === "lunch" ? "bg-white border-amber-500 shadow-sm" : "bg-white/50"}`}
                >
                  <RadioGroupItem value="lunch" className="sr-only" /> <span>🍲 На обед</span>
                </label>
              )}
              {formData.mealSettings.dinner.enabled && (
                <label
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer ${formData.soupMeal === "dinner" ? "bg-white border-amber-500 shadow-sm" : "bg-white/50"}`}
                >
                  <RadioGroupItem value="dinner" className="sr-only" /> <span>🥗 На ужин</span>
                </label>
              )}
            </RadioGroup>
          </section>

          {/* Дни */}
          <section>
            <Label className="flex items-center gap-2 text-base mb-3">
              <Calendar className="h-5 w-5" /> Количество дней
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {DAY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFormData((p) => ({ ...p, days: o.value }))}
                  className={`py-3 rounded-xl border font-medium ${formData.days === o.value ? "bg-violet-600 text-white border-violet-600 shadow-lg" : "bg-background hover:bg-muted"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <Button
            className="w-full h-14 text-lg bg-violet-600 hover:bg-violet-700 shadow-xl"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Создаем план...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Сгенерировать меню
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground italic">Это может занять до 30 секунд...</p>
            </div>
          )}
        </div>
      ) : (
        /* Результаты плана */
        <div className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="plan">📅 Мой План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Список покупок</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-4">
              <Card className="bg-violet-50 border-none">
                <CardContent className="p-4 flex justify-around text-center">
                  <div>
                    <p className="font-bold text-lg">{generatedPlan.summary?.avg_calories}</p>
                    <p className="text-[10px]">ккал/день</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-green-600">{generatedPlan.summary?.avg_protein}г</p>
                    <p className="text-[10px]">белки</p>
                  </div>
                  <div>
                    <p className="font-bold text-lg text-orange-600">{generatedPlan.summary?.avg_carbs}г</p>
                    <p className="text-[10px]">углеводы</p>
                  </div>
                </CardContent>
              </Card>

              {generatedPlan.days?.map((day) => (
                <Card key={day.day} className="overflow-hidden">
                  <div className="bg-muted/50 p-3 font-bold flex justify-between">
                    <span>День {day.day}</span>
                    <span className="text-muted-foreground text-sm font-normal">{day.total_calories} ккал</span>
                  </div>
                  <CardContent className="p-2 space-y-1">
                    {day.meals?.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer border-b last:border-0"
                        onClick={() => setSelectedMeal(m.meal)}
                      >
                        <span className="text-2xl">{MEAL_TYPES.find((mt) => mt.label === m.type)?.emoji || "🍽️"}</span>
                        <div className="flex-1">
                          <p className="text-[10px] text-muted-foreground uppercase">{m.type}</p>
                          <p className="text-sm font-semibold">{m.meal?.name || "Блюдо"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{m.meal?.calories}</p>
                          <p className="text-[10px] text-muted-foreground">ккал</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setGeneratedPlan(null)}>
                Назад к настройкам
              </Button>
            </TabsContent>

            <TabsContent value="shopping">
              {/* Список покупок */}
              <div className="space-y-4">
                {generatedPlan.shopping_list?.map((cat, i) => (
                  <Card key={i}>
                    <CardHeader className="p-3 font-bold bg-muted/20">{cat.category}</CardHeader>
                    <CardContent className="p-3 space-y-2">
                      {cat.items?.map((item, j) => (
                        <div key={j} className="flex justify-between items-center text-sm border-b pb-2">
                          <div className="flex items-center gap-2">
                            <Checkbox />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-muted-foreground">{item.amount}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Добавить всё в корзину
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Модалка рецепта */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedMeal.name}</DialogTitle>
              </DialogHeader>

              <div className="aspect-video rounded-xl bg-muted overflow-hidden relative">
                <img
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(selectedMeal.photo_search_query || selectedMeal.name)},food`}
                  className="w-full h-full object-cover"
                  alt={selectedMeal.name}
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center py-4 border-y">
                <div>
                  <p className="text-lg font-bold">{selectedMeal.calories}</p>
                  <p className="text-[10px] text-muted-foreground">ккал</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{selectedMeal.protein}г</p>
                  <p className="text-[10px] text-muted-foreground">белки</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{selectedMeal.carbs}г</p>
                  <p className="text-[10px] text-muted-foreground">углеводы</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-600">{selectedMeal.fat}г</p>
                  <p className="text-[10px] text-muted-foreground">жиры</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <List className="h-4 w-4" /> Ингредиенты
                </h4>
                <ul className="space-y-2">
                  {selectedMeal.recipe?.ingredients?.map((ing, i) => (
                    <li key={i} className="flex justify-between text-sm border-b border-dashed pb-1">
                      <span>{ing.name}</span>
                      <span className="font-medium">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4" /> Пошаговый рецепт
                </h4>
                <div className="space-y-3">
                  {selectedMeal.recipe?.steps?.map((step, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold">
                        {i + 1}
                      </div>
                      <p className="pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" /> В избранное
                </Button>
                <Button className="flex-1 bg-violet-600">
                  <BookOpen className="mr-2 h-4 w-4" /> Сохранить рецепт
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
