import { useState, useEffect } from 'react';
import { Sparkles, Loader2, ChefHat, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function MealPlanGeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [plan, setPlan] = useState<any>(null);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);

  // --- ЛОГИКА СОХРАНЕНИЯ ФАЙЛА В STORAGE ---
  const uploadImageToStorage = async (recipeName: string) => {
    try {
      // 1. Проверяем, есть ли уже такое фото в нашей базе
      const { data: existing } = await supabase
        .from('recipe_photos')
        .select('public_url')
        .eq('recipe_name', recipeName)
        .single();

      if (existing) return existing.public_url;

      // 2. Скачиваем файл из Unsplash
      const searchUrl = `https://source.unsplash.com/featured/?dish,${encodeURIComponent(recipeName)}`;
      const response = await fetch(searchUrl);
      const blob = await response.blob();
      
      const fileName = `${recipeName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
      const filePath = `meals/${fileName}`;

      // 3. Загружаем файл в Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      // 4. Получаем публичную ссылку
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-photos')
        .getPublicUrl(filePath);

      // 5. Записываем данные в таблицу кэша
      await supabase.from('recipe_photos').insert({
        recipe_name: recipeName,
        storage_path: filePath,
        public_url: publicUrl
      });

      return publicUrl;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      return 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80&w=1000'; // Заглушка
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);
    try {
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: { prompt_params: { days: "3", calories: "1800" } } // Упрощено для примера
      });

      if (error) throw error;
      setProgress(50);

      const enrichedPlan = { ...data.plan };

      // Обработка всех блюд: скачиваем и сохраняем каждое фото
      for (const day of enrichedPlan.days) {
        for (const meal of day.meals) {
          for (const item of meal.items) {
            item.imageUrl = await uploadImageToStorage(item.name);
          }
        }
      }

      setPlan(enrichedPlan);
      toast.success('План создан, фото сохранены в хранилище!');
    } catch (e: any) {
      toast.error('Ошибка: ' + e.message);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#00b27a] min-h-screen text-white p-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-black italic flex justify-center items-center gap-2">
          <Sparkles /> SMART MENU
        </h1>
      </header>

      {isGenerating ? (
        <div className="mt-20 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <Loader2 className="animate-spin h-full w-full opacity-20" />
            <ChefHat className="absolute inset-0 m-auto h-8 w-8" />
          </div>
          <div className="space-y-2">
            <p className="text-sm opacity-80">Загружаем и сохраняем фото блюд...</p>
            <Progress value={progress} className="h-1 bg-white/20" />
          </div>
        </div>
      ) : !plan ? (
        <Button 
          className="w-full h-16 bg-black text-white rounded-2xl text-lg font-bold shadow-2xl" 
          onClick={handleGenerate}
        >
          Сгенерировать меню
        </Button>
      ) : (
        <div className="space-y-6 animate-in fade-in">
          {/* Рендер плана аналогично предыдущим шагам, используя item.imageUrl */}
          <Tabs defaultValue="days">
            <TabsList className="grid grid-cols-2 bg-black/10 rounded-2xl">
              <TabsTrigger value="days">План</TabsTrigger>
              <TabsTrigger value="shop">Продукты</TabsTrigger>
            </TabsList>
            
            <TabsContent value="days" className="pt-4 space-y-4">
              {plan.days.map((day: any) => (
                <div key={day.day} className="space-y-3">
                  <h3 className="text-sm font-bold opacity-60 uppercase">День {day.day}</h3>
                  {day.meals.map((m: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="bg-white rounded-2xl flex overflow-hidden cursor-pointer"
                      onClick={() => setSelectedMeal(m.items[0])}
                    >
                      <img src={m.items[0].imageUrl} className="w-24 h-24 object-cover" alt="food" />
                      <div className="p-4 flex-1 text-black">
                        <p className="text-[10px] font-bold text-[#00b27a] uppercase">{m.type}</p>
                        <h4 className="font-bold text-sm leading-tight">{m.items[0].name}</h4>
                        <p className="text-xs opacity-50">{m.items[0].calories} ккал</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Модальное окно с деталями и рецептом */}
      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 border-none bg-white text-black sm:rounded-3xl">
          {selectedMeal && (
            <div>
              <img src={selectedMeal.imageUrl} className="w-full h-64 object-cover" alt="meal" />
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{selectedMeal.name}</DialogTitle>
                  <DialogDescription>Детальный рецепт из вашего хранилища</DialogDescription>
                </DialogHeader>
                {/* Рендер состава и шагов */}
                <div className="mt-6 space-y-4">
                  <h4 className="font-bold">Ингредиенты:</h4>
                  {selectedMeal.recipe.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex justify-between border-b pb-2 text-sm">
                      <span>{ing.name}</span><span className="font-bold">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
