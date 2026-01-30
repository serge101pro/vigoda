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
  recipe: {
    ingredients: { name: string; amount: string; category: string }[];
    steps: string[];
  };
}

interface GeneratedMealPlan {
  meal_plan: {
    day: number;
    total_calories: number;
    meals: { type: string; meal: MealPlanMeal }[];
  }[];
  shopping_list: { category: string; items: { name: string; amount: string }[] }[];
  total_metrics: { calories_avg: number; protein: number; fat: number; carbs: number };
}

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaidPlan, loading: subscriptionLoading } = useSubscription();
  const { addItem: addToDbCart } = useCart();
  const { addToCart } = useAppStore();

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
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealPlanMeal | null>(null);
  const [activeTab, setActiveTab] = useState("plan");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const enabledMeals = Object.entries(formData.mealSettings)
        .filter(([_, s]: any) => s.enabled)
        .map(([id]) => id);

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          prompt_params: {
            ...formData,
            meals: enabledMeals.map((id) => ({
              type: MEAL_TYPES.find((m) => m.id === id)?.label,
              dishCount: formData.mealSettings[id].dishCount,
            })),
          },
        },
      });

      if (error) throw error;
      const result = typeof data === "string" ? JSON.parse(data) : data;
      setGeneratedPlan(result);
      setActiveTab("plan");
      toast.success("План создан!");
    } catch (e: any) {
      toast.error("Ошибка: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!subscriptionLoading && !hasPaidPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Crown className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Премиум-функция</h2>
        <Button onClick={() => navigate("/profile/premium")}>Улучшить тариф</Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-24">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-violet-500" />
          <h1 className="text-xl font-bold">Генератор меню</h1>
        </div>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-6">
          <section>
            <Label className="mb-3 block font-semibold">Кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map((c) => (
                <Badge
                  key={c.id}
                  variant={formData.cuisines.includes(c.id) ? "default" : "outline"}
                  className="cursor-pointer py-1.5 px-3"
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

          <section>
            <Label className="mb-3 block font-semibold">Диета</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map((d) => (
                <Badge
                  key={d.id}
                  variant={formData.diets.includes(d.id) ? "secondary" : "outline"}
                  className={`cursor-pointer py-1.5 px-3 ${formData.diets.includes(d.id) ? "bg-green-500 text-white" : ""}`}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Калории</Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData((p) => ({ ...p, calories: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Дней</Label>
              <Select value={formData.days} onValueChange={(v) => setFormData((p) => ({ ...p, days: v }))}>
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

          <section>
            <Label className="mb-3 block font-semibold">Порций: {formData.servings}</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setFormData((p) => ({ ...p, servings: n }))}
                  className={`w-9 h-9 rounded-full ${formData.servings === n ? "bg-blue-500 text-white" : "bg-muted"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="font-semibold block">Приёмы пищи</Label>
            {MEAL_TYPES.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 border rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.mealSettings[meal.id].enabled}
                    onCheckedChange={() =>
                      setFormData((p) => ({
                        ...p,
                        mealSettings: {
                          ...p.mealSettings,
                          [meal.id]: { ...p.mealSettings[meal.id], enabled: !p.mealSettings[meal.id].enabled },
                        },
                      }))
                    }
                  />
                  <span>
                    {meal.emoji} {meal.label}
                  </span>
                </label>
                {formData.mealSettings[meal.id].enabled && (
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
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </section>

          <Button className="w-full h-14 text-lg bg-violet-600" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Создать план
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Card className="bg-violet-50">
            <CardContent className="p-4 grid grid-cols-4 gap-2 text-center text-sm font-bold">
              <div>
                {generatedPlan?.total_metrics?.calories_avg} <p className="text-[10px] font-normal">ккал</p>
              </div>
              <div>
                {generatedPlan?.total_metrics?.protein}г <p className="text-[10px] font-normal">белки</p>
              </div>
              <div>
                {generatedPlan?.total_metrics?.carbs}г <p className="text-[10px] font-normal">углеводы</p>
              </div>
              <div>
                {generatedPlan?.total_metrics?.fat}г <p className="text-[10px] font-normal">жиры</p>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="plan">📅 План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Продукты</TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="space-y-4">
              {generatedPlan?.meal_plan?.map((day) => (
                <Card key={day.day}>
                  <CardHeader className="p-3 bg-muted/30 text-sm font-bold">День {day.day}</CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {day.meals?.map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between p-2 border rounded-lg cursor-pointer hover:bg-accent"
                        onClick={() => setSelectedMeal(m.meal)}
                      >
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground">{m.type}</p>
                          <p className="text-sm font-medium">{m.meal?.name || "Блюдо"}</p>
                        </div>
                        <p className="text-xs font-bold">{m.meal?.calories} ккал</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={() => setGeneratedPlan(null)}>
                Назад
              </Button>
            </TabsContent>
            <TabsContent value="shopping" className="space-y-4">
              {generatedPlan?.shopping_list?.map((cat, i) => (
                <Card key={i}>
                  <CardHeader className="p-3 font-bold text-sm">{cat.category}</CardHeader>
                  <CardContent className="p-3 space-y-1">
                    {cat.items?.map((item, j) => (
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

      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedMeal?.name}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                <img
                  src={`https://source.unsplash.com/800x600/?${encodeURIComponent(selectedMeal?.photo_search_query || selectedMeal?.name)},food`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 text-center py-2 border-y">
                <div>
                  <p className="font-bold">{selectedMeal?.calories}</p>
                  <p className="text-[10px]">ккал</p>
                </div>
                <div>
                  <p className="font-bold text-green-600">{selectedMeal?.protein}г</p>
                  <p className="text-[10px]">белки</p>
                </div>
                <div>
                  <p className="font-bold text-orange-600">{selectedMeal?.carbs}г</p>
                  <p className="text-[10px]">угл</p>
                </div>
                <div>
                  <p className="font-bold text-yellow-600">{selectedMeal?.fat}г</p>
                  <p className="text-[10px]">жиры</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Ингредиенты:</h4>
                <ul className="text-sm space-y-1">
                  {selectedMeal?.recipe?.ingredients?.map((ing, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{ing.name}</span>
                      <span>{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Инструкция:</h4>
                <ol className="text-sm space-y-2 list-decimal pl-4">
                  {selectedMeal?.recipe?.steps?.map((step, i) => (
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
