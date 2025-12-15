import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Heart, MessageCircle, Share2, Bookmark, Plus, Trophy, Users, TrendingUp, Flame, Clock, ChefHat, Star, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface SocialRecipe {
  id: string;
  title: string;
  description: string;
  image: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  cookTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  emoji: string;
  participants: number;
  endDate: string;
  prize: string;
  trending: boolean;
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  score: number;
  recipes: number;
  followers: number;
  rank: number;
  badge: string;
}

const mockRecipes: SocialRecipe[] = [
  {
    id: '1',
    title: 'Паста карбонара по-домашнему',
    description: 'Классический итальянский рецепт с беконом и сливочным соусом',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80',
    author: {
      id: '1',
      name: 'Мария Иванова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      verified: true,
      followers: 12500,
    },
    likes: 2345,
    comments: 189,
    shares: 56,
    saves: 890,
    cookTime: '30 мин',
    difficulty: 'medium',
    tags: ['Паста', 'Итальянская', 'Ужин'],
    createdAt: '2 часа назад',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Смузи-боул с асаи',
    description: 'Суперфуд завтрак для энергичного утра',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&q=80',
    author: {
      id: '2',
      name: 'Анна Петрова',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
      verified: true,
      followers: 8900,
    },
    likes: 1567,
    comments: 98,
    shares: 234,
    saves: 567,
    cookTime: '10 мин',
    difficulty: 'easy',
    tags: ['ЗОЖ', 'Завтрак', 'Веган'],
    createdAt: '5 часов назад',
    isLiked: true,
    isSaved: true,
  },
  {
    id: '3',
    title: 'Стейк рибай идеальной прожарки',
    description: 'Секреты приготовления идеального стейка medium rare',
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
    author: {
      id: '3',
      name: 'Алексей Шефов',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      verified: true,
      followers: 25000,
    },
    likes: 4521,
    comments: 312,
    shares: 189,
    saves: 1234,
    cookTime: '20 мин',
    difficulty: 'hard',
    tags: ['Мясо', 'Гриль', 'Праздничное'],
    createdAt: '1 день назад',
    isLiked: false,
    isSaved: false,
  },
];

const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Зимние супы',
    description: 'Приготовьте согревающий суп и поделитесь рецептом',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    emoji: '🍲',
    participants: 1234,
    endDate: '31 декабря',
    prize: '10 000 ₽',
    trending: true,
  },
  {
    id: '2',
    title: 'Новогодний стол',
    description: 'Лучшее праздничное блюдо',
    image: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=400&q=80',
    emoji: '🎄',
    participants: 567,
    endDate: '25 декабря',
    prize: '15 000 ₽',
    trending: true,
  },
  {
    id: '3',
    title: 'Домашняя выпечка',
    description: 'Покажите своё мастерство',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    emoji: '🥐',
    participants: 890,
    endDate: '20 декабря',
    prize: '5 000 ₽',
    trending: false,
  },
];

