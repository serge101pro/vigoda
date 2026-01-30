import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, Star, Clock, Flame, ShoppingCart, 
  Plus, Minus, ThermometerSnowflake, ChefHat, Users, Check, Loader2,
  Store, Truck, MapPin, Timer, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { readyMealsData, getMealById, MealIngredient } from '@/data/readyMealsData';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { toast as sonnerToast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ReadyMealDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem, importItems, loading: cartLoading } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [servings, setServings] = useState(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingIngredients, setAddingIngredients] = useState(false);
  
  // Restaurant order states
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [isOrdering, setIsOrdering] = useState(false);

  const meal = getMealById(id || '1') || readyMealsData[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const handleAddMealToCart = async () => {
    if (!user) {
      sonnerToast.error('Войдите в систему для добавления в корзину');
      return;
    }

    setAddingToCart(true);
    try {
      const success = await addItem(
        meal.name,
        quantity,
        'порц.',
        'Готовые блюда'
      );
      
      if (success) {
        toast({
          title: 'Добавлено в корзину',
          description: `${meal.name} x${quantity}`,
        });
      }
    } finally {
      setAddingToCart(false);
    }
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

  const handleAddIngredientsToCart = async () => {
    if (selectedIngredients.length === 0) {
      toast({ 
        title: 'Выберите ингредиенты',
        description: 'Отметьте ингредиенты для добавления в корзину',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      sonnerToast.error('Войдите в систему для добавления в корзину');
      return;
    }
    
    setAddingIngredients(true);
    try {
      const selected = meal.ingredients.filter(ing => selectedIngredients.includes(ing.id));
      
      const itemsToImport = selected.map(ing => ({
        name: ing.name,
        quantity: calculateIngredientAmount(ing),
        unit: ing.unit,
        category: 'Продукты'
      }));

      const success = await importItems(itemsToImport);
      
      if (success) {
        const totalPrice = selected.reduce((sum, ing) => sum + calculateIngredientPrice(ing), 0);
        toast({
          title: 'Ингредиенты добавлены в корзину',
          description: `${selected.length} ингредиентов на сумму ~${totalPrice}₽`,
        });
        setSelectedIngredients([]);
      }
    } finally {
      setAddingIngredients(false);
    }
  };

  // Order directly from restaurant
  const handleOrderFromRestaurant = async () => {
    if (!user) {
      sonnerToast.error('Войдите в систему для заказа');
      return;
    }

    setIsOrdering(true);
    try {
      const totalAmount = meal.restaurantPrice * quantity + meal.restaurant.deliveryFee;
      
      const order = await createOrder({
        total_amount: totalAmount,
        delivery_address: 'Ваш адрес доставки', // In real app, would be user's saved address
        payment_method: 'online',
        items: [{
          product_name: `${meal.name} (от ${meal.restaurant.name})`,
          product_image: meal.image,
          quantity: quantity,
          unit_price: meal.restaurantPrice,
          total_price: meal.restaurantPrice * quantity,
        }]
      });

      if (order) {
        setOrderId(order.id);
        setOrderSuccess(true);
        setOrderStatus('preparing');
        
        // Simulate status updates
        setTimeout(() => setOrderStatus('cooking'), 5000);
        setTimeout(() => setOrderStatus('ready'), 15000);
        setTimeout(() => setOrderStatus('delivering'), 20000);
      }
    } finally {
      setIsOrdering(false);
    }
  };

  const totalIngredientsPrice = meal.ingredients
    .filter(ing => selectedIngredients.includes(ing.id))
    .reduce((sum, ing) => sum + calculateIngredientPrice(ing), 0);

  const discountPercent = meal.oldPrice 
    ? Math.round((1 - meal.price / meal.oldPrice) * 100)
    : 0;

  const totalRecipeTime = meal.recipeSteps.reduce((sum, step) => sum + (step.duration || 0), 0);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Ожидает подтверждения', icon: Clock, color: 'text-amber-500' };
      case 'preparing':
        return { label: 'Принят рестораном', icon: Check, color: 'text-blue-500' };
      case 'cooking':
        return { label: 'Готовится', icon: ChefHat, color: 'text-orange-500' };
      case 'ready':
        return { label: 'Готов к доставке', icon: Package, color: 'text-green-500' };
      case 'delivering':
        return { label: 'Курьер в пути', icon: Truck, color: 'text-primary' };
      case 'delivered':
        return { label: 'Доставлен', icon: Check, color: 'text-green-600' };
      default:
        return { label: 'Обрабатывается', icon: Clock, color: 'text-muted-foreground' };
    }
  };

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

        {/* Pricing Options */}
        <div className="space-y-3 mb-4">
          {/* Self-cooking price */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Набор ингредиентов</p>
                <p className="text-2xl font-bold text-primary">{meal.price} ₽</p>
                {meal.oldPrice && (
                  <p className="text-sm text-muted-foreground line-through">{meal.oldPrice} ₽</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Готовите сами</p>
                <p className="text-sm text-muted-foreground">{(meal.price / (meal.weight / 100)).toFixed(0)} ₽/100г</p>
              </div>
            </div>
          </div>

          {/* Restaurant order */}
          {meal.isAvailableForDelivery && (
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {meal.restaurant.logo}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{meal.restaurant.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {meal.restaurant.rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {meal.restaurant.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Готовое блюдо</p>
                  <p className="text-xl font-bold text-foreground">{meal.restaurantPrice} ₽</p>
                  <p className="text-xs text-muted-foreground">
                    + доставка {meal.restaurant.deliveryFee}₽
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setOrderDialogOpen(true)}
                  disabled={!user}
                  className="gap-2"
                >
                  <Store className="h-4 w-4" />
                  Заказать
                </Button>
              </div>
            </div>
          )}
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
                    disabled={addingIngredients || !user}
                  >
                    {addingIngredients ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-4 w-4 mr-2" />
                    )}
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
                  <p className="text-muted-foreground text-sm">{review.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3">
        <div className="flex items-center gap-3">
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
            className="flex-1" 
            variant="hero"
            onClick={handleAddMealToCart}
            disabled={addingToCart || !user}
          >
            {addingToCart ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            Ингредиенты • {meal.price * quantity}₽
          </Button>
        </div>
      </div>

      {/* Restaurant Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-md">
          {!orderSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Заказ из {meal.restaurant.name}</DialogTitle>
                <DialogDescription>
                  Закажите готовое блюдо с доставкой
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">{meal.weight}г</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Количество:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Блюдо x{quantity}</span>
                    <span>{meal.restaurantPrice * quantity}₽</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Доставка</span>
                    <span>{meal.restaurant.deliveryFee}₽</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Итого</span>
                    <span>{meal.restaurantPrice * quantity + meal.restaurant.deliveryFee}₽</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Доставка: {meal.restaurant.deliveryTime}</span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleOrderFromRestaurant} disabled={isOrdering}>
                  {isOrdering ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Оформить заказ
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Заказ оформлен!
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Номер заказа</p>
                  <p className="font-mono font-bold text-lg">{orderId?.slice(0, 8).toUpperCase()}</p>
                </div>

                {/* Order tracking */}
                <div className="bg-muted rounded-xl p-4">
                  <p className="font-semibold mb-3">Статус заказа</p>
                  <div className="space-y-3">
                    {['pending', 'preparing', 'cooking', 'ready', 'delivering'].map((status, idx) => {
                      const info = getStatusInfo(status);
                      const StatusIcon = info.icon;
                      const isActive = ['pending', 'preparing', 'cooking', 'ready', 'delivering'].indexOf(orderStatus) >= idx;
                      const isCurrent = orderStatus === status;
                      
                      return (
                        <div 
                          key={status}
                          className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-40'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrent ? 'bg-primary text-primary-foreground' : 
                            isActive ? 'bg-green-500 text-white' : 'bg-muted-foreground/20'
                          }`}>
                            {isActive && !isCurrent ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <StatusIcon className="h-4 w-4" />
                            )}
                          </div>
                          <span className={`text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                            {info.label}
                          </span>
                          {isCurrent && (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Ожидаемое время доставки:</p>
                  <p className="font-semibold text-foreground">{meal.restaurant.deliveryTime}</p>
                </div>
              </div>

              <DialogFooter>
                <Button className="w-full" onClick={() => {
                  setOrderDialogOpen(false);
                  setOrderSuccess(false);
                }}>
                  Закрыть
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
