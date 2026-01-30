import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Soup, Loader2, ChevronDown, Download, Heart, 
  Save, FileText, CheckCircle2, ChefHat, Apple, Utensils 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

// --- ВСЕ КУХНИ СО СКРИНШОТА (20 ВАРИАНТОВ) ---
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

// --- ВСЕ ДИЕТЫ СО СКРИНШОТА (9 ВАРИАНТОВ) ---
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    cuisines: [] as string[],
    diets: [] as string[],
    calories: '1650',
    allergies: 'орехи, морепрод',
    servings: 3,
    days: '3',
    soupOption: 'no_soup',
    meals: MEAL_TIMES.reduce((acc, m) => ({
      ...acc, [m.id]: { enabled: true, count: 1 }
    }), {} as any)
  });

  // --- ЛОГИКА СОХРАНЕНИЯ ФОТО В STORAGE ---
  const processImage = async (mealName: string) => {
    try {
      const { data: existing } = await supabase.from('recipe_photos').select('public_url').eq('recipe_name', mealName).single();
      if (existing) return existing.public_url;

      const res = await fetch(`https://source.unsplash.com/featured/?dish,${encodeURIComponent(mealName)}`);
      const blob = await res.blob();
      const path = `meals/${mealName}-${Date.now()}.jpg`;
      
      await supabase.storage.from('recipe-photos').upload(path, blob);
      const { data: { publicUrl } } = supabase.storage.from('recipe-photos').getPublicUrl(path);
      
      await supabase.from('recipe_photos').insert({ recipe_name: mealName, storage_path: path, public_url: publicUrl });
      return publicUrl;
    } catch { return 'https://source.unsplash.com/featured/?food'; }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', { body: { prompt_params: formData } });
      if (error) throw error;
      
      setProgress(60);
      const enrichedPlan = data.plan;
      for (const day of enrichedPlan.days) {
        for (const meal of day.meals) {
          meal.items[0].imageUrl = await processImage(meal.items[0].name);
        }
      }

      setPlan(enrichedPlan);
      toast.success('План создан и фото сохранены!');
    } catch (e: any) { toast.error(e.message); }
    finally { setIsGenerating(false); setProgress(0); }
  };

  return (
    <div className="max-w-md mx-auto bg-[#00b27a] min-h-screen text-white pb-20 font-sans">
      <header className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2"><Sparkles /> Генератор меню</h1>
      </header>

      {isGenerating ? (
        <div className="p-10 text-center space-y-6">
          <Loader2 className="animate-spin mx-auto h-12 w-12 opacity-50" />
          <Progress value={progress} className="h-1 bg-white/20" />
        </div>
      ) : !plan ? (
        <div className="p-4 space-y-6">
          {/* КУХНИ */}
          <section>
            <Label className="text-xs uppercase font-bold opacity-70 mb-3 block">Тип кухни</Label>
            <div className="flex flex-wrap gap-2">
              {CUISINE_TYPES.map(c => (
                <Badge key={c.id} variant="outline" className={`rounded-full py-2 px-4 transition-all ${formData.cuisines.includes(c.id) ? 'bg-white text-[#00b27a]' : 'bg-white/10'}`} onClick={() => setFormData(f => ({ ...f, cuisines: f.cuisines.includes(c.id) ? f.cuisines.filter(i => i !== c.id) : [...f.cuisines, c.id] }))}>
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* ДИЕТЫ */}
          <section>
            <Label className="text-xs uppercase font-bold opacity-70 mb-3 block">Диета</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_TYPES.map(d => (
                <Badge key={d.id} className={`rounded-full py-2 px-4 ${formData.diets.includes(d.id) ? 'bg-blue-500' : 'bg-white/10'}`} onClick={() => setFormData(f => ({ ...f, diets: f.diets.includes(d.id) ? f.diets.filter(i => i !== d.id) : [...f.diets, d.id] }))}>
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* ПАРАМЕТРЫ */}
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-[10px] uppercase">Калории/день</Label><Input className="bg-white/10" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})}/></div>
            <div><Label className="text-[10px] uppercase">Аллергии</Label><Input className="bg-white/10" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})}/></div>
          </div>

          <section>
            <Label className="text-center block mb-2">Порций: {formData.servings}</Label>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <Button key={n} variant="ghost" className={`flex-1 rounded-full ${formData.servings === n ? 'bg-blue-500' : 'bg-white/10'}`} onClick={() => setFormData({...formData, servings: n})}>{n}</Button>
              ))}
            </div>
          </section>

          {/* ПРИЕМЫ ПИЩИ */}
          <section className="space-y-2">
            {MEAL_TIMES.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/10 p-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Checkbox checked={formData.meals[m.id].enabled} onCheckedChange={(val) => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], enabled: !!val}}})}/>
                  <span className="text-sm">{m.emoji} {m.label}</span>
                </div>
                <Select value={formData.meals[m.id].count.toString()} onValueChange={v => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], count: parseInt(v)}}})}>
                  <SelectTrigger className="w-24 bg-transparent border-none text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">Блюд: 1</SelectItem><SelectItem value="2">Блюд: 2</SelectItem><SelectItem value="3">Блюд: 3</SelectItem></SelectContent>
                </Select>
              </div>
            ))}
          </section>

          {/* ДНИ */}
          <section className="grid grid-cols-4 gap-2">
            {['1', '3', '7', '14'].map(d => (
              <Button key={d} className={`h-12 rounded-xl ${formData.days === d ? 'bg-blue-600' : 'bg-white/10'}`} onClick={() => setFormData({...formData, days: d})}>{d} {d === '1' ? 'день' : 'дней'}</Button>
            ))}
          </section>

          <Button className="w-full h-16 bg-purple-600 rounded-3xl text-xl font-bold shadow-2xl" onClick={handleGenerate}>Создать</Button>
        </div>
      ) : (
        /* РЕЗУЛЬТАТЫ */
        <div className="p-4 space-y-6 animate-in slide-in-from-bottom-10">
          <Tabs defaultValue="days">
            <TabsList className="grid grid-cols-2 bg-black/20 rounded-xl p-1">
              <TabsTrigger value="days" className="rounded-lg">📅 Календарь</TabsTrigger>
              <TabsTrigger value="shop" className="rounded-lg">🛒 Покупки</TabsTrigger>
            </TabsList>

            <TabsContent value="days" className="space-y-4 pt-4">
              {plan.days.map((day: any) => (
                <div key={day.day} className="space-y-2">
                  <h3 className="font-bold text-sm pl-2">ДЕНЬ {day.day}</h3>
                  {day.meals.map((m: any, idx: number) => (
                    <Card key={idx} className="bg-white text-black rounded-2xl overflow-hidden cursor-pointer" onClick={() => setSelectedMeal(m.items[0])}>
                      <div className="flex">
                        <img src={m.items[0].imageUrl} className="w-24 h-24 object-cover" />
                        <div className="p-3">
                          <p className="text-[10px] font-bold text-[#00b27a] uppercase">{m.type}</p>
                          <h4 className="font-bold text-sm leading-tight">{m.items[0].name}</h4>
                          <p className="text-xs opacity-50">{m.items[0].calories} ккал</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="shop" className="pt-4">
              <Card className="bg-white text-black rounded-3xl p-6">
                <h3 className="text-xl font-bold mb-4">Список покупок</h3>
                {plan.shopping_list.map((cat: any, i: number) => (
                  <div key={i} className="mb-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">{cat.category}</h4>
                    {cat.items.map((it: any, j: number) => (
                      <div key={j} className="flex items-center gap-3 mb-2">
                        <Checkbox id={`${i}-${j}`} checked={checkedItems.includes(`${i}-${j}`)} onCheckedChange={() => setCheckedItems(p => p.includes(`${i}-${j}`) ? p.filter(x => x !== `${i}-${j}`) : [...p, `${i}-${j}`])}/>
                        <label htmlFor={`${i}-${j}`} className={`text-sm flex-1 ${checkedItems.includes(`${i}-${j}`) ? 'line-through opacity-30' : ''}`}>{it.name}</label>
                        <span className="text-xs font-bold text-slate-400">{it.amount}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* МОДАЛКА РЕЦЕПТА */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 border-none bg-white text-black sm:rounded-3xl">
          {selectedMeal && (
            <div className="relative">
              <img src={selectedMeal.imageUrl} className="w-full h-64 object-cover" />
              <div className="p-6 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold leading-tight">{selectedMeal.name}</DialogTitle>
                  <DialogDescription>КБЖУ: {selectedMeal.calories}ккал | Б:{selectedMeal.protein}г | Ж:{selectedMeal.fat}г | У:{selectedMeal.carbs}г</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2"><ChefHat /> Ингредиенты</h4>
                  <div className="text-sm space-y-1">
                    {selectedMeal.recipe.ingredients.map((ing: any, i: number) => (
                      <div key={i} className="flex justify-between border-b pb-1"><span>{ing.name}</span><b>{ing.amount}</b></div>
                    ))}
                  </div>
                  <h4 className="font-bold flex items-center gap-2"><Apple /> Инструкция</h4>
                  <div className="space-y-2">
                    {selectedMeal.recipe.steps.map((step: string, i: number) => (
                      <p key={i} className="text-sm leading-relaxed"><b className="text-[#00b27a]">{i+1}.</b> {step}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
