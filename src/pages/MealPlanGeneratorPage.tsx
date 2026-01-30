import { useState } from 'react';
import { 
  Sparkles, Loader2, ChefHat, Heart, Save, Utensils, 
  Info, Soup, Zap, ChevronDown, Download, Apple, Coffee, Sun, Moon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CUISINES = [
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

const DIETS = [
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

  const [formData, setFormData] = useState({
    cuisines: ['it', 'ru'],
    diets: ['lowcarb'],
    calories: '1650',
    allergies: 'орехи, морепрод',
    servings: 3,
    soupOption: 'lnc',
    days: '3',
    meals: MEAL_TIMES.reduce((acc, m) => ({ ...acc, [m.id]: { enabled: true, count: 1 } }), {} as any)
  });

  const processImage = async (name: string) => {
    try {
      const { data } = await supabase.from('recipe_photos').select('public_url').eq('recipe_name', name).maybeSingle();
      if (data) return data.public_url;

      const res = await fetch(`https://source.unsplash.com/featured/?dish,${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const path = `meals/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      
      const { error: uploadError } = await supabase.storage.from('recipe-photos').upload(path, blob);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('recipe-photos').getPublicUrl(path);
      await supabase.from('recipe_photos').insert({ recipe_name: name, storage_path: path, public_url: publicUrl });
      return publicUrl;
    } catch { 
      return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=800'; 
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', { 
        body: { prompt_params: formData } 
      });

      if (error) throw error;
      if (!data?.plan) throw new Error("Неверный формат ответа от сервера");

      setProgress(50);
      const enrichedPlan = data.plan;

      for (const day of enrichedPlan.days) {
        for (const m of day.meals) {
          if (m.items?.[0]) {
            m.items[0].imageUrl = await processImage(m.items[0].name);
          }
        }
      }

      setPlan(enrichedPlan);
      toast.success('Меню успешно создано!');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message === 'Failed to fetch' ? 'Ошибка сети. Проверьте VPN или прокси.' : e.message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const saveToFavorites = async (meal: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return toast.error("Войдите в систему для сохранения");

      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        recipe_name: meal.name,
        recipe_data: meal,
        image_url: meal.imageUrl
      });

      if (error) throw error;
      toast.success("Рецепт в избранном!");
    } catch (e: any) {
      toast.error("Ошибка сохранения");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#00b27a] min-h-screen text-white pb-24 font-sans">
      <header className="p-4 flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-xl"><Sparkles size={20}/></div>
        <div>
          <h1 className="font-bold text-lg leading-none">Генератор меню</h1>
          <p className="text-[10px] opacity-70">Персональный план питания с ИИ</p>
        </div>
      </header>

      {isGenerating ? (
        <div className="p-10 text-center space-y-6 animate-pulse">
          <Loader2 className="animate-spin mx-auto h-12 w-12 opacity-40" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Создаем ваш идеальный рацион...</p>
            <Progress value={progress} className="h-1 bg-white/20" />
          </div>
        </div>
      ) : !plan ? (
        <div className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {/* КУХНИ */}
          <section>
            <Label className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-3 flex items-center gap-2">
              <Utensils size={14}/> Тип кухни
            </Label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <Badge 
                  key={c.id} 
                  className={`rounded-full py-2 px-4 border-none cursor-pointer transition-all active:scale-90 ${formData.cuisines.includes(c.id) ? 'bg-white text-[#00b27a] shadow-lg' : 'bg-white/10 opacity-70'}`}
                  onClick={() => setFormData(f => ({ ...f, cuisines: f.cuisines.includes(c.id) ? f.cuisines.filter(x => x !== c.id) : [...f.cuisines, c.id] }))}
                >
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* ДИЕТЫ */}
          <section>
            <Label className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-3 flex items-center gap-2">
              <Zap size={14}/> Диета
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIETS.map(d => (
                <Badge 
                  key={d.id} 
                  className={`rounded-full py-2 px-4 border-none cursor-pointer transition-all ${formData.diets.includes(d.id) ? 'bg-[#3b82f6] shadow-md' : 'bg-white/10 opacity-70'}`}
                  onClick={() => setFormData(f => ({ ...f, diets: f.diets.includes(d.id) ? f.diets.filter(x => x !== d.id) : [...f.diets, d.id] }))}
                >
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* КАЛОРИИ И АЛЛЕРГИИ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold opacity-70">Калории/день</Label>
              <Input className="bg-white/10 border-none h-12 rounded-xl" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold opacity-70">Аллергии</Label>
              <Input className="bg-white/10 border-none h-12 rounded-xl" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})}/>
            </div>
          </div>

          {/* ПОРЦИИ */}
          <section>
            <Label className="text-[11px] font-bold uppercase opacity-80 mb-3 block text-center">Порций (едоков): {formData.servings}</Label>
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <Button key={n} variant="ghost" className={`flex-1 min-w-[40px] h-10 rounded-full ${formData.servings === n ? 'bg-blue-500 shadow-md' : 'bg-white/10'}`} onClick={() => setFormData({...formData, servings: n})}>{n}</Button>
              ))}
            </div>
          </section>

          {/* ПРИЕМЫ ПИЩИ */}
          <section className="space-y-3">
            <Label className="text-[11px] font-bold uppercase opacity-80 mb-1 block">Приёмы пищи</Label>
            {MEAL_TIMES.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    className="w-5 h-5 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-[#00b27a]" 
                    checked={formData.meals[m.id].enabled} 
                    onCheckedChange={(v) => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], enabled: !!v}}})}
                  />
                  <span className="text-sm font-medium">{m.emoji} {m.label}</span>
                </div>
                <Select value={formData.meals[m.id].count.toString()} onValueChange={v => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], count: parseInt(v)}}})}>
                  <SelectTrigger className="w-24 bg-black/20 border-none h-8 text-[11px] rounded-lg"><SelectValue /></SelectTrigger>
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
          <section className="bg-white/5 p-4 rounded-3xl space-y-3">
            <Label className="text-[11px] font-bold uppercase opacity-80 flex items-center gap-2"><Soup size={14}/> Первое блюдо (суп)</Label>
            <div className="flex gap-2">
              {[{id:'no', l:'Без супа'}, {id:'lnc', l:'🍲 На обед'}, {id:'din', l:'🍲 На ужин'}].map(s => (
                <Button key={s.id} variant="ghost" className={`flex-1 text-[11px] h-10 rounded-full transition-all ${formData.soupOption === s.id ? 'bg-[#00b27a] border-white/20 border shadow-lg' : 'bg-white/5'}`} onClick={() => setFormData({...formData, soupOption: s.id})}>{s.l}</Button>
              ))}
            </div>
          </section>

          {/* КОЛИЧЕСТВО ДНЕЙ */}
          <section className="space-y-3">
            <Label className="text-[11px] font-bold uppercase opacity-80">Количество дней</Label>
            <div className="grid grid-cols-4 gap-2">
              {[{v:'1', l:'1 день'}, {v:'3', l:'3 дня'}, {v:'7', l:'7 дней'}, {v:'14', l:'14 дней'}].map(d => (
                <Button key={d.v} className={`h-14 rounded-2xl text-[11px] transition-all ${formData.days === d.v ? 'bg-blue-600 shadow-xl scale-105' : 'bg-white/10 opacity-70'}`} onClick={() => setFormData({...formData, days: d.v})}>{d.l}</Button>
              ))}
            </div>
          </section>

          <Button className="w-full h-16 bg-[#9333ea] rounded-2xl text-lg font-bold shadow-2xl active:scale-95 transition-all" onClick={handleGenerate}>
            <Sparkles className="mr-2" size={20}/> Создать
          </Button>
        </div>
      ) : (
        /* РЕЗУЛЬТАТЫ */
        <div className="p-4 space-y-6 animate-in slide-in-from-bottom-5">
          <Tabs defaultValue="days">
            <TabsList className="grid grid-cols-2 bg-black/20 rounded-2xl p-1 mb-4">
              <TabsTrigger value="days" className="rounded-xl">📅 План</TabsTrigger>
              <TabsTrigger value="shop" className="rounded-xl">🛒 Покупки</TabsTrigger>
            </TabsList>
            <TabsContent value="days" className="space-y-6">
              {plan.days?.map((day: any) => (
                <div key={day.day} className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase opacity-60 ml-2 tracking-widest">День {day.day}</h3>
                  {day.meals?.map((m: any, idx: number) => (
                    <Card 
                      key={idx} 
                      className="bg-white text-black border-none rounded-2xl overflow-hidden shadow-lg flex cursor-pointer active:scale-98 transition-transform" 
                      onClick={() => setSelectedMeal(m.items?.[0])}
                    >
                      <img src={m.items?.[0]?.imageUrl} className="w-24 h-24 object-cover" alt="food" />
                      <div className="p-4 flex-1">
                        <p className="text-[9px] font-bold text-[#00b27a] uppercase mb-1">{m.type}</p>
                        <h4 className="font-bold text-sm leading-tight mb-2">{m.items?.[0]?.name}</h4>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100">{m.items?.[0]?.calories} ккал</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </TabsContent>
          </Tabs>
          <Button variant="ghost" className="w-full text-white/60 text-xs" onClick={() => setPlan(null)}>Сбросить и создать новый</Button>
        </div>
      )}

      {/* ДИАЛОГ РЕЦЕПТА */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 border-none bg-white text-black rounded-t-3xl sm:rounded-3xl shadow-2xl">
          {selectedMeal && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <img src={selectedMeal.imageUrl} className="w-full h-64 object-cover" alt="meal" />
              <div className="p-6 space-y-6">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <DialogTitle className="text-2xl font-bold leading-tight flex-1">{selectedMeal.name}</DialogTitle>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => saveToFavorites(selectedMeal)}><Heart size={24} /></Button>
                  </div>
                  <DialogDescription className="text-xs uppercase font-bold text-slate-400 pt-2 tracking-tighter">
                    КБЖУ: {selectedMeal.calories}ккал | Б:{selectedMeal.protein}г | Ж:{selectedMeal.fat}г | У:{selectedMeal.carbs}г
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2 border-b pb-2"><ChefHat size={18} className="text-[#00b27a]"/> Ингредиенты</h4>
                  <div className="grid gap-2 text-sm">
                    {selectedMeal.recipe?.ingredients?.map((ing: any, i: number) => (
                      <div key={i} className="flex justify-between border-b border-slate-50 pb-1 italic">
                        <span>{ing.name}</span><span className="font-bold not-italic">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="font-bold flex items-center gap-2 pt-2 border-b pb-2"><Info size={18} className="text-[#00b27a]"/> Приготовление</h4>
                  <div className="space-y-4">
                    {selectedMeal.recipe?.steps?.map((step: string, i: number) => (
                      <div key={i} className="flex gap-4">
                        <span className="w-6 h-6 rounded-full bg-[#00b27a]/10 text-[#00b27a] flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
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
