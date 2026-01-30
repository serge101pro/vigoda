import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Star, Clock, Flame, ShoppingCart, 
  Plus, Minus, ThermometerSnowflake, ChefHat, Users, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { readyMealsData, getMealById, MealIngredient } from '@/data/readyMealsData';

export default function ReadyMealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [servings, setServings] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  const meal = getMealById(id || '1') || readyMealsData[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const handleAddMealToCart = () => {
    toast({
      title: 'Добавлено в корзину',
      description: `${meal.name} x${quantity}`,
    });
  };

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientId)
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const selectAllIngredients = () => {
    setSelectedIngredients(meal.ingredients.map(ing => ing.id));
  };

  const calculateIngredientAmount = (ingredient: MealIngredient) => {
    return Math.round(ingredient.amount * servings / meal.baseServings);
  };

  const calculateIngredientPrice = (ingredient: MealIngredient) => {
    const amount = calculateIngredientAmount(ingredient);
    return Math.round(amount * ingredient.pricePerUnit);
  };

  const handleAddIngredientsToCart = () => {
    if (selectedIngredients.length === 0) {
      toast({ 
        title: 'Выберите ингредиенты',
        description: 'Отметьте ингредиенты для добавления в корзину',
        variant: 'destructive'
      });
      return;
    }
    
    const selected = meal.ingredients.filter(ing => selectedIngredients.includes(ing.id));
    const totalPrice = selected.reduce((sum, ing) => sum + calculateIngredientPrice(ing), 0);
    
    toast({
      title: 'Ингредиенты добавлены в корзину',
      description: `${selected.length} ингредиентов на сумму ${totalPrice}₽`,
    });
    setSelectedIngredients([]);
  };

  const totalIngredientsPrice = meal.ingredients
    .filter(ing => selectedIngredients.includes(ing.id))
    .reduce((sum, ing) => sum + calculateIngredientPrice(ing), 0);

  const discountPercent = meal.oldPrice 
    ? Math.round((1 - meal.price / meal.oldPrice) * 100)
    : 0;

  const totalRecipeTime = meal.recipeSteps.reduce((sum, step) => sum + (step.duration || 0), 0);

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">Готовое блюдо</h1>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)} 
              className="p-2 rounded-full hover:bg-muted"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Image */}
      <section className="relative">
        <div className="aspect-video bg-muted">
          <img 
            src={meal.image} 
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        </div>
        {discountPercent > 0 && (
          <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
            -{discountPercent}%
          </Badge>
        )}
      </section>

      {/* Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{meal.rating}</span>
            <span className="text-sm text-muted-foreground">({meal.reviewCount} отзывов)</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{meal.name}</h2>
        <p className="text-muted-foreground mb-4">{meal.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {meal.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {meal.cookTime} мин разогрев
          </span>
          <span>{meal.weight}г</span>
        </div>

        {/* Price */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Цена готового блюда</p>
              <p className="text-2xl font-bold text-primary">{meal.price} ₽</p>
              {meal.oldPrice && (
                <p className="text-sm text-muted-foreground line-through">{meal.oldPrice} ₽</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{(meal.price / (meal.weight / 100)).toFixed(0)} ₽/100г</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition */}
      <section className="px-4 mb-4">
        <h3 className="font-bold text-lg mb-3">Пищевая ценность</h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold text-primary">{meal.calories}</p>
            <p className="text-xs text-muted-foreground">ккал</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{meal.protein}</p>
            <p className="text-xs text-muted-foreground">белки, г</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{meal.fat}</p>
            <p className="text-xs text-muted-foreground">жиры, г</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold">{meal.carbs}</p>
            <p className="text-xs text-muted-foreground">углеводы, г</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-muted rounded-xl">
            <TabsTrigger value="ingredients" className="text-xs">Ингредиенты</TabsTrigger>
            <TabsTrigger value="recipe" className="text-xs">Рецепт</TabsTrigger>
            <TabsTrigger value="storage" className="text-xs">Хранение</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Отзывы</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              {/* Servings selector */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Порций:</span>
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{servings}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setServings(Math.min(12, servings + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Список ингредиентов</h4>
                <Button variant="link" size="sm" onClick={selectAllIngredients}>
                  Выбрать все
                </Button>
              </div>

              <div className="space-y-3">
                {meal.ingredients.map((ingredient) => (
                  <div 
                    key={ingredient.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                      selectedIngredients.includes(ingredient.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => toggleIngredient(ingredient.id)}
                  >
                    <Checkbox
                      checked={selectedIngredients.includes(ingredient.id)}
                      onCheckedChange={() => toggleIngredient(ingredient.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{ingredient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {calculateIngredientAmount(ingredient)} {ingredient.unit}
                      </p>
                    </div>
                    <span className="font-semibold text-primary">
                      ~{calculateIngredientPrice(ingredient)}₽
                    </span>
                  </div>
                ))}
              </div>

              {selectedIngredients.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-muted-foreground">Выбрано: {selectedIngredients.length}</span>
                    <span className="font-bold text-lg">~{totalIngredientsPrice}₽</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleAddIngredientsToCart}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Добавить ингредиенты в корзину
                  </Button>
                </div>
              )}
              
              {meal.allergens.length > 0 && (
                <div className="pt-4 mt-4 border-t border-border">
                  <h4 className="font-semibold mb-2 text-destructive">Аллергены</h4>
                  <div className="flex flex-wrap gap-2">
                    {meal.allergens.map((a, i) => (
                      <Badge key={i} variant="destructive">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recipe" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Рецепт приготовления</h4>
                  <p className="text-sm text-muted-foreground">
                    Общее время: ~{totalRecipeTime} мин
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {meal.recipeSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground">{step.description}</p>
                      {step.duration && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          ~{step.duration} мин
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="storage" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ThermometerSnowflake className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Условия хранения</p>
                  <p className="text-sm text-muted-foreground">{meal.storageConditions}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Срок годности</p>
                  <p className="text-sm text-muted-foreground">{meal.shelfLife}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-3">
              {meal.reviews.map((review, idx) => (
                <div key={idx} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{review.author}</span>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar meals */}
      <section className="px-4 mb-24">
        <h3 className="font-bold text-lg mb-3">Похожие блюда</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {readyMealsData.filter(m => m.id !== meal.id).slice(0, 5).map((m) => (
            <Link 
              key={m.id}
              to={`/ready-meal/${m.id}`}
              className="flex-shrink-0 w-40 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="aspect-video bg-muted">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-1">{m.name}</p>
                <span className="font-bold">{m.price} ₽</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="flex-1 h-12 rounded-xl text-base"
            onClick={handleAddMealToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            В корзину • {meal.price * quantity} ₽
          </Button>
        </div>
      </div>
    </div>
  );
}