const leaderboard: LeaderboardUser[] = [
  { id: '1', name: 'Мария Иванова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', verified: true, score: 15600, recipes: 89, followers: 12500, rank: 1, badge: '🥇' },
  { id: '2', name: 'Алексей Шефов', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', verified: true, score: 14200, recipes: 156, followers: 25000, rank: 2, badge: '🥈' },
  { id: '3', name: 'Анна Петрова', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', verified: true, score: 12800, recipes: 67, followers: 8900, rank: 3, badge: '🥉' },
  { id: '4', name: 'Дмитрий Кулинаров', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', verified: false, score: 11500, recipes: 45, followers: 5600, rank: 4, badge: '' },
  { id: '5', name: 'Елена Вкусная', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', verified: true, score: 10200, recipes: 78, followers: 7800, rank: 5, badge: '' },
];

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-600',
  medium: 'bg-amber-500/10 text-amber-600',
  hard: 'bg-red-500/10 text-red-600',
};

const difficultyLabels = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export default function SocialRecipesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recipes, setRecipes] = useState(mockRecipes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week');

  const toggleLike = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? {
              ...recipe,
              isLiked: !recipe.isLiked,
              likes: recipe.isLiked ? recipe.likes - 1 : recipe.likes + 1,
            }
          : recipe
      )
    );
  };

  const toggleSave = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === recipeId
          ? {
              ...recipe,
              isSaved: !recipe.isSaved,
              saves: recipe.isSaved ? recipe.saves - 1 : recipe.saves + 1,
            }
          : recipe
      )
    );
    toast({ title: 'Рецепт сохранён' });
  };

  const handleShare = (recipe: SocialRecipe) => {
    navigator.clipboard.writeText(`${window.location.origin}/recipes/${recipe.id}`);
    toast({ title: 'Ссылка скопирована!' });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Сообщество</h1>
          <Button size="icon" variant="ghost">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Поиск рецептов и авторов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0 rounded-xl"
            />
          </div>
        </div>
      </header>

      {/* Create Recipe Button */}
      <section className="px-4 py-4">
        <Button className="w-full h-12 rounded-xl" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Опубликовать рецепт
        </Button>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="px-4">
        <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl mb-4">
          <TabsTrigger value="feed" className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            Лента
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            Челленджи
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Рейтинг
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="space-y-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Author Header */}
              <div className="flex items-center gap-3 p-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={recipe.author.avatar} />
                  <AvatarFallback>{recipe.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{recipe.author.name}</span>
                    {recipe.author.verified && (
                      <Badge variant="secondary" className="text-xs px-1.5">✓</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{recipe.createdAt}</span>
                </div>
                <Button variant="outline" size="sm">
                  Подписаться
                </Button>
              </div>

              {/* Image */}
              <Link to={`/recipes/${recipe.id}`}>
                <div className="relative aspect-[4/3]">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge className={difficultyColors[recipe.difficulty]}>
                      {difficultyLabels[recipe.difficulty]}
                    </Badge>
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.cookTime}
                    </Badge>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-4">
                <Link to={`/recipes/${recipe.id}`}>
                  <h3 className="font-bold text-lg mb-1">{recipe.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
                </Link>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.map((tag) => (
                    <span key={tag} className="text-xs text-primary">#{tag}</span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(recipe.id)}
                      className="flex items-center gap-1 text-sm"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          recipe.isLiked ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                        }`}
                      />
                      <span>{recipe.likes}</span>
                    </button>
                    <Link to={`/recipes/${recipe.id}`} className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="h-5 w-5" />
                      <span>{recipe.comments}</span>
                    </Link>
                    <button
                      onClick={() => handleShare(recipe)}
                      className="flex items-center gap-1 text-sm text-muted-foreground"
                    >
                      <Share2 className="h-5 w-5" />
                      <span>{recipe.shares}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => toggleSave(recipe.id)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Bookmark
                      className={`h-5 w-5 ${
                        recipe.isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <span>{recipe.saves}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Активные челленджи</h3>
            <Button size="sm" variant="outline">
              Все
            </Button>
          </div>

          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="relative h-32">
                <img
                  src={challenge.image}
                  alt={challenge.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <span className="absolute top-3 left-3 text-3xl">{challenge.emoji}</span>
                {challenge.trending && (
                  <Badge className="absolute top-3 right-3 bg-destructive">
                    <Flame className="h-3 w-3 mr-1" /> Тренд
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-lg mb-1">{challenge.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{challenge.participants} участников</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    До {challenge.endDate}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-primary">{challenge.prize}</span>
                  </div>
                  <Button>Участвовать</Button>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          {/* Period Filter */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {(['day', 'week', 'month', 'all'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {period === 'day' && 'Сегодня'}
                {period === 'week' && 'Неделя'}
                {period === 'month' && 'Месяц'}
                {period === 'all' && 'Все время'}
              </button>
            ))}
          </div>

          {/* Top 3 */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {leaderboard.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className={`bg-card rounded-xl border p-3 text-center ${
                  user.rank === 1 ? 'border-amber-500 bg-amber-500/5' : 'border-border'
                }`}
              >
                <div className="relative inline-block mb-2">
                  <Avatar className="w-14 h-14 mx-auto">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 -right-1 text-xl">{user.badge}</span>
                </div>
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.score.toLocaleString()} баллов</p>
              </div>
            ))}
          </div>

          {/* Rest of leaderboard */}
          <div className="space-y-2">
            {leaderboard.slice(3).map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 bg-card rounded-xl border border-border p-3"
              >
                <span className="w-6 text-center font-bold text-muted-foreground">
                  {user.rank}
                </span>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm">{user.name}</span>
                    {user.verified && (
                      <Badge variant="secondary" className="text-xs px-1">✓</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{user.recipes} рецептов</span>
                    <span>{user.followers.toLocaleString()} подписчиков</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{user.score.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">баллов</p>
                </div>
              </div>
            ))}
          </div>

          {/* My Position */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-bold">42</span>
              <Avatar className="w-10 h-10">
                <AvatarFallback>Я</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">Ваша позиция</p>
                <p className="text-xs text-muted-foreground">5 рецептов • 120 подписчиков</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">1,250</p>
                <p className="text-xs text-muted-foreground">баллов</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom padding */}
      <div className="h-6" />
    </div>
  );
}
