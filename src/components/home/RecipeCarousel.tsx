import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, ChefHat } from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  image: string;
  time: number;
  rating: number;
  reviewCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  authorName: string;
}

interface RecipeCarouselProps {
  recipes: Recipe[];
}

const difficultyLabels = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export function RecipeCarousel({ recipes }: RecipeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x snap-mandatory"
    >
      {recipes.map((recipe) => (
        <Link 
          key={recipe.id} 
          to={`/recipe/${recipe.id}`}
          className="flex-shrink-0 w-[160px] snap-start"
        >
          <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="relative h-[100px] overflow-hidden">
              <img 
                src={recipe.image} 
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              {/* Rating badge */}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-white">{recipe.rating}</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-2.5">
              <h4 className="font-semibold text-sm text-foreground line-clamp-2 mb-1.5 min-h-[2.5rem]">
                {recipe.name}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <div className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{recipe.time} мин</span>
                </div>
                <span className="text-border">•</span>
                <span>{difficultyLabels[recipe.difficulty]}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ChefHat className="h-3 w-3" />
                <span className="truncate">{recipe.authorName}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
