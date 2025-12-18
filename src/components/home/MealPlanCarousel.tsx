import { Link } from 'react-router-dom';
import { Clock, Users, Flame, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface MealPlan {
  id: string;
  name: string;
  image: string;
  days: number;
  mealsPerDay: number;
  caloriesPerDay: number;
  price: number;
  pricePerDay: number;
  discount?: number;
  rating: number;
  isPopular?: boolean;
}

interface MealPlanCarouselProps {
  plans: MealPlan[];
  rows?: number;
}

export function MealPlanCarousel({ plans, rows = 1 }: MealPlanCarouselProps) {
  const itemsPerRow = Math.ceil(plans.length / rows);
  const planRows = Array.from({ length: rows }, (_, i) =>
    plans.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  const handleAddToCart = (plan: MealPlan, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ title: `Рацион "${plan.name}" добавлен в корзину` });
  };

  return (
    <div className="space-y-3">
      {planRows.map((rowPlans, rowIndex) => (
        <div key={rowIndex} className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {rowPlans.map((plan) => (
            <Link
              key={plan.id}
              to={`/meal-plan/${plan.id}`}
              className="flex-shrink-0 w-72 bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:border-primary/30 transition-colors"
            >
              <div className="relative h-36">
                <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                {plan.isPopular && (
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                    🔥 Хит
                  </Badge>
                )}
                {plan.discount && (
                  <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
                    -{plan.discount}%
                  </Badge>
                )}
                <h3 className="absolute bottom-2 left-3 right-3 font-bold text-foreground">{plan.name}</h3>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {plan.days} дней
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" />
                    {plan.caloriesPerDay} ккал
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-primary">{plan.price}₽</span>
                    <span className="text-xs text-muted-foreground ml-1">{plan.pricePerDay}₽/день</span>
                  </div>
                  <Button variant="hero" size="sm" onClick={(e) => handleAddToCart(plan, e)}>
                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                    Заказать
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
