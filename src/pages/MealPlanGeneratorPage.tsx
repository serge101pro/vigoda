import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, ChefHat, Calendar, Users, Apple, Download, 
  ShoppingCart, List, Crown, Soup, Pencil, Trash2, Loader2, ChevronDown, Share2, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

// ПОЛНЫЙ список из 20 кухонь
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
  { id: 'asian_fusion', label: 'Азиатский фьюжн', emoji: '🥢' }
];

const DIET_TYPES = [
  { id: 'vegan', label: 'Веганская', emoji: '🌱' },
  { id: 'keto', label: 'Кето', emoji: '🥑' },
  { id: 'paleo', label: 'Палео', emoji: '🍖' },
  { id: 'vegetarian', label: 'Вегетарианская', emoji: '🥬' },
  { id: 'lactose_free', label: 'Безлактозная', emoji: '🥛' },
  { id: 'gluten_free', label: 'Безглютеновая', emoji: '🌾' },
  { id: 'high_protein', label: 'Высокобелковая', emoji: '💪' },
  { id: 'low_carb', label: 'Низкоуглеводная', emoji: '📉' }
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
  const { hasPaidPlan, loading: subLoading } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  const [formData, setFormData] = useState({
    cuisines: [] as string[],
    diets: [] as string[],
    calories: '2000',
    allergies: '',
    servings: 2,
    days: '7',
    mealSettings: MEAL_TYPES.reduce((acc, m) => ({ 
      ...acc, 
      [m.id]: { enabled: ['breakfast', 'lunch', 'dinner'].includes(m.id), dishCount: 1, includeSoup: false } 
    }), {} as any),
    soupMeal: null as string | null
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const meals = Object.entries(formData.mealSettings)
        .filter(([_, s]: any) => s.enabled)
        .map(([id, s]: any) => ({
          type: MEAL_TYPES.find(m => m.id === id)?.label,
          dishCount: s.dishCount,
          includeSoup: s.includeSoup
        }));

      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { prompt_params: { ...formData, meals } }
      });
      if (error) throw error;
      setGeneratedPlan(data.plan);
      toast.success('План создан!');
    } catch (e: any) {
      toast.error('Ошибка: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Ваш план питания", 10, 10);
    let y = 20;
    generatedPlan.days.forEach((day: any) => {
      doc.text(`День ${day.day}: ${day.total_calories} ккал`, 10, y);
      y += 10;
      day.meals.forEach((m: any) => {
        doc.text(`- ${m.type}: ${m.meal.name}`, 15, y);
        y += 7;
      });
      y += 5;
      if (y > 275) { doc.addPage(); y = 20; }
    });
    doc.save("plan.pdf");
  };

  if (!subLoading && !hasPaidPlan) return <div className="p-20 text-center"><Crown className="mx-auto h-12 w-12 text-amber-500 mb-4"/><Button onClick={() => navigate('/profile/premium')}>Открыть Premium</Button></div>;

  return (
    <div className="page-container pb-24 max-w-2xl mx-auto">
      <header className="p-4 border-b bg-background sticky top-0 z-50 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-500" /> <h1 className="font-bold text-lg">Генератор меню</h1>
      </header>

      {!generatedPlan ? (
        <div className="p-4 space-y-8">
          <section>
            <Label className="mb-3 block font-bold">Кухни мира (20 типов)</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(c => (
                <Badge 
                  key={c.id} 
                  variant={formData.cuisines.includes(c.id) ? "default" : "outline"} 
                  className="cursor-pointer py-1.5 px-3 transition-all"
                  onClick={() => setFormData(p => ({ 
                    ...p, 
                    cuisines: p.cuisines.includes(c.id) ? p.cuisines.filter(x => x !== c.id) : [...p.cuisines, c.id] 
                  }))}
                >
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <Label className="mb-3 block font-bold">Диетические предпочтения</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <Badge 
                  key={d.id} 
                  variant={formData.diets.includes(d.id) ? "secondary" : "outline"} 
                  className={`cursor-pointer py-1.5 px-3 ${formData.diets.includes(d.id) ? 'bg-green-600 text-white' : ''}`}
                  onClick={() => setFormData(p => ({ 
                    ...p, 
                    diets: p.diets.includes(d.id) ? p.diets.filter(x => x !== d.id) : [...p.diets, d.id] 
                  }))}
                >
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ккал в день</Label><Input type="number" value={formData.calories} onChange={e => setFormData(p => ({ ...p, calories: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Аллергии</Label><Input placeholder="Напр. орехи" value={formData.allergies} onChange={e => setFormData(p => ({ ...p, allergies: e.target.value }))} /></div>
          </div>

          <section>
            <Label className="mb-3 block font-bold">Количество порций: {formData.servings}</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <Button key={n} variant={formData.servings === n ? "default" : "outline"} className="flex-1" onClick={() => setFormData(p => ({ ...p, servings: n }))}>{n}</Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="font-bold">Приёмы пищи</Label>
            {MEAL_TYPES.map(meal => (
              <div key={meal.id} className={`flex items-center justify-between p-4 border rounded-xl ${formData.mealSettings[meal.id].enabled ? 'border-violet-200 bg-violet-50/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={formData.mealSettings[meal.id].enabled} 
                    onCheckedChange={() => setFormData(p => ({ 
                      ...p, 
                      mealSettings: { ...p.mealSettings, [meal.id]: { ...p.mealSettings[meal.id], enabled: !p.mealSettings[meal.id].enabled } } 
                    }))} 
                  />
                  <span>{meal.emoji} {meal.label}</span>
                </div>
                {formData.mealSettings[meal.id].enabled && (
                  <Select value={formData.mealSettings[meal.id].dishCount.toString()} onValueChange={v => setFormData(p => ({ ...p, mealSettings: { ...p.mealSettings, [meal.id]: { ...p.mealSettings[meal.id], dishCount: parseInt(v) } } }))}>
                    <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="1">1 блюдо</SelectItem><SelectItem value="2">2 блюда</SelectItem></SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </section>

          <section className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <Label className="flex items-center gap-2 mb-3 font-semibold text-amber-800"><Soup className="h-5 w-5" /> Первое блюдо (суп)</Label>
            <div className="flex gap-2">
              <Button variant={!formData.soupMeal ? "default" : "outline"} className="flex-1" onClick={() => setFormData(p => ({ ...p, soupMeal: null }))}>Без супа</Button>
              {['lunch', 'dinner'].map(m => formData.mealSettings[m].enabled && (
                <Button key={m} variant={formData.soupMeal === m ? "default" : "outline"} className="flex-1" onClick={() => setFormData(p => ({ ...p, soupMeal: m }))}>
                  {m === 'lunch' ? 'На Обед' : 'На Ужин'}
                </Button>
              ))}
            </div>
          </section>

          <Button className="w-full h-14 bg-violet-600 text-lg shadow-lg" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-5 w-5" />} Сгенерировать план
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setGeneratedPlan(null)}>← Настройки</Button>
            <Button size="icon" variant="outline" onClick={exportPDF}><Download className="h-4 w-4" /></Button>
          </div>
          <Tabs defaultValue="plan">
            <TabsList className="w-full grid grid-cols-2"><TabsTrigger value="plan">📅 План</TabsTrigger><TabsTrigger value="shopping">🛒 Покупки</TabsTrigger></TabsList>
            <TabsContent value="plan" className="space-y-4 mt-6">
              {generatedPlan.days.map((day: any) => (
                <Card key={day.day}>
                  <CardHeader className="p-4 bg-muted/30 font-bold flex flex-row justify-between items-center">
                    <span>День {day.day}</span> <Badge>{day.total_calories} ккал</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    {day.meals.map((m: any, idx: number) => (
                      <div key={idx} className="p-4 border-b last:border-0 flex justify-between items-center cursor-pointer hover:bg-muted/10" onClick={() => setSelectedMeal(m.meal)}>
                        <div><p className="text-[10px] uppercase font-bold text-muted-foreground">{m.type}</p><p className="font-semibold">{m.meal.name}</p></div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="shopping" className="mt-6 space-y-4">
              {generatedPlan.shopping_list.map((cat: any, i: number) => (
                <Card key={i}>
                  <CardHeader className="p-3 bg-muted/20 font-bold text-sm uppercase">{cat.category}</CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {cat.items.map((it: any, j: number) => (
                      <div key={j} className="flex justify-between text-sm"><span>{it.name}</span><span className="text-muted-foreground">{it.amount}</span></div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          {selectedMeal && (
            <div className="space-y-6">
              <DialogHeader><DialogTitle>{selectedMeal.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-4 text-center border-y py-3 text-sm font-bold">
                <div>{selectedMeal.calories}<p className="text-[10px] font-normal uppercase">ккал</p></div>
                <div className="text-green-600">{selectedMeal.protein}г<p className="text-[10px] font-normal uppercase">белки</p></div>
                <div className="text-orange-600">{selectedMeal.carbs}г<p className="text-[10px] font-normal uppercase">угл</p></div>
                <div className="text-yellow-600">{selectedMeal.fat}г<p className="text-[10px] font-normal uppercase">жиры</p></div>
              </div>
              <div><h4 className="font-bold mb-2">Ингредиенты:</h4>
                <ul className="text-sm space-y-1">{selectedMeal.recipe.ingredients.map((ing: any, i: number) => (<li key={i} className="flex justify-between"><span>{ing.name}</span><span>{ing.amount}</span></li>))}</ul>
              </div>
              <div><h4 className="font-bold mb-2">Шаги приготовления:</h4>
                <div className="space-y-3">{selectedMeal.recipe.steps.map((s: string, i: number) => (<div key={i} className="flex gap-2 text-sm"><b>{i+1}.</b><p>{s}</p></div>))}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
