import { useState } from 'react';
import { ArrowLeft, Search, Plus, Clock, Users, Heart, Eye, MessageCircle, Share2, Check, Flame, Trophy, Store, ShoppingCart, Utensils, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extendedRecipes, recipeCategories } from '@/data/recipeData';
import { extendedMealPlans } from '@/data/mealPlansData';

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

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'Просто';
    case 'medium': return 'Средне';
    case 'hard': return 'Сложно';
    default: return difficulty;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/10 text-green-600';
    case 'medium': return 'bg-amber-500/10 text-amber-600';
    case 'hard': return 'bg-red-500/10 text-red-600';
    default: return 'bg-muted text-muted-foreground';
  }
};

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

  const filteredRecipes = extendedRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || recipe.category === category;
    return matchesSearch && matchesCategory;
  });

  const UserRecipeCard = ({ recipe }: { recipe: UserRecipe }) => (
    <Link to={`/recipes/${recipe.id}`} className="block">
      <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
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

          <h3 className="font-bold text-foreground mb-2">{recipe.title}</h3>

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

          <Button variant="hero" size="sm" className="w-full" onClick={(e) => e.preventDefault()}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить ингредиенты
          </Button>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="page-container pt-4">

      <div className="px-4 py-4 space-y-4">
        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">Все рецепты</TabsTrigger>
            <TabsTrigger value="user" className="flex-1">От пользователей</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-6">
            {/* Готовые рационы */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                📅 Готовые рационы
                <Link to="/ready-meals?tab=plans" className="text-sm text-primary font-medium ml-auto">
                  Все →
                </Link>
              </h3>
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {extendedMealPlans.slice(0, 4).map(plan => (
                  <Link key={plan.id} to={`/meal-plan/${plan.id}`} className="bg-card rounded-xl overflow-hidden min-w-[200px] border border-border">
                    <div className="h-24 relative">
                      <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                      {plan.discount && (
                        <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                          -{plan.discount}%
                        </Badge>
                      )}
                      {plan.isPopular && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                          🔥 Хит
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-sm line-clamp-1">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.days} дней • {plan.caloriesPerDay} ккал/день</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-primary font-bold">{plan.price}₽</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {plan.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Категории рецептов */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              <Button
                variant={category === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory('all')}
                className="whitespace-nowrap"
              >
                Все
              </Button>
              {recipeCategories.map(cat => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  {cat.emoji} {cat.label}
                </Button>
              ))}
            </div>

            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Найти рецепт..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Рецепты */}
            <div className="space-y-4">
              {filteredRecipes.map((recipe) => (
                <ExtendedRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="user" className="mt-4 space-y-4">
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

                <Button variant="hero" size="lg" className="w-full">
                  <Plus className="h-5 w-5 mr-2" />
                  Добавить рецепт
                </Button>

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

function ExtendedRecipeCard({ recipe }: { recipe: typeof extendedRecipes[0] }) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <Link to={`/recipe/${recipe.id}`} className="block">
      <div className="card-product animate-fade-in">
        <div className="aspect-video rounded-xl overflow-hidden mb-3 relative">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 ${getDifficultyColor(recipe.difficulty)}`}>
            {getDifficultyLabel(recipe.difficulty)}
          </Badge>
        </div>

        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-foreground">{recipe.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{recipe.rating}</span>
            <span className="text-muted-foreground">({recipe.reviewCount})</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

        {/* КБЖУ */}
        <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-muted rounded-xl">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{recipe.calories}</p>
            <p className="text-xs text-muted-foreground">ккал</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{recipe.protein}</p>
            <p className="text-xs text-muted-foreground">белки</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{recipe.fat}</p>
            <p className="text-xs text-muted-foreground">жиры</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{recipe.carbs}</p>
            <p className="text-xs text-muted-foreground">углеводы</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.time} мин</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} порц.</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <span className="text-lg">{recipe.authorAvatar}</span>
            <span className="font-medium">{recipe.authorName}</span>
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

        {/* Шаги (краткий список) */}
        <div className="mb-3">
          <p className="text-sm font-medium text-foreground mb-2">Шаги приготовления:</p>
          <div className="space-y-1">
            {recipe.steps.slice(0, 3).map((step) => (
              <div key={step.step} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  {step.step}
                </span>
                <span className="text-muted-foreground line-clamp-1">{step.description}</span>
              </div>
            ))}
            {recipe.steps.length > 3 && (
              <p className="text-xs text-primary font-medium ml-7">
                + ещё {recipe.steps.length - 3} шагов →
              </p>
            )}
          </div>
        </div>

        {showOptions ? (
          <div className="space-y-2 animate-fade-in" onClick={(e) => e.preventDefault()}>
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
            onClick={(e) => {
              e.preventDefault();
              setShowOptions(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить в список
          </Button>
        )}
      </div>
    </Link>
  );
}
