import { Package, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppStore, AggregatedIngredient } from '@/stores/useAppStore';

export function AggregatedIngredientsSection() {
  const { getAggregatedIngredients, cart } = useAppStore();
  const [expanded, setExpanded] = useState(true);
  
  const aggregated = getAggregatedIngredients();
  
  // Group by source type
  const recipeIngredients = cart.filter(item => item.type === 'recipe-ingredients');
  const diyMealPlans = cart.filter(item => item.type === 'meal-plan-diy');
  
  if (aggregated.length === 0) return null;
  
  // Calculate savings from package optimization
  const totalRequired = aggregated.reduce((sum, ing) => sum + (ing.totalRequired * (ing.totalCost / (ing.packagesToBuy * ing.minPackage))), 0);
  const totalWithOptimization = aggregated.reduce((sum, ing) => sum + ing.totalCost, 0);
  const worstCaseCost = aggregated.reduce((sum, ing) => {
    // Cost if each source bought separately
    const separateCost = ing.sources.reduce((s, src) => {
      const packageInfo = { minPackage: ing.minPackage, pricePerUnit: ing.totalCost / (ing.packagesToBuy * ing.minPackage) };
      const packagesNeeded = Math.ceil(src.amount / ing.minPackage);
      return s + packagesNeeded * ing.minPackage * packageInfo.pricePerUnit;
    }, 0);
    return sum + separateCost;
  }, 0);
  
  const savings = Math.round(worstCaseCost - totalWithOptimization);
  const savingsPercent = worstCaseCost > 0 ? Math.round((savings / worstCaseCost) * 100) : 0;

  return (
    <section className="px-4 pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Агрегированные ингредиенты</p>
            <p className="text-sm text-muted-foreground">
              {aggregated.length} позиций • Оптимизация упаковок
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savings > 0 && (
            <Badge className="bg-green-500 text-white">
              <TrendingDown className="h-3 w-3 mr-1" />
              -{savings}₽
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {expanded && (
        <div className="mt-3 space-y-4 animate-fade-in">
          {/* Savings Summary */}
          {savings > 0 && (
            <div className="bg-green-500/10 rounded-xl p-3 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingDown className="h-4 w-4" />
                <span className="font-medium">
                  Экономия от оптимизации: {savings}₽ ({savingsPercent}%)
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ингредиенты объединены для минимизации закупок
              </p>
            </div>
          )}
          
          {/* Source Groups */}
          {recipeIngredients.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 border-b border-border">
                <p className="font-medium text-sm">🍳 Из рецептов</p>
              </div>
              <div className="p-2">
                {recipeIngredients.map(item => (
                  <div key={item.id} className="px-2 py-1 text-sm text-muted-foreground">
                    • {item.sourceName} ({item.servings} порц.)
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {diyMealPlans.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-muted/50 border-b border-border">
                <p className="font-medium text-sm">🥗 Из рационов (DIY)</p>
              </div>
              <div className="p-2">
                {diyMealPlans.map(item => (
                  <div key={item.id} className="px-2 py-1 text-sm text-muted-foreground">
                    • {item.sourceName}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Aggregated Ingredients List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-muted/50 border-b border-border">
              <p className="font-medium text-sm">📦 К покупке (оптимизировано)</p>
            </div>
            <div className="divide-y divide-border">
              {aggregated.map((ing, idx) => (
                <div key={idx} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium capitalize">{ing.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Требуется: {ing.totalRequired.toFixed(1)} {ing.unit} → 
                        Купить: {ing.packagesToBuy * ing.minPackage} {ing.unit}
                      </p>
                      {ing.sources.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ing.sources.map((src, sIdx) => (
                            <Badge key={sIdx} variant="secondary" className="text-xs">
                              {src.sourceName}: {src.amount.toFixed(1)} {ing.unit}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{ing.totalCost.toFixed(0)}₽</p>
                      <p className="text-xs text-muted-foreground">
                        {ing.packagesToBuy} уп. × {ing.minPackage} {ing.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-muted/50 border-t border-border flex justify-between">
              <span className="font-medium">Итого ингредиенты:</span>
              <span className="font-bold text-primary">{totalWithOptimization.toFixed(0)}₽</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
