import { useState } from 'react';
import { ArrowLeft, Clock, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Recipe {
  id: string;
  name: string;
  emoji: string;
  time: number;
  servings: number;
  price: number;
  pricePerServing: number;
  isUserRecipe?: boolean;
}

const mockRecipes: Recipe[] = [
  { id: '1', name: 'Паста Карбонара', emoji: '🍝', time: 35, servings: 2, price: 389, pricePerServing: 195 },
  { id: '2', name: 'Борщ классический', emoji: '🍲', time: 90, servings: 4, price: 420, pricePerServing: 105 },
  { id: '3', name: 'Салат Цезарь', emoji: '🥗', time: 20, servings: 2, price: 320, pricePerServing: 160 },
];

const userRecipes: Recipe[] = [
  { id: '4', name: 'Бабушкины блины', emoji: '🥞', time: 30, servings: 6, price: 180, pricePerServing: 30, isUserRecipe: true },
];

export default function UserRecipesPage() {
  const [tab, setTab] = useState('all');

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <div className="bg-card rounded-2xl overflow-hidden shadow-md">
      <div className="h-32 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        <span className="text-5xl">{recipe.emoji}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground">{recipe.name}</h3>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {recipe.time} мин
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings} порции
          </span>
        </div>
        <p className="text-xl font-bold text-primary mt-2">{recipe.price}₽</p>
        <p className="text-sm text-muted-foreground">({recipe.pricePerServing}₽/порция)</p>
        <Button variant="hero" size="sm" className="w-full mt-3">
          Добавить ингредиенты
        </Button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Рецепты</h1>
            </div>
            <Button variant="hero" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="all" className="flex-1">Все рецепты</TabsTrigger>
            <TabsTrigger value="user" className="flex-1">От пользователей</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </TabsContent>

          <TabsContent value="user" className="space-y-4">
            {userRecipes.length > 0 ? (
              userRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">👨‍🍳</p>
                <p className="text-muted-foreground">Пока нет рецептов от пользователей</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
