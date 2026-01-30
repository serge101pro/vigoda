import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MealPlanGeneratorBanner() {
  return (
    <Link to="/meal-plan-generator" className="block">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-5">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-300 rounded-full blur-3xl" />
        </div>
        
        {/* Floating icons */}
        <div className="absolute top-3 right-3 text-4xl animate-bounce">🍳</div>
        <div className="absolute bottom-3 right-12 text-2xl animate-pulse">🥗</div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <span className="text-white/90 text-sm font-medium bg-white/10 px-2 py-0.5 rounded-full">
              AI-powered
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1">
            Создай персональное меню
          </h3>
          <p className="text-white/80 text-sm mb-4">
            ИИ подберёт идеальный рацион под твои предпочтения и цели
          </p>
          
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              className="bg-white text-purple-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Utensils className="h-4 w-4 mr-1.5" />
              Попробовать
            </Button>
            <div className="flex items-center text-white/80 text-sm">
              <span>Бесплатно</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
