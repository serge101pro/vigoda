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
  ChevronDown,
  Share2,
  Download,
  FileText,
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
    days: "7",
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
      setGeneratedPlan(data);
      setProgress(100);
      toast.success("План питания успешно создан!");
    } catch (e: any) {
      console.error(e);
      toast.error("Ошибка генерации. Попробуйте уменьшить количество дней.");
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
        <h2 className="text-xl font-bold mb-4">Требуется Premium подписка</h2>
        <Button onClick={() => navigate("/profile/premium")}>Улучшить тариф</Button>
      </div>
    );
  }

  return (
    <div className="page-container pb-24 max-w-2xl mx-auto">
      <header className="p-4 border-b bg-background/95 sticky top-0 z-50 flex items-center gap-3">
        <div className="bg-violet-600 p-2 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-bold">ИИ Генератор Меню</h1>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-8">
          {/* Кухни */}
          <section>
            <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
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
            <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
              <Apple className="h-5 w-5" /> Предпочтения и диеты
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
                <Flame className="h-4 w-4 text-orange-500" /> Калорий в день
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
                placeholder="Напр: арахис, лактоза"
                value={formData.allergies}
                onChange={(e) => setFormData((p) => ({ ...p, allergies: e.target.value }))}
              />
            </div>
          </div>

          {/* Порции */}
          <section>
            <Label className="flex items-center gap-2 mb-4 text-base font-semibold">
              <Users className="h-5 w-5" /> Количество порций (едоков): {formData.servings}
            </Label>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setFormData((p) => ({ ...p, servings: n }))}
                  className={`flex-1 h-10 rounded-lg text-sm transition-all ${formData.servings === n ? "bg-blue-600 text-white shadow-md" : "bg-muted hover:bg-muted/80"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          {/* Приёмы пищи */}
          <section className="space-y-3">
            <Label className="text-base font-bold">Приёмы пищи и количество блюд</Label>
            {MEAL_TYPES.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center justify-between p-4 border rounded-xl transition-all ${formData.mealSettings[meal.id].enabled ? "border-violet-300 bg-violet-50/50" : "bg-card"}`}
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
                    <SelectTrigger className="w-24 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 блюдо</SelectItem>
                      <SelectItem value="2">2 блюда</SelectItem>
                      <SelectItem value="3">3 блюда</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </section>

          {/* Первое блюдо */}
          <section className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Label className="flex items-center gap-2 mb-3 font-semibold">
              <Soup className="h-5 w-5 text-amber-600" /> Добавить суп (первое блюдо)
            </Label>
            <RadioGroup
              value={formData.soupMeal || "none"}
              onValueChange={(v) => setSoupMeal(v === "none" ? null : v)}
              className="flex gap-2 flex-wrap"
            >
              <label
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${!formData.soupMeal ? "bg-white border-amber-500 shadow-sm" : "bg-white/50 border-transparent"}`}
              >
                <RadioGroupItem value="none" className="sr-only" /> <span>Без супа</span>
              </label>
              {formData.mealSettings.lunch.enabled && (
                <label
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${formData.soupMeal === "lunch" ? "bg-white border-amber-500 shadow-sm" : "bg-white/50 border-transparent"}`}
                >
                  <RadioGroupItem value="lunch" className="sr-only" /> <span>🍲 На обед</span>
                </label>
              )}
              {formData.mealSettings.dinner.enabled && (
                <label
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${formData.soupMeal === "dinner" ? "bg-white border-amber-500 shadow-sm" : "bg-white/50 border-transparent"}`}
                >
                  <RadioGroupItem value="dinner" className="sr-only" /> <span>🥗 На ужин</span>
                </label>
              )}
            </RadioGroup>
          </section>

          {/* Срок */}
          <section>
            <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
              <Calendar className="h-5 w-5" /> Срок планирования
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {["1", "3", "7", "14"].map((d) => (
                <button
                  key={d}
                  onClick={() => setFormData((p) => ({ ...p, days: d }))}
                  className={`py-3 rounded-xl border font-bold transition-all ${formData.days === d ? "bg-violet-600 text-white border-violet-600 shadow-lg" : "bg-background hover:bg-muted"}`}
                >
                  {d} {d === "1" ? "день" : "дн"}
                </button>
              ))}
            </div>
          </section>

          <Button
            className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-lg shadow-xl"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Генерация...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Создать план питания
              </>
            )}
          </Button>
          {isGenerating && <Progress value={progress} className="h-2 mt-4" />}
        </div>
      ) : (
        /* UI РЕЗУЛЬТАТОВ */
        <div className="p-4 space-y-4">
          <header className="flex justify-between items-center mb-4">
            <Button variant="ghost" onClick={() => setGeneratedPlan(null)}>
              ← Назад к настройкам
            </Button>
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <Tabs defaultValue="plan">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="plan">📅 Мой План</TabsTrigger>
              <TabsTrigger value="shopping">🛒 Список покупок</TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="space-y-4 mt-6">
              {generatedPlan.meal_plan?.map((day: any) => (
                <Card key={day.day} className="overflow-hidden border-violet-100">
                  <div className="bg-violet-50 p-3 font-bold flex justify-between items-center border-b border-violet-100">
                    <span>День {day.day}</span>
                    <Badge variant="outline" className="bg-white">
                      {day.total_calories || formData.calories} ккал
                    </Badge>
                  </div>
                  <CardContent className="p-0">
                    {day.meals?.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                        onClick={() => setSelectedMeal(m.meal)}
                      >
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-xl shrink-0">
                          {MEAL_TYPES.find((mt) => mt.label === m.type)?.emoji || "🍽️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                            {m.type}
                          </p>
                          <p className="text-sm font-semibold truncate">{m.meal?.name || "Блюдо"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-violet-700">{m.meal?.calories}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">ккал</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="shopping" className="mt-6 space-y-4">
              {generatedPlan.shopping_list?.map((cat: any, i: number) => (
                <Card key={i}>
                  <CardHeader className="p-3 bg-muted/30 font-bold text-sm uppercase tracking-tight">
                    {cat.category}
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {cat.items?.map((item: any, j: number) => (
                      <div
                        key={j}
                        className="flex justify-between items-center text-sm border-b border-dashed pb-2 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox id={`item-${i}-${j}`} />
                          <label htmlFor={`item-${i}-${j}`}>{item.name}</label>
                        </div>
                        <span className="font-medium text-muted-foreground">{item.amount}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full bg-green-600">
                <ShoppingCart className="mr-2 h-4 w-4" /> Добавить всё в корзину
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* МОДАЛКА РЕЦЕПТА */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl">
          {selectedMeal && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold leading-tight">{selectedMeal.name}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-4 gap-2 text-center py-4 border-y border-muted">
                <div>
                  <p className="text-lg font-black">{selectedMeal.calories}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">ккал</p>
                </div>
                <div>
                  <p className="text-lg font-black text-green-600">{selectedMeal.protein}г</p>
                  <p className="text-[10px] text-muted-foreground uppercase">белки</p>
                </div>
                <div>
                  <p className="text-lg font-black text-orange-600">{selectedMeal.carbs}г</p>
                  <p className="text-[10px] text-muted-foreground uppercase">углеводы</p>
                </div>
                <div>
                  <p className="text-lg font-black text-yellow-600">{selectedMeal.fat}г</p>
                  <p className="text-[10px] text-muted-foreground uppercase">жиры</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <List className="h-4 w-4 text-violet-600" /> Ингредиенты
                </h4>
                <div className="space-y-2">
                  {selectedMeal.recipe?.ingredients?.map((ing: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm border-b border-dashed pb-1">
                      <span>{ing.name}</span>
                      <span className="font-bold">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold flex items-center gap-2 mb-3">
                  <ChefHat className="h-4 w-4 text-violet-600" /> Как готовить
                </h4>
                <div className="space-y-4">
                  {selectedMeal.recipe?.steps?.map((step: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="bg-violet-100 text-violet-700 w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                        {i + 1}
                      </div>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1 h-12 rounded-xl">
                  <Heart className="mr-2 h-4 w-4" /> В избранное
                </Button>
                <Button className="flex-1 h-12 rounded-xl bg-violet-600 shadow-lg shadow-violet-200">
                  <BookOpen className="mr-2 h-4 w-4" /> Готовить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
