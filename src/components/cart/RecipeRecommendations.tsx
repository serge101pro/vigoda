import { Lightbulb, Plus, ChefHat } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { extendedRecipes } from '@/data/recipeData';
import { useToast } from '@/hooks/use-toast';

export function RecipeRecommendations() {
  const { cart, addRecipeIngredientsToCart, getAggregatedIngredients } = useAppStore();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  
  const aggregated = getAggregatedIngredients();
  
  // Get ingredient names from cart
  const cartIngredientNames = useMemo(() => {
    return aggregated.map(ing => ing.name.toLowerCase());
  }, [aggregated]);
  
  // Find recipes that use cart ingredients
  const recommendations = useMemo(() => {
    if (cartIngredientNames.length === 0) return [];
    
    return extendedRecipes
      .map(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => ing.name.toLowerCase());
        const matchingIngredients = recipeIngredients.filter(ing => 
          cartIngredientNames.some(cartIng => 
            ing.includes(cartIng) || cartIng.includes(ing)
          )
        );
        const matchPercent = (matchingIngredients.length / recipeIngredients.length) * 100;
        const additionalIngredients = recipeIngredients.filter(ing => 
          !cartIngredientNames.some(cartIng => 
            ing.includes(cartIng) || cartIng.includes(ing)
          )
        );
        
        return {
          recipe,
          matchingIngredients,
          additionalIngredients,
          matchPercent,
          matchCount: matchingIngredients.length,
        };
      })
      .filter(r => r.matchCount > 0)
      .sort((a, b) => b.matchPercent - a.matchPercent)
      .slice(0, showAll ? 10 : 3);
  }, [cartIngredientNames, showAll]);
  
  if (recommendations.length === 0) return null;
  
  const handleAddRecipe = (recipe: typeof extendedRecipes[0]) => {
    addRecipeIngredientsToCart({
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      time: recipe.time,
      calories: recipe.calories,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
    }, recipe.servings);
    
    toast({
      title: 'Рецепт добавлен!',
      description: `Ингредиенты для "${recipe.name}" добавлены в корзину`,
    });
  };

  return (
    <section className="px-4 pt-4">
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-4 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-foreground">Рекомендуем приготовить</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Эти рецепты используют ингредиенты из вашей корзины
        </p>
        
        <div className="space-y-3">
          {recommendations.map(({ recipe, matchingIngredients, additionalIngredients, matchPercent }) => (
            <div 
              key={recipe.id}
              className="bg-card rounded-xl p-3 border border-border flex gap-3"
            >
              <SafeImage 
                src={recipe.image} 
                alt={recipe.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{recipe.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        className={`text-xs ${
                          matchPercent >= 75 ? 'bg-green-500' : 
                          matchPercent >= 50 ? 'bg-amber-500' : 'bg-muted'
                        } text-white`}
                      >
                        {Math.round(matchPercent)}% совпадение
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {recipe.time} мин
                      </span>
                    </div>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="shrink-0 bg-primary/10 hover:bg-primary/20"
                    onClick={() => handleAddRecipe(recipe)}
                  >
                    <Plus className="h-4 w-4 text-primary" />
                  </Button>
                </div>
                
                {additionalIngredients.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    Докупить: {additionalIngredients.slice(0, 3).join(', ')}
                    {additionalIngredients.length > 3 && ` +${additionalIngredients.length - 3}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length >= 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-amber-600"
            onClick={() => setShowAll(!showAll)}
          >
            <ChefHat className="h-4 w-4 mr-1" />
            {showAll ? 'Показать меньше' : 'Показать больше рецептов'}
          </Button>
        )}
      </div>
    </section>
  );
}
