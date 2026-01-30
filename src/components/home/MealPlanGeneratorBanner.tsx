import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Utensils, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import mealPlanGeneratorBg from '@/assets/banners/meal-plan-generator-bg.jpg';

export function MealPlanGeneratorBanner() {
  const navigate = useNavigate();
  const { hasPaidPlan, loading } = useSubscription();
  
  const handleClick = (e: React.MouseEvent) => {
    if (!loading && !hasPaidPlan) {
      e.preventDefault();
      toast('Премиум-функция', {
        description: 'ИИ-генератор меню доступен для платных тарифов',
        action: {
          label: 'Перейти',
          onClick: () => navigate('/profile/premium'),
        },
        icon: <Crown className="h-5 w-5 text-amber-500" />,
      });
    }
  };
  
  return (
    <Link to="/meal-plan-generator" onClick={handleClick} className="block">
      <div className="relative overflow-hidden rounded-2xl h-[140px]">
        {/* Background Image */}
        <SafeImage 
          src={mealPlanGeneratorBg} 
          alt="Meal Plan Generator" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/90 via-purple-600/80 to-fuchsia-600/60" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
              <span className="text-white/90 text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full">
                AI-powered
              </span>
              {!loading && !hasPaidPlan && (
                <span className="text-white/90 text-xs font-medium bg-amber-500/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-white mb-0.5">
              Создай персональное меню
            </h3>
            <p className="text-white/80 text-xs mb-2">
              ИИ подберёт идеальный рацион под твои предпочтения
            </p>
            
            <Button 
              size="sm" 
              className="bg-white text-purple-700 hover:bg-white/90 font-semibold shadow-lg h-8 text-xs"
            >
              <Utensils className="h-3.5 w-3.5 mr-1" />
              Создать
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
