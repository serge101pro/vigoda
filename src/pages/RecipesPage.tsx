import { useState } from 'react';
import { ArrowLeft, Clock, Flame, Users, Plus, ShoppingCart, ChefHat, Store, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { mockRecipes } from '@/data/mockData';

const rationPlans = [
  { id: '3', days: 3, price: 2990, perDay: 997 },
  { id: '7', days: 7, price: 5990, perDay: 856 },
  { id: '10', days: 10, price: 7990, perDay: 799 },
];

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'recipes' | 'rations'>('recipes');

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to="/">
              <Button variant="ghost" size="icon-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Рецепты и рационы</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'recipes'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              🍳 Рецепты
            </button>
            <button
              onClick={() => setActiveTab('rations')}
              className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                activeTab === 'rations'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              📅 Рационы
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'recipes' ? (
        <div className="px-4 py-4 space-y-4">
          {mockRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Готовые рационы питания
            </h2>
            <p className="text-muted-foreground">
              Сбалансированное меню с расчётом КБЖУ
            </p>
          </div>

          <div className="space-y-3">
            {rationPlans.map((plan) => (
              <div
                key={plan.id}
                className="card-product flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-foreground">
                    Рацион на {plan.days} дней
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.perDay} ₽/день • 2000 ккал
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">{plan.price} ₽</p>
                  <Button variant="default" size="sm" className="mt-1">
                    Выбрать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: typeof mockRecipes[0] }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="card-product animate-fade-in">
      <div className="aspect-video rounded-xl overflow-hidden mb-3">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="font-bold text-foreground mb-2">{recipe.name}</h3>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{recipe.time} мин</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4" />
          <span>{recipe.calories} ккал</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{recipe.servings} порц.</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-foreground mb-2">Ингредиенты:</p>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.slice(0, 4).map((ing, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground"
            >
              {ing.name}
            </span>
          ))}
          {recipe.ingredients.length > 4 && (
            <span className="px-2 py-1 bg-muted rounded-lg text-xs text-muted-foreground">
              +{recipe.ingredients.length - 4}
            </span>
          )}
        </div>
      </div>

      {showOptions ? (
        <div className="space-y-2 animate-fade-in">
          <Button variant="default" size="sm" className="w-full justify-start">
            <Store className="h-4 w-4 mr-2" />
            Купить ингредиенты в магазине
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Заказать набор ингредиентов
          </Button>
          <Button variant="accent" size="sm" className="w-full justify-start">
            <Utensils className="h-4 w-4 mr-2" />
            Заказать готовое блюдо
          </Button>
        </div>
      ) : (
        <Button
          variant="hero"
          size="default"
          className="w-full"
          onClick={() => setShowOptions(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить в список
        </Button>
      )}
    </div>
  );
}
