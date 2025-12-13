import { useState } from 'react';
import { ArrowLeft, Search, Plus, Clock, Users, Heart, Eye, MessageCircle, Share2, Check, Flame, Trophy, Store, ShoppingCart, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockRecipes } from '@/data/mockData';

interface UserRecipe {
  id: string;
  title: string;
  emoji: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  time: number;
  servings: number;
  difficulty: 'Просто' | 'Средне' | 'Сложно';
  likes: number;
  views: number;
  comments: number;
  shares: number;
  isVerified?: boolean;
  isPopular?: boolean;
  createdAt: string;
  imageUrl?: string;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  recipesCount: number;
  likes: number;
  rank: number;
}

const userRecipes: UserRecipe[] = [
  {
    id: '1',
    title: 'Паста Карбонара за 20 минут',
    emoji: '🍝',
    author: { name: 'Ирина Петрова', avatar: '👩‍🍳', badge: '⭐⭐' },
    time: 20,
    servings: 2,
    difficulty: 'Просто',
    likes: 156,
    views: 1243,
    comments: 23,
    shares: 45,
    isVerified: true,
    isPopular: true,
    createdAt: '2 дня назад',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    title: 'Борщ как у бабушки',
    emoji: '🍲',
    author: { name: 'Мария Соколова', avatar: '👩', badge: '🍲' },
    time: 90,
    servings: 6,
    difficulty: 'Средне',
    likes: 892,
    views: 4521,
    comments: 67,
    shares: 234,
    isVerified: true,
    isPopular: true,
    createdAt: '5 дней назад',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    title: 'Быстрый завтрак: омлет с овощами',
    emoji: '🍳',
    author: { name: 'Анна Волкова', avatar: '👩‍🦰', badge: '⭐' },
    time: 15,
    servings: 1,
    difficulty: 'Просто',
    likes: 78,
    views: 542,
    comments: 12,
    shares: 18,
    createdAt: '1 день назад',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop'
  },
];

const topAuthors: Author[] = [
  { id: '1', name: 'Мария Соколова', avatar: '👩', badge: '🍲', recipesCount: 12, likes: 234, rank: 1 },
  { id: '2', name: 'Ирина Петрова', avatar: '👩‍🍳', badge: '⭐⭐', recipesCount: 8, likes: 178, rank: 2 },
  { id: '3', name: 'Елена Крылова', avatar: '👩‍🦱', badge: '⭐⭐', recipesCount: 6, likes: 145, rank: 3 },
  { id: '4', name: 'Ольга Новикова', avatar: '👩‍🦰', badge: '⭐', recipesCount: 4, likes: 98, rank: 4 },
  { id: '5', name: 'Дарья Смирнова', avatar: '👱‍♀️', badge: '⭐', recipesCount: 5, likes: 76, rank: 5 },
];

const rationPlans = [
  { id: '3', days: 3, price: 2990, perDay: 997 },
  { id: '7', days: 7, price: 5990, perDay: 856 },
  { id: '10', days: 10, price: 7990, perDay: 799 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return rank.toString();
  }
};

export default function RecipesPage() {
  const [mainTab, setMainTab] = useState('all');
  const [subTab, setSubTab] = useState('feed');
  const [ratingPeriod, setRatingPeriod] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [category, setCategory] = useState('all');

  const UserRecipeCard = ({ recipe }: { recipe: UserRecipe }) => (
    <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-accent to-accent/80">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{recipe.emoji}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {recipe.isVerified && (
            <Badge className="bg-primary text-primary-foreground">
              <Check className="h-3 w-3 mr-1" /> Проверено
            </Badge>
          )}
          {recipe.isPopular && (
            <Badge className="bg-accent text-accent-foreground">
              <Flame className="h-3 w-3 mr-1" /> Популярное
            </Badge>
          )}
        </div>
      </div>

      {/* Author */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
            {recipe.author.avatar}
          </div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-1">
              {recipe.author.name}
              {recipe.author.badge && <span>{recipe.author.badge}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{recipe.createdAt}</p>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-foreground mb-2">{recipe.title}</h3>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {recipe.time} мин
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings} порц.
          </span>
          <span className="flex items-center gap-1">
            🔥 {recipe.difficulty}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-3 border-b border-border mb-3">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {recipe.likes}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {recipe.views}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {recipe.comments}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-4 w-4" />
            {recipe.shares}
          </span>
        </div>

        <Button variant="hero" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-1" />
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
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Рецепты</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Main Tabs */}
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">Все рецепты</TabsTrigger>
            <TabsTrigger value="user" className="flex-1">От пользователей</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-4">
            {/* Rations Section */}
            <div className="bg-gradient-to-r from-primary-light to-accent-light rounded-2xl p-4">
              <h3 className="font-bold text-foreground mb-3">📅 Готовые рационы</h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {rationPlans.map(plan => (
                  <div key={plan.id} className="bg-card rounded-xl p-3 min-w-[140px] border border-border">
                    <p className="font-bold">{plan.days} дней</p>
                    <p className="text-primary font-bold">{plan.price}₽</p>
                    <p className="text-xs text-muted-foreground">{plan.perDay}₽/день</p>
                  </div>
                ))}
              </div>
            </div>

            {/* All Recipes */}
            <div className="space-y-4">
              {mockRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="user" className="mt-4 space-y-4">
            {/* Sub Tabs */}
            <Tabs value={subTab} onValueChange={setSubTab}>
              <TabsList className="w-full">
                <TabsTrigger value="feed" className="flex-1">
                  📱 Лента
                </TabsTrigger>
                <TabsTrigger value="rating" className="flex-1">
                  🏆 Рейтинг
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="mt-4 space-y-4">
                {/* Search & Filters */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Найти рецепт или автора..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Популярные</SelectItem>
                      <SelectItem value="new">Новые</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все категории</SelectItem>
                      <SelectItem value="my">Мои рецепты</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Recipe Button */}
                <Button variant="hero" size="lg" className="w-full">
                  <Plus className="h-5 w-5 mr-2" />
                  Добавить рецепт
                </Button>

                {/* User Recipes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRecipes.map(recipe => (
                    <UserRecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rating" className="mt-4">
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h2 className="text-lg font-bold text-center mb-1 flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Рейтинг лучших авторов
                  </h2>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Следующее обновление: 2 дня
                  </p>

                  {/* Period Tabs */}
                  <div className="flex gap-2 mb-6">
                    <Button 
                      variant={ratingPeriod === 'week' ? 'hero' : 'outline'}
                      className="flex-1"
                      onClick={() => setRatingPeriod('week')}
                    >
                      📅 Неделя
                    </Button>
                    <Button 
                      variant={ratingPeriod === 'month' ? 'hero' : 'outline'}
                      className="flex-1"
                      onClick={() => setRatingPeriod('month')}
                    >
                      📆 Месяц
                    </Button>
                  </div>

                  {/* Authors List */}
                  <div className="space-y-3">
                    {topAuthors.map((author) => (
                      <div 
                        key={author.id}
                        className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                      >
                        <span className="text-2xl w-8 text-center font-bold">
                          {getRankIcon(author.rank)}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-2xl">
                          {author.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold flex items-center gap-1">
                            {author.name} {author.badge}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {author.recipesCount} рецептов
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{author.likes}</p>
                          <p className="text-xs text-muted-foreground">лайков</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
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
