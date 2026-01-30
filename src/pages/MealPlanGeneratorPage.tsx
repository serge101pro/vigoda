import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ChefHat,
  Calendar,
  Users,
  Flame,
  Apple,
  ShoppingCart,
  Heart,
  BookOpen,
  Check,
  Loader2,
  AlertCircle,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  { id: "mediterranean", label: "Средиземноморская", emoji: "🫒" },
];

const DIET_TYPES = [
  { id: "vegan", label: "Веганская", emoji: "🌱" },
  { id: "keto", label: "Кето", emoji: "🥑" },
  { id: "paleo", label: "Палео", emoji: "🍖" },
  { id: "vegetarian", label: "Вегетарианская", emoji: "🥬" },
  { id: "lactose_free", label: "Безлактозная", emoji: "🥛" },
  { id: "gluten_free", label: "Безглютеновая", emoji: "🌾" },
];

const MEAL_TYPES = [
  { id: "breakfast", label: "Завтрак", emoji: "🍳" },
  { id: "snack1", label: "Перекус 1", emoji: "🍎" },
  { id: "lunch", label: "Обед", emoji: "🍲" },
  { id: "snack2", label: "Перекус 2", emoji: "🥜" },
  { id: "dinner", label: "Ужин", emoji: "🥗" },
];

// Новые опции дней: 1, 3, 7
const DAY_OPTIONS = [
  { value: "1", label: "1 день" },
  { value: "3", label: "3 дня" },
  { value: "7", label: "7 дней" },
];

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaidPlan, loading: subLoading } = useSubscription();

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
    days: "3",
    soupMeal: null as string | null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(15);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          prompt_params: {
            ...formData,
            meals: Object.entries(formData.mealSettings)
              .filter(([_, s]: any) => s.enabled)
              .map(([id, s]: any) => ({
                type: MEAL_TYPES.find((m) => m.id === id)?.label,
                dishCount: s.dishCount,
                includeSoup: s.includeSoup,
              })),
          },
        },
      });

      if (error) throw error;

      let result = data;
      if (typeof data === "string") {
        const jsonMatch = data.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(data);
      }

      setGeneratedPlan(result);
      setProgress(100);
      toast.success("План питания готов!");
    } catch (e: any) {
      console.error(e);
      toast.error("Ошибка. Попробуйте выбрать меньше дней или блюд.");
    } finally {
      setIsGenerating(false);
    }
  };

  const setSoupMeal = (mealId: string | null) => {
    setFormData((p) => {
      const newSettings = { ...p.mealSettings };
      Object.keys(newSettings).forEach((k) => (newSettings[k].includeSoup = false));
      if (mealId && newSettings[mealId]) newSettings[mealId].includeSoup = true;
      return { ...p, mealSettings: newSettings, soupMeal: mealId };
    });
  };

  if (!subLoading && !hasPaidPlan) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[80vh]">
        <Crown className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">Нужен Premium</h2>
        <Button onClick={() => navigate("/profile/premium")} className="mt-4">
          Улучшить тариф
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-24 max-w-xl mx-auto">
      <header className="p-4 border-b bg-background/95 sticky top-0 z-50 flex items-center gap-3">
        <div className="bg-violet-600 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="font-bold">Генератор меню</h1>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-8">
          {/* Кухни */}
          <section>
            <Label className="flex items-center gap-2 mb-3 text-base">
              <ChefHat className="h-5 w-5" /> Кухни
            </Label>
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

          {/* Порции (1-10) */}
          <section>
            <Label className="flex items-center gap-2 mb-3 text-base">
              <Users className="h-5 w-5" /> Порций: {formData.servings}
            </Label>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setFormData((p) => ({ ...p, servings: n }))}
                  className={`flex-1 h-10 rounded-lg text-sm transition-all ${formData.servings === n ? "bg-blue-600 text-white shadow-md" : "bg-muted"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* Приёмы пищи и количество блюд */}
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
                  <span className="text-xl">{meal.emoji}</span>
                  <span className="font-medium">{meal.label}</span>
                </div>
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
                    <SelectTrigger className="w-20 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 блюдо</SelectItem>
                      <SelectItem value="2">2 блюда</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </section>

          {/* Суп */}
          <section className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Label className="flex items-center gap-2 mb-3">
              <Soup className="h-5 w-5 text-amber-600" /> Первое блюдо (суп)
            </Label>
            <div className="flex gap-2">
              <Button
                variant={!formData.soupMeal ? "default" : "outline"}
                className="flex-1 text-xs h-9"
                onClick={() => setSoupMeal(null)}
              >
                Без супа
              </Button>
              {formData.mealSettings.lunch.enabled && (
                <Button
                  variant={formData.soupMeal === "lunch" ? "default" : "outline"}
                  className="flex-1 text-xs h-9"
                  onClick={() => setSoupMeal("lunch")}
                >
                  🍲 На обед
                </Button>
              )}
            </div>
          </section>

          {/* Выбор дней: 1, 3, 7 */}
          <section>
            <Label className="flex items-center gap-2 mb-3 text-base">
              <Calendar className="h-5 w-5" /> Срок планирования
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {DAY_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setFormData((p) => ({ ...p, days: o.value }))}
                  className={`py-3 rounded-xl border font-bold transition-all ${formData.days === o.value ? "bg-violet-600 text-white border-violet-600 shadow-lg" : "bg-background hover:bg-muted"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </section>

          <Button
            className="w-full h-14 bg-violet-600 text-lg shadow-xl"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isGenerating ? "Генерируем..." : "Создать меню"}
          </Button>
          {isGenerating && <Progress value={progress} className="h-2 mt-4" />}
        </div>
      ) : (
        /* UI результатов оставлен прежним для корректного отображения плана */
        <div className="p-4 space-y-4">
          <Button variant="ghost" onClick={() => setGeneratedPlan(null)}>
            ← Изменить параметры
          </Button>
          <Tabs defaultValue="plan">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="plan">📅 План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Продукты</TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="space-y-4 mt-4">
              {generatedPlan.meal_plan?.map((day: any) => (
                <Card key={day.day}>
                  <CardHeader className="p-3 bg-muted/30 font-bold">
                    День {day.day} — {day.total_calories} ккал
                  </CardHeader>
                  <CardContent className="p-2">
                    {day.meals?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="flex justify-between p-3 border-b last:border-0 cursor-pointer"
                        onClick={() => setSelectedMeal(m.meal)}
                      >
                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground">{m.type}</p>
                          <p className="text-sm font-semibold">{m.meal?.name || "Блюдо"}</p>
                        </div>
                        <p className="text-xs font-bold">{m.meal?.calories} ккал</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Модалка рецепта с защитой данных */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedMeal.name}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 text-center border-y py-3 text-sm">
                <div>
                  <p className="font-bold">{selectedMeal.calories}</p>
                  <p className="text-[10px]">ккал</p>
                </div>
                <div className="text-green-600">
                  <p className="font-bold">{selectedMeal.protein}г</p>
                  <p className="text-[10px]">белки</p>
                </div>
                <div className="text-orange-600">
                  <p className="font-bold">{selectedMeal.carbs}г</p>
                  <p className="text-[10px]">угл</p>
                </div>
                <div className="text-yellow-600">
                  <p className="font-bold">{selectedMeal.fat}г</p>
                  <p className="text-[10px]">жиры</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-2">Ингредиенты:</h4>
                <ul className="text-xs space-y-1">
                  {selectedMeal.recipe?.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-dashed pb-1">
                      <span>{ing.name}</span>
                      <span>{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
