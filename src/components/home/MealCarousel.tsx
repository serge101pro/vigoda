import { Link } from 'react-router-dom';
import { Clock, Flame, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface ReadyMeal {
  id: string;
  name: string;
  image: string;
  weight: number;
  calories: number;
  protein: number;
  price: number;
  oldPrice?: number;
  rating: number;
}

interface MealCarouselProps {
  meals: ReadyMeal[];
  rows?: number;
}

export function MealCarousel({ meals, rows = 1 }: MealCarouselProps) {
  const itemsPerRow = Math.ceil(meals.length / rows);
  const mealRows = Array.from({ length: rows }, (_, i) =>
    meals.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  const handleAddToCart = (meal: ReadyMeal, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({ title: `${meal.name} добавлено в корзину` });
  };

  return (
    <div className="space-y-3">
      {mealRows.map((rowMeals, rowIndex) => (
        <div key={rowIndex} className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {rowMeals.map((meal) => (
            <Link
              key={meal.id}
              to={`/ready-meal/${meal.id}`}
              className="flex-shrink-0 w-56 bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:border-primary/30 transition-colors"
            >
              <div className="relative h-32">
                <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                {meal.oldPrice && (
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">
                    -{Math.round((1 - meal.price / meal.oldPrice) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{meal.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{meal.weight}г</span>
                  <span>•</span>
                  <span>{meal.calories} ккал</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-foreground">{meal.price}₽</span>
                    {meal.oldPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-1">{meal.oldPrice}₽</span>
                    )}
                  </div>
                  <Button variant="hero" size="icon-sm" onClick={(e) => handleAddToCart(meal, e)}>
                    <ShoppingCart className="h-3.5 w-3.5" />
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
