import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Soup, Loader2, ChevronDown, Download, 
  ChefHat, Calendar, Apple, Crown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

// --- КОНСТАНТЫ (20 кухонь, 9 диет) ---
const CUISINE_TYPES = [
  { id: 'it', label: 'Итальянская', emoji: '🍝' }, { id: 'fr', label: 'Французская', emoji: '🥐' },
  { id: 'ge', label: 'Грузинская', emoji: '🫓' }, { id: 'ru', label: 'Русская', emoji: '🥟' },
  { id: 'jp', label: 'Японская', emoji: '🍣' }, { id: 'th', label: 'Тайская', emoji: '🍜' },
  { id: 'mx', label: 'Мексиканская', emoji: '🌮' }, { id: 'in', label: 'Индийская', emoji: '🍛' },
  { id: 'cn', label: 'Китайская', emoji: '🥡' }, { id: 'gr', label: 'Греческая', emoji: '🥙' },
  { id: 'es', label: 'Испанская', emoji: '🥘' }, { id: 'kr', label: 'Корейская', emoji: '🍲' },
  { id: 'vn', label: 'Вьетнамская', emoji: '🍜' }, { id: 'us', label: 'Американская', emoji: '🍔' },
  { id: 'me', label: 'Ближневосточная', emoji: '🧆' }, { id: 'tr', label: 'Турецкая', emoji: '🥙' },
  { id: 'ma', label: 'Марокканская', emoji: '🥘' }, { id: 'br', label: 'Бразильская', emoji: '🍖' },
  { id: 'md', label: 'Средиземноморская', emoji: '🫒' }, { id: 'af', label: 'Азиатский фьюжн', emoji: '🥢' }
];

const DIET_TYPES = [
  { id: 'vegan', label: 'Веганская', emoji: '🌱' }, { id: 'keto', label: 'Кето', emoji: '🥑' },
  { id: 'paleo', label: 'Палео', emoji: '🍖' }, { id: 'lactose', label: 'Безлактозная', emoji: '🥛' },
  { id: 'gluten', label: 'Безглютеновая', emoji: '🌾' }, { id: 'vege', label: 'Вегетарианская', emoji: '🥬' },
  { id: 'lowcarb', label: 'Низкоуглеводная', emoji: '📉' }, { id: 'highprotein', label: 'Высокобелковая', emoji: '💪' }
];

const MEAL_TIMES = [
  { id: 'brk', label: 'Завтрак', emoji: '🍳' }, { id: 'sn1', label: 'Перекус 1', emoji: '🍎' },
  { id: 'lnc', label: 'Обед', emoji: '🍲' }, { id: 'sn2', label: 'Перекус 2', emoji: '🥜' },
  { id: 'din', label: 'Ужин', emoji: '🥗' }, { id: 'lsn', label: 'Поздний ужин', emoji: '🌙' }
];

