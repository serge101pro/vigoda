import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAppStore, Product, Recipe } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Users, Package, ChefHat, Utensils } from 'lucide-react';

interface MealPlanData {
  id: string;
  name: string;
  price: number;
  pricePerDay: number;
  image: string;
  days: number;
  mealsPerDay: number;
  supplierKitPrice?: number;
  diyPrice?: number;
  ingredients?: { name: string; amount: string }[];
}

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'product' | 'recipe' | 'meal-plan';
  product?: Product;
  recipe?: Recipe;
  mealPlan?: MealPlanData;
}

export function AddToCartDialog({ open, onOpenChange, type, product, recipe, mealPlan }: AddToCartDialogProps) {
  const { toast } = useToast();
  const { addToCart, addRecipeIngredientsToCart, addMealPlanToCart } = useAppStore();
  
  const [servings, setServings] = useState(recipe?.servings || 2);
  const [mealPlanServings, setMealPlanServings] = useState(2);
  const [mealPlanVariant, setMealPlanVariant] = useState<'ready' | 'supplier-kit' | 'diy'>('ready');
  const [quantity, setQuantity] = useState(product?.minQuantity || 1);

  const handleAddProduct = () => {
    if (product) {
      addToCart(product, quantity);
      toast({ title: 'Добавлено в корзину', description: `${product.name} x${quantity}` });
      onOpenChange(false);
    }
  };

  const handleAddRecipeIngredients = () => {
    if (recipe) {
      addRecipeIngredientsToCart(recipe, servings);
      toast({ 
        title: 'Ингредиенты добавлены', 
        description: `${recipe.name} на ${servings} ${servings === 1 ? 'порцию' : 'порций'}` 
      });
      onOpenChange(false);
    }
  };

  const handleAddMealPlan = () => {
    if (mealPlan) {
      // Pass servings info through the meal plan with adjusted pricing
      const adjustedMealPlan = {
        ...mealPlan,
        price: calculateMealPlanPrice(mealPlanVariant, mealPlanServings),
      };
      addMealPlanToCart(adjustedMealPlan, mealPlanVariant);
      const variantLabels = {
        'ready': 'Готовый рацион',
        'supplier-kit': 'Набор ингредиентов от поставщика',
        'diy': 'Ингредиенты для самостоятельной покупки',
      };
      toast({ 
        title: 'Добавлено в корзину', 
        description: `${mealPlan.name} на ${mealPlanServings} чел.: ${variantLabels[mealPlanVariant]}` 
      });
      onOpenChange(false);
    }
  };

  const calculateMealPlanPrice = (variant: 'ready' | 'supplier-kit' | 'diy', servingsCount: number) => {
    if (!mealPlan) return 0;
    const basePrice = mealPlan.price;
    const multiplier = servingsCount / 2; // Base price is for 2 people
    
    switch (variant) {
      case 'ready':
        return Math.round(basePrice * multiplier);
      case 'supplier-kit':
        return Math.round(basePrice * 0.6 * multiplier);
      case 'diy':
        return Math.round(basePrice * 0.4 * multiplier);
      default:
        return basePrice * multiplier;
    }
  };

  if (type === 'product' && product) {
    const minQty = product.minQuantity || 1;
    const step = product.quantityStep || 1;
    
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Добавить в корзину</DialogTitle>
            <DialogDescription>{product.name}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{product.name}</p>
                <p className="text-primary font-bold">{product.price} ₽/{product.unit}</p>
                {minQty > 1 && (
                  <p className="text-xs text-muted-foreground">Мин. количество: {minQty} {product.unit}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Количество</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(minQty, quantity - step))}
                  disabled={quantity <= minQty}
                >
                  -
                </Button>
                <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + step)}
                >
                  +
                </Button>
                <span className="text-muted-foreground">{product.unit}</span>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-3 flex justify-between items-center">
              <span className="text-muted-foreground">Итого:</span>
              <span className="text-xl font-bold text-primary">{product.price * quantity} ₽</span>
            </div>

            <Button variant="hero" className="w-full" onClick={handleAddProduct}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Добавить в корзину
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === 'recipe' && recipe) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Добавить ингредиенты</DialogTitle>
            <DialogDescription>{recipe.name}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={recipe.image} alt={recipe.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{recipe.name}</p>
                <p className="text-sm text-muted-foreground">{recipe.ingredients.length} ингредиентов</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                На сколько человек?
              </label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[servings]}
                  onValueChange={([value]) => setServings(value)}
                  min={1}
                  max={12}
                  step={1}
                  className="flex-1"
                />
                <span className="w-8 text-center font-bold">{servings}</span>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-3">
              <p className="text-sm text-muted-foreground mb-2">Ингредиенты будут рассчитаны на {servings} {servings === 1 ? 'порцию' : 'порций'}</p>
              <p className="text-xs text-muted-foreground">Совпадающие ингредиенты автоматически объединятся с другими рецептами в корзине</p>
            </div>

            <Button variant="hero" className="w-full" onClick={handleAddRecipeIngredients}>
              <ChefHat className="h-4 w-4 mr-2" />
              Добавить ингредиенты
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (type === 'meal-plan' && mealPlan) {
    const readyPrice = calculateMealPlanPrice('ready', mealPlanServings);
    const supplierKitPrice = calculateMealPlanPrice('supplier-kit', mealPlanServings);
    const diyPrice = calculateMealPlanPrice('diy', mealPlanServings);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите вариант заказа</DialogTitle>
            <DialogDescription>{mealPlan.name}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={mealPlan.image} alt={mealPlan.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{mealPlan.name}</p>
                <p className="text-sm text-muted-foreground">{mealPlan.days} дней, {mealPlan.mealsPerDay} приёмов пищи</p>
              </div>
            </div>

            {/* Servings selector */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                На сколько человек?
              </label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[mealPlanServings]}
                  onValueChange={([value]) => setMealPlanServings(value)}
                  min={1}
                  max={8}
                  step={1}
                  className="flex-1"
                />
                <span className="w-10 text-center font-bold text-lg">{mealPlanServings}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setMealPlanVariant('ready')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  mealPlanVariant === 'ready' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Utensils className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Готовый рацион</p>
                    <p className="text-sm text-muted-foreground">Готовые блюда с доставкой</p>
                    <p className="text-primary font-bold mt-1">{readyPrice.toLocaleString()} ₽</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMealPlanVariant('supplier-kit')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  mealPlanVariant === 'supplier-kit' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Набор ингредиентов от поставщика</p>
                    <p className="text-sm text-muted-foreground">Расфасовка на {mealPlanServings} чел., цены поставщика</p>
                    <p className="text-orange-500 font-bold mt-1">{supplierKitPrice.toLocaleString()} ₽</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMealPlanVariant('diy')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  mealPlanVariant === 'diy' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ShoppingCart className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Купить ингредиенты самостоятельно</p>
                    <p className="text-sm text-muted-foreground">Оптимизированный список с учётом мин. фасовки</p>
                    <p className="text-green-500 font-bold mt-1">от {diyPrice.toLocaleString()} ₽</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              При выборе самостоятельной покупки ингредиенты объединяются с другими рецептами в корзине для максимальной экономии
            </p>

            <Button variant="hero" className="w-full" onClick={handleAddMealPlan}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Добавить в корзину
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}