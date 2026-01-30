import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChefHat, Calendar, Users, Flame, Apple, 
  ShoppingCart, Heart, BookOpen, Check, Loader2, 
  AlertCircle, List, Crown, Soup, Pencil, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  { id: 'greek', label: 'Греческая', emoji: '🥙' }
];

const DIET_TYPES = [
  { id: 'vegan', label: 'Веганская', emoji: '🌱' },
  { id: 'keto', label: 'Кето', emoji: '🥑' },
  { id: 'paleo', label: 'Палео', emoji: '🍖' },
  { id: 'vegetarian', label: 'Вегетарианская', emoji: '🥬' },
  { id: 'lactose_free', label: 'Безлактозная', emoji: '🥛' },
  { id: 'gluten_free', label: 'Безглютеновая', emoji: '🌾' }
];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Завтрак', emoji: '🍳' },
  { id: 'snack1', label: 'Перекус 1', emoji: '🍎' },
  { id: 'lunch', label: 'Обед', emoji: '🍲' },
  { id: 'snack2', label: 'Перекус 2', emoji: '🥜' },
  { id: 'dinner', label: 'Ужин', emoji: '🥗' },
  { id: 'late_snack', label: 'Поздний ужин', emoji: '🌙' }
];

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPaidPlan, loading: subLoading } = useSubscription();

  const [formData, setFormData] = useState({
    cuisines: [] as string[],
    diets: [] as string[],
    calories: '1800',
    allergies: '',
    servings: 2,
    mealSettings: MEAL_TYPES.reduce((acc, m) => ({
      ...acc, [m.id]: { enabled: ['breakfast', 'lunch', 'dinner'].includes(m.id), dishCount: 1, includeSoup: false }
    }), {} as any),
    days: '7',
    soupMeal: null as string | null,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(20);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          prompt_params: {
            ...formData,
            meals: Object.entries(formData.mealSettings)
              .filter(([_, s]: any) => s.enabled)
              .map(([id, s]: any) => ({
                type: MEAL_TYPES.find(m => m.id === id)?.label,
                dishCount: s.dishCount,
                includeSoup: s.includeSoup
              }))
          }
        }
      });

      if (error) throw error;
      setGeneratedPlan(data);
      setProgress(100);
      toast.success('План создан!');
    } catch (e: any) {
      console.error(e);
      toast.error('Ошибка. Проверьте GEMINI_API_KEY в секретах Supabase.');
    } finally {
      setIsGenerating(false);
    }
  };

  const setSoupMeal = (mealId: string | null) => {
    setFormData(p => {
      const newSettings = { ...p.mealSettings };
      Object.keys(newSettings).forEach(k => newSettings[k].includeSoup = false);
      if (mealId && newSettings[mealId]) newSettings[mealId].includeSoup = true;
      return { ...p, mealSettings: newSettings, soupMeal: mealId };
    });
  };

  if (!subLoading && !hasPaidPlan) return <div className="p-8 text-center">Нужен Premium</div>;

  return (
    <div className="page-container pb-24 max-w-xl mx-auto">
      <header className="p-4 border-b bg-background sticky top-0 z-50 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-500" />
        <h1 className="font-bold">ИИ Генератор</h1>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-6">
          <section>
            <Label className="mb-2 block font-semibold">Кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(c => (
                <Badge 
                  key={c.id} 
                  variant={formData.cuisines.includes(c.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(p => ({ ...p, cuisines: p.cuisines.includes(c.id) ? p.cuisines.filter(x => x !== c.id) : [...p.cuisines, c.id] }))}
                >{c.emoji} {c.label}</Badge>
              ))}
            </div>
          </section>

          <section>
            <Label className="mb-2 block font-semibold">Диеты</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <Badge 
                  key={d.id} 
                  variant={formData.diets.includes(d.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData(p => ({ ...p, diets: p.diets.includes(d.id) ? p.diets.filter(x => x !== d.id) : [...p.diets, d.id] }))}
                >{d.emoji} {d.label}</Badge>
              ))}
            </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ккал/день</Label>
              <Input type="number" value={formData.calories} onChange={e => setFormData(p => ({ ...p, calories: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Аллергии</Label>
              <Input placeholder="Нет" value={formData.allergies} onChange={e => setFormData(p => ({ ...p, allergies: e.target.value }))} />
            </div>
          </div>

          <section>
            <Label className="mb-2 block font-semibold">Порций: {formData.servings}</Label>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button key={n} onClick={() => setFormData(p => ({ ...p, servings: n }))} className={`flex-1 h-9 rounded ${formData.servings === n ? 'bg-blue-600 text-white' : 'bg-muted'}`}>{n}</button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="font-bold">Приёмы пищи</Label>
            {MEAL_TYPES.map(meal => (
              <div key={meal.id} className="flex items-center justify-between p-3 border rounded-xl bg-card">
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.mealSettings[meal.id].enabled} onCheckedChange={() => setFormData(p => ({ ...p, mealSettings: { ...p.mealSettings, [meal.id]: { ...p.mealSettings[meal.id], enabled: !p.mealSettings[meal.id].enabled } } }))} />
                  <span>{meal.emoji} {meal.label}</span>
                </div>
                {formData.mealSettings[meal.id].enabled && (
                  <Select value={formData.mealSettings[meal.id].dishCount.toString()} onValueChange={v => setFormData(p => ({ ...p, mealSettings: { ...p.mealSettings, [meal.id]: { ...p.mealSettings[meal.id], dishCount: parseInt(v) } } }))}>
                    <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="1">1 блюдо</SelectItem><SelectItem value="2">2 блюда</SelectItem><SelectItem value="3">3 блюда</SelectItem></SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </section>

          <section className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <Label className="block mb-2 font-semibold">Первое блюдо (суп)</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={!formData.soupMeal ? "default" : "outline"} className="flex-1" onClick={() => setSoupMeal(null)}>Без супа</Button>
              <Button size="sm" variant={formData.soupMeal === 'lunch' ? "default" : "outline"} className="flex-1" onClick={() => setSoupMeal('lunch')}>🍲 Обед</Button>
            </div>
          </section>

          <section>
            <Label className="mb-2 block font-semibold">Срок: {formData.days} дн.</Label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '3', '7', '14'].map(d => (
                <Button key={d} variant={formData.days === d ? "default" : "outline"} onClick={() => setFormData(p => ({ ...p, days: d }))}>{d}</Button>
              ))}
            </div>
          </section>

          <Button className="w-full h-14 bg-violet-600 text-lg shadow-lg" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />}
            Создать план
          </Button>
        </div>
      ) : (
        /* UI РЕЗУЛЬТАТОВ */
        <div className="p-4 space-y-4">
          <Button variant="ghost" onClick={() => setGeneratedPlan(null)}>← Назад</Button>
          <Tabs defaultValue="plan">
            <TabsList className="w-full grid grid-cols-2"><TabsTrigger value="plan">📅 План</TabsTrigger><TabsTrigger value="shopping">🛒 Продукты</TabsTrigger></TabsList>
            <TabsContent value="plan" className="space-y-4 mt-4">
              {generatedPlan.meal_plan?.map((day: any) => (
                <Card key={day.day}>
                  <CardHeader className="p-3 bg-muted font-bold">День {day.day}</CardHeader>
                  <CardContent className="p-0 divide-y">
                    {day.meals?.map((m: any, i: number) => (
                      <div key={i} className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50" onClick={() => setSelectedMeal(m.meal)}>
                        <div><p className="text-[10px] uppercase text-muted-foreground">{m.type}</p><p className="font-semibold">{m.meal.name}</p></div>
                        <Badge variant="secondary">{m.meal.calories} ккал</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* РЕЦЕПТ */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-4">
              <DialogHeader><DialogTitle className="text-xl">{selectedMeal.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-4 text-center border-y py-3 text-sm font-bold">
                <div>{selectedMeal.calories} ккал</div>
                <div className="text-green-600">{selectedMeal.protein}г Б</div>
                <div className="text-orange-600">{selectedMeal.carbs}г У</div>
                <div className="text-yellow-600">{selectedMeal.fat}г Ж</div>
              </div>
              <div>
                <h4 className="font-bold mb-2">Ингредиенты:</h4>
                <ul className="text-sm space-y-1">
                  {selectedMeal.recipe?.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-dashed pb-1"><span>{ing.name}</span><span>{ing.amount}</span></li>
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