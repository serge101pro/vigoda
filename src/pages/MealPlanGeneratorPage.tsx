import { useState } from 'react';
import { 
  Sparkles, Loader2, ChefHat, Heart, Save, Utensils, 
  Info, Soup, Zap, Coffee, Sun, Moon 
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
    allergies: '',
    servings: 2,
    soupOption: 'lnc',
    days: '3',
    meals: MEAL_TIMES.reduce((acc, m) => ({ ...acc, [m.id]: { enabled: true, count: 1 } }), {} as any)
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(15);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', { 
        body: { prompt_params: formData } 
      });

      if (error) throw error;
      if (!data?.plan) throw new Error("Ошибка формата данных");

      setPlan(data.plan);
      toast.success('План питания успешно сформирован!');
    } catch (e: any) {
      console.error(e);
      toast.error('Проблема со связью. Попробуйте обновить страницу или использовать VPN/Cloudflare.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleSaveToFavorites = async (meal: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Пожалуйста, войдите в систему");
        return;
      }

      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        recipe_name: meal.name,
        recipe_data: meal,
        image_url: meal.imageUrl
      });

      if (error) throw error;
      toast.success("Рецепт сохранен в избранное!");
    } catch (e: any) {
      toast.error("Не удалось сохранить. Возможно, рецепт уже есть в списке.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#00b27a] min-h-screen text-white pb-24 font-sans">
      <header className="p-4 flex items-center gap-3 bg-[#00b27a] sticky top-0 z-10">
        <Sparkles className="text-white" />
        <h1 className="font-bold text-xl tracking-tight">AI Нутрициолог</h1>
      </header>

      {isGenerating ? (
        <div className="p-12 text-center space-y-8 animate-in fade-in">
          <Loader2 className="animate-spin mx-auto h-16 w-16 opacity-50" />
          <div className="space-y-4">
            <Progress value={progress} className="h-1.5 bg-white/20" />
            <p className="text-sm font-medium animate-pulse">ИИ анализирует ингредиенты...</p>
          </div>
        </div>
      ) : !plan ? (
        <div className="p-5 space-y-8 pb-10 animate-in slide-in-from-bottom-4">
          <section>
            <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-4 block flex items-center gap-2">
              <Utensils size={14}/> Предпочтения в еде
            </Label>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map(c => (
                <Badge 
                  key={c.id} 
                  className={`rounded-full py-2.5 px-5 border-none cursor-pointer transition-all active:scale-95 ${formData.cuisines.includes(c.id) ? 'bg-white text-[#00b27a] shadow-xl' : 'bg-white/10 opacity-70'}`}
                  onClick={() => setFormData(f => ({ ...f, cuisines: f.cuisines.includes(c.id) ? f.cuisines.filter(x => x !== c.id) : [...f.cuisines, c.id] }))}
                >
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-4 block flex items-center gap-2">
              <Zap size={14}/> Диетические цели
            </Label>
            <div className="flex flex-wrap gap-2">
              {DIETS.map(d => (
                <Badge 
                  key={d.id} 
                  className={`rounded-full py-2.5 px-5 border-none cursor-pointer transition-all ${formData.diets.includes(d.id) ? 'bg-blue-600' : 'bg-white/10 opacity-70'}`}
                  onClick={() => setFormData(f => ({ ...f, diets: f.diets.includes(d.id) ? f.diets.filter(x => x !== d.id) : [...f.diets, d.id] }))}
                >
                  {d.emoji} {d.label}
                </Badge>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-60">Целевые калории</Label>
              <Input className="bg-white/10 border-none h-14 rounded-2xl text-lg font-medium" value={formData.calories} onChange={e => setFormData({...formData, calories: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase opacity-60">Аллергии</Label>
              <Input className="bg-white/10 border-none h-14 rounded-2xl placeholder:text-white/30" placeholder="Нет" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})}/>
            </div>
          </div>

          <section className="space-y-4">
            <Label className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-2 block">График питания</Label>
            {MEAL_TIMES.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <Checkbox 
                    className="w-6 h-6 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-[#00b27a]" 
                    checked={formData.meals[m.id].enabled} 
                    onCheckedChange={(v) => setFormData({...formData, meals: {...formData.meals, [m.id]: {...formData.meals[m.id], enabled: !!v}}})}
                  />
                  <span className="text-base font-semibold">{m.emoji} {m.label}</span>
                </div>
              </div>
            ))}
          </section>

          <Button className="w-full h-18 bg-[#9333ea] hover:bg-[#a855f7] rounded-3xl text-xl font-black shadow-[0_15px_30px_-10px_rgba(147,51,234,0.6)] active:scale-95 transition-all" onClick={handleGenerate}>
            <Sparkles className="mr-3" size={24}/> Создать меню
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-6 animate-in slide-in-from-bottom-5">
          <Tabs defaultValue="days">
            <TabsList className="grid grid-cols-2 bg-black/20 rounded-2xl p-1.5 mb-6">
              <TabsTrigger value="days" className="rounded-xl font-bold py-3">📅 План по дням</TabsTrigger>
              <TabsTrigger value="shop" className="rounded-xl font-bold py-3">🛒 Продукты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="days" className="space-y-8">
              {plan.days?.map((day: any) => (
                <div key={day.day} className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-60 ml-3">День {day.day}</h3>
                  {day.meals?.map((m: any, idx: number) => (
                    <Card 
                      key={idx} 
                      className="bg-white text-black border-none rounded-[2rem] overflow-hidden shadow-2xl flex items-center cursor-pointer active:scale-[0.98] transition-all" 
                      onClick={() => setSelectedMeal(m.items?.[0])}
                    >
                      <SafeImage src={m.items?.[0]?.imageUrl} className="w-28 h-28 object-cover" alt="food" />
                      <div className="p-5 flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#00b27a] uppercase mb-1">{m.type}</p>
                        <h4 className="font-bold text-base leading-snug truncate">{m.items?.[0]?.name}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary" className="bg-slate-100 text-[10px] px-2">{m.items?.[0]?.calories} ккал</Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </TabsContent>
          </Tabs>
          <Button variant="ghost" className="w-full text-white/50 py-8" onClick={() => setPlan(null)}>Сбросить настройки</Button>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО РЕЦЕПТА */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 border-none bg-white text-black rounded-t-[3rem] sm:rounded-[3rem] shadow-3xl">
          {selectedMeal && (
            <div className="pb-10">
              <div className="relative">
                <SafeImage src={selectedMeal.imageUrl} className="w-full h-80 object-cover" alt="meal" />
                <div className="absolute top-4 right-4">
                  <Button size="icon" className="rounded-full bg-white/90 text-red-500 hover:bg-white" onClick={() => handleSaveToFavorites(selectedMeal)}>
                    <Heart size={24} />
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black leading-tight tracking-tight">{selectedMeal.name}</DialogTitle>
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-4 py-1 font-bold">Б: {selectedMeal.protein}г</Badge>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-4 py-1 font-bold">Ж: {selectedMeal.fat}г</Badge>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-4 py-1 font-bold">У: {selectedMeal.carbs}г</Badge>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-black text-lg flex items-center gap-3">
                      <ChefHat size={22} className="text-[#00b27a]"/> Ингредиенты
                    </h4>
                    <div className="bg-slate-50 rounded-3xl p-6 space-y-3">
                      {selectedMeal.recipe?.ingredients?.map((ing: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2 last:border-0 last:pb-0">
                          <span className="font-medium">{ing.name}</span>
                          <span className="font-black text-slate-400">{ing.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-black text-lg flex items-center gap-3">
                      <Info size={22} className="text-[#00b27a]"/> Инструкция
                    </h4>
                    <div className="space-y-5">
                      {selectedMeal.recipe?.steps?.map((step: string, i: number) => (
                        <div key={i} className="flex gap-5">
                          <span className="w-8 h-8 rounded-2xl bg-[#00b27a] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-[#00b27a]/30">
                            {i+1}
                          </span>
                          <p className="text-slate-600 text-sm leading-relaxed pt-1">{step}</p>
                        </div>
                      ))}
                    </div>
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
