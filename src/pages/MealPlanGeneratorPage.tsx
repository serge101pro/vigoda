import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Soup, Loader2, ChevronDown, Download, 
  ChefHat, Calendar, Apple, Crown, Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

// --- КОНСТАНТЫ (Восстановлены полностью по скриншоту) ---
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

  // --- ФУНКЦИЯ СОХРАНЕНИЯ В БАЗУ ---
  const savePlanToDatabase = async (planData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          plan_data: planData,
          calories: parseInt(formData.calories),
          days: parseInt(formData.days),
          cuisines: formData.cuisines
        });

      if (error) throw error;
      toast.success("План сохранен в истории");
    } catch (e: any) {
      console.error("Save error:", e.message);
    }
  };

  // --- ГЕНЕРАЦИЯ ---
  const handleGenerate = async () => {
    setIsGenerating(true);
    setPlan(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { prompt_params: formData }
      });
      
      if (error) throw error;
      if (!data?.plan) throw new Error("Некорректный ответ от ИИ");

      setPlan(data.plan);
      await savePlanToDatabase(data.plan);
      toast.success('План готов!');
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
    (plan.days || []).forEach((day: any) => {
      doc.text(`День ${day.day}`, 10, y); y += 10;
      (day.meals || []).forEach((m: any) => {
        (m.items || []).forEach((item: any) => {
          doc.text(`- ${m.type}: ${item.name}`, 15, y); y += 7;
        });
      });
      y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("meal-plan.pdf");
  };

  if (!subLoading && !hasPaidPlan) return (
    <div className="p-20 text-center bg-[#00b27a] min-h-screen text-white">
      <Crown className="mx-auto h-12 w-12 mb-4 text-yellow-300"/>
      <h2 className="text-xl font-bold mb-4">Требуется Premium подписка</h2>
      <Button variant="secondary" onClick={() => navigate('/profile/premium')}>Активировать</Button>
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
          {/* КУХНИ */}
          <section>
            <Label className="text-sm font-semibold mb-3 block">Тип кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(c => (
                <Badge 
                  key={c.id}
                  variant="outline"
                  className={`cursor-pointer rounded-full py-2 px-4 border-white/20 transition-colors ${formData.cuisines.includes(c.id) ? 'bg-white text-[#00b27a]' : 'bg-white/10'}`}
                  onClick={() => setFormData(f => ({
                    ...f, cuisines: f.cuisines.includes(c.id) ? f.cuisines.filter(i => i !== c.id) : [...f.cuisines, c.id]
                  }))}
                >
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* ДИЕТЫ */}
          <section>
            <Label className="text-sm font-semibold mb-3 block">Диета</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <Badge 
                  key={d.id}
                  className={`cursor-pointer rounded-full py-2 px-4 transition-colors ${formData.diets.includes(d.id) ? 'bg-blue-500 text-white' : 'bg-white/10'}`}
                  onClick={() => setFormData(f => ({
                    ...f, diets: f.diets.includes(d.id) ? f.diets.filter(i => i !== d.id) : [...f.diets, d.id]
                  }))}
                >
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* ВВОД ДАННЫХ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase opacity-70">Калории/день</Label>
              <Input type="number" className="bg-white/10 border-white/20 h-12 rounded-xl" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase opacity-70">Аллергии</Label>
              <Input className="bg-white/10 border-white/20 h-12 rounded-xl" placeholder="орехи, морепрод..." value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
            </div>
          </div>

          {/* ПОРЦИИ */}
          <section>
            <Label className="text-sm font-semibold mb-3 block text-center">Порций (едоков): {formData.servings}</Label>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <Button 
                  key={n} 
                  variant="ghost" 
                  className={`flex-1 h-10 p-0 rounded-full ${formData.servings === n ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'}`}
                  onClick={() => setFormData({...formData, servings: n})}
                >
                  {n}
                </Button>
              ))}
            </div>
          </section>

          {/* ПРИЕМЫ ПИЩИ */}
          <section className="space-y-3">
            <Label className="text-sm font-semibold block">Приёмы пищи</Label>
            {MEAL_TIMES.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={formData.meals[m.id].enabled} 
                    className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-[#00b27a]"
                    onCheckedChange={(val) => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], enabled: !!val}}})}
                  />
                  <span className="text-sm font-medium">{m.emoji} {m.label}</span>
                </div>
                <Select 
                  value={formData.meals[m.id].count.toString()} 
                  onValueChange={v => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], count: parseInt(v)}}})}
                >
                  <SelectTrigger className="w-28 bg-white/5 border-none h-8 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Блюд: 1</SelectItem>
                    <SelectItem value="2">Блюд: 2</SelectItem>
                    <SelectItem value="3">Блюд: 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </section>

          {/* СУП */}
          <section className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <Label className="text-xs mb-3 flex items-center gap-2 opacity-80"><Soup size={14}/> Первое блюдо (суп)</Label>
            <div className="flex gap-2">
              {[
                { id: 'no_soup', label: 'Без супа' },
                { id: 'lunch', label: '🍜 На обед' },
                { id: 'dinner', label: '🍜 На ужин' }
              ].map(opt => (
                <Button 
                  key={opt.id}
                  className={`flex-1 text-[10px] h-10 rounded-xl transition-all ${formData.soupOption === opt.id ? 'bg-white/20 border border-white/40 shadow-inner' : 'bg-white/5 border border-transparent'}`}
                  onClick={() => setFormData({...formData, soupOption: opt.id})}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </section>

          {/* КОЛИЧЕСТВО ДНЕЙ */}
          <section>
            <Label className="text-sm font-semibold mb-3 block">Количество дней</Label>
            <div className="grid grid-cols-4 gap-2">
              {['1', '3', '7', '14'].map(d => (
                <Button 
                  key={d}
                  className={`h-12 rounded-xl transition-all ${formData.days === d ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'}`}
                  onClick={() => setFormData({...formData, days: d})}
                >
                  {d} {d === '1' ? 'день' : 'дня'}
                </Button>
              ))}
            </div>
          </section>

          <Button 
            className="w-full h-16 bg-purple-600 hover:bg-purple-700 rounded-3xl text-xl font-bold shadow-2xl transition-transform active:scale-95"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin mr-2" /> : "🚀 Создать"}
          </Button>
        </div>
      ) : (
        /* РЕНДЕР ГОТОВОГО ПЛАНА */
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" className="text-white" onClick={() => setPlan(null)}>← Назад</Button>
            <Button size="icon" className="bg-white/20 rounded-full" onClick={exportPDF}><Download className="h-4 w-4" /></Button>
          </div>

          <Tabs defaultValue="days">
            <TabsList className="w-full bg-white/10 p-1 rounded-xl">
              <TabsTrigger value="days" className="flex-1 rounded-lg">📅 План</TabsTrigger>
              <TabsTrigger value="shop" className="flex-1 rounded-lg">🛒 Покупки</TabsTrigger>
            </TabsList>

            <TabsContent value="days" className="space-y-4 pt-4">
              {plan.days?.map((day: any) => (
                <Card key={day.day} className="bg-white/10 border-white/10 text-white overflow-hidden rounded-2xl">
                  <CardHeader className="p-4 bg-white/5 flex flex-row justify-between items-center border-b border-white/10">
                    <span className="font-bold">День {day.day}</span>
                    <Badge className="bg-blue-500">{day.total_calories || 0} ккал</Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    {day.meals?.map((m: any, idx: number) => (
                      <div key={idx} className="border-b border-white/5 last:border-0">
                        {m.items?.map((item: any, i: number) => (
                          <div key={i} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setSelectedMeal(item)}>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-white/40">{m.type}</p>
                              <p className="font-medium text-sm">{item.name}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-40" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="shop" className="space-y-4 pt-4">
              {plan.shopping_list?.map((cat: any, i: number) => (
                <Card key={i} className="bg-white/10 border-white/10 text-white rounded-2xl">
                  <CardHeader className="p-3 bg-white/5 font-bold text-xs uppercase opacity-70">{cat.category}</CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {cat.items?.map((it: any, j: number) => (
                      <div key={j} className="flex justify-between text-sm border-b border-white/5 pb-1">
                        <span>{it.name}</span>
                        <span className="opacity-60">{it.amount}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* ДИАЛОГ РЕЦЕПТА */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#00b27a] text-white border-white/20">
          {selectedMeal && (
            <div className="space-y-6">
              <DialogHeader><DialogTitle className="text-xl font-bold">{selectedMeal.name}</DialogTitle></DialogHeader>
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
                <h4 className="font-bold flex items-center gap-2"><Calendar size={16}/> Шаги:</h4>
                {selectedMeal.recipe?.steps?.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 text-sm bg-white/5 p-3 rounded-xl">
                    <span className="font-bold text-blue-300">{i+1}.</span>
                    <p className="leading-relaxed">{step}</p>
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