export default function MealPlanGeneratorPage() {
  const navigate = useNavigate();
  const { hasPaidPlan, loading: subLoading } = useSubscription();
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  const [formData, setFormData] = useState({
    cuisines: [] as string[],
    diets: [] as string[],
    calories: '1650',
    allergies: '',
    servings: 3,
    days: '3',
    soupOption: 'no_soup',
    meals: MEAL_TIMES.reduce((acc, m) => ({
      ...acc, [m.id]: { enabled: true, count: 1 }
    }), {} as any)
  });

  const savePlanToDatabase = async (planData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('meal_plans').insert({
        user_id: user.id,
        plan_data: planData,
        calories: parseInt(formData.calories),
        days: parseInt(formData.days),
        cuisines: formData.cuisines
      });
      toast.success("План сохранен");
    } catch (e: any) { console.error(e.message); }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { prompt_params: formData }
      });
      if (error) throw error;
      setPlan(data.plan);
      await savePlanToDatabase(data.plan);
    } catch (e: any) {
      toast.error('Ошибка: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Meal Plan", 10, 10);
    doc.save("plan.pdf");
  };

  if (!subLoading && !hasPaidPlan) return (
    <div className="p-20 text-center bg-[#00b27a] min-h-screen text-white">
      <Crown className="mx-auto h-12 w-12 mb-4 text-yellow-300"/>
      <Button variant="secondary" onClick={() => navigate('/profile/premium')}>Активировать Premium</Button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-[#00b27a] min-h-screen text-white pb-24 font-sans">
      <header className="p-4 flex items-center gap-2 sticky top-0 bg-[#00b27a] z-50 border-b border-white/10">
        <Sparkles className="text-purple-400 h-5 w-5" />
        <h1 className="font-bold text-lg">Генератор меню</h1>
      </header>

      {!plan ? (
        <div className="p-4 space-y-6">
          <section>
            <Label className="text-sm font-semibold mb-3 block">Тип кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(c => (
                <Badge key={c.id} variant="outline" className={`cursor-pointer rounded-full py-2 px-4 border-white/20 ${formData.cuisines.includes(c.id) ? 'bg-white text-[#00b27a]' : 'bg-white/10'}`} onClick={() => setFormData(f => ({ ...f, cuisines: f.cuisines.includes(c.id) ? f.cuisines.filter(i => i !== c.id) : [...f.cuisines, c.id] }))}>
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <Label className="text-sm font-semibold mb-3 block">Диета</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <Badge key={d.id} className={`cursor-pointer rounded-full py-2 px-4 ${formData.diets.includes(d.id) ? 'bg-blue-500 text-white' : 'bg-white/10'}`} onClick={() => setFormData(f => ({ ...f, diets: f.diets.includes(d.id) ? f.diets.filter(i => i !== d.id) : [...f.diets, d.id] }))}>
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <Input type="number" className="bg-white/10 border-white/20 h-12 rounded-xl" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} />
            <Input className="bg-white/10 border-white/20 h-12 rounded-xl" placeholder="Аллергии" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
          </div>

          <section className="space-y-3">
            {MEAL_TIMES.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Checkbox checked={formData.meals[m.id].enabled} onCheckedChange={(val) => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], enabled: !!val}}})} />
                  <span className="text-sm">{m.emoji} {m.label}</span>
                </div>
                <Select value={formData.meals[m.id].count.toString()} onValueChange={v => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], count: parseInt(v)}}})}>
                  <SelectTrigger className="w-28 bg-white/5 border-none h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">Блюд: 1</SelectItem><SelectItem value="2">Блюд: 2</SelectItem></SelectContent>
                </Select>
              </div>
            ))}
          </section>

          <Button className="w-full h-16 bg-purple-600 rounded-3xl text-xl font-bold" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="animate-spin" /> : "🚀 Создать"}
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <Button variant="ghost" onClick={() => setPlan(null)}>← Назад</Button>
          <Tabs defaultValue="days">
            <TabsList className="w-full bg-white/10"><TabsTrigger value="days" className="flex-1">📅 План</TabsTrigger><TabsTrigger value="shop" className="flex-1">🛒 Покупки</TabsTrigger></TabsList>
            <TabsContent value="days" className="pt-4 space-y-4">
              {plan.days?.map((day: any) => (
                <Card key={day.day} className="bg-white/10 text-white border-none rounded-2xl">
                  <CardHeader className="p-4 border-b border-white/5 flex flex-row justify-between items-center">
                    <span className="font-bold">День {day.day}</span>
                    <Badge className="bg-blue-500">{day.total_calories} ккал</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    {day.meals?.map((m: any, idx: number) => (
                      <div key={idx} className="p-4 border-b border-white/5 flex justify-between items-center cursor-pointer" onClick={() => setSelectedMeal(m.items[0])}>
                        <div><p className="text-[10px] opacity-40 uppercase font-bold">{m.type}</p><p className="text-sm">{m.items[0]?.name}</p></div>
                        <ChevronDown className="h-4 w-4 opacity-40" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* ИСПРАВЛЕННЫЙ DIALOGCONTENT */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#00b27a] text-white border-white/20 rounded-t-3xl">
          {selectedMeal && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedMeal.name}</DialogTitle>
                {/* Исправляет ошибку Missing Description */}
                <DialogDescription className="text-white/60 text-xs">
                  Детальная информация о рецепте и составе блюда.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-4 gap-2 text-center bg-white/10 p-4 rounded-2xl">
                <div><p className="text-lg font-bold">{selectedMeal.calories}</p><p className="text-[8px] uppercase opacity-60">Ккал</p></div>
                <div><p className="text-lg font-bold">{selectedMeal.protein}г</p><p className="text-[8px] uppercase opacity-60">Белки</p></div>
                <div><p className="text-lg font-bold">{selectedMeal.carbs}г</p><p className="text-[8px] uppercase opacity-60">Углев</p></div>
                <div><p className="text-lg font-bold">{selectedMeal.fat}г</p><p className="text-[8px] uppercase opacity-60">Жиры</p></div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold flex items-center gap-2"><ChefHat size={16}/> Ингредиенты:</h4>
                <ul className="text-sm space-y-1 bg-white/5 p-4 rounded-2xl">
                  {selectedMeal.recipe?.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-white/5 pb-1">
                      <span>{ing.name}</span><span className="opacity-60">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold flex items-center gap-2"><Calendar size={16}/> Приготовление:</h4>
                {selectedMeal.recipe?.steps?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm bg-white/5 p-3 rounded-xl leading-relaxed">
                    <span className="font-bold text-blue-300">{i+1}.</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
