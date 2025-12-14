import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Bookmark, Share2, Clock, Users, Flame, 
  ChevronDown, ChevronUp, Send, MoreHorizontal, ThumbsUp,
  UserPlus, UserMinus, MessageCircle, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge?: string;
  };
  text: string;
  likes: number;
  createdAt: string;
  isLiked?: boolean;
}

const recipeDetail = {
  id: '1',
  title: 'Паста Карбонара по-итальянски',
  description: 'Классическая итальянская паста с беконом, яйцами и пармезаном. Простой рецепт, который покорит ваших гостей!',
  imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=500&fit=crop',
  author: {
    id: 'author1',
    name: 'Ирина Петрова',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    badge: '⭐⭐',
    recipesCount: 45,
    followers: 1234,
  },
  time: 25,
  servings: 4,
  calories: 520,
  difficulty: 'Средне',
  likes: 892,
  views: 4521,
  isLiked: false,
  isSaved: false,
  createdAt: '15 декабря 2024',
  ingredients: [
    { name: 'Спагетти', amount: '400 г', imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=60&h=60&fit=crop' },
    { name: 'Бекон или гуанчале', amount: '200 г', imageUrl: 'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=60&h=60&fit=crop' },
    { name: 'Яйца', amount: '4 шт', imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=60&h=60&fit=crop' },
    { name: 'Пармезан', amount: '100 г', imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=60&h=60&fit=crop' },
    { name: 'Черный перец', amount: 'по вкусу', imageUrl: 'https://images.unsplash.com/photo-1599909631715-cd437dc67086?w=60&h=60&fit=crop' },
    { name: 'Соль', amount: 'по вкусу', imageUrl: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=60&h=60&fit=crop' },
  ],
  steps: [
    {
      number: 1,
      title: 'Подготовка ингредиентов',
      description: 'Нарежьте бекон или гуанчале небольшими кубиками. Натрите пармезан на мелкой тёрке. В миске взбейте яйца с половиной пармезана и щедрой порцией чёрного перца.',
      imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=250&fit=crop',
      tip: 'Яйца должны быть комнатной температуры',
    },
    {
      number: 2,
      title: 'Варка пасты',
      description: 'Вскипятите большую кастрюлю подсоленной воды. Сварите спагетти до состояния аль денте (на 1-2 минуты меньше, чем указано на упаковке). Сохраните стакан воды от пасты.',
      imageUrl: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400&h=250&fit=crop',
    },
    {
      number: 3,
      title: 'Обжарка бекона',
      description: 'На сухой сковороде обжарьте бекон до золотистой корочки и хруста. Жир должен вытопиться. Не добавляйте масло!',
      imageUrl: 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=400&h=250&fit=crop',
      tip: 'Бекон должен быть хрустящим, но не пережаренным',
    },
    {
      number: 4,
      title: 'Соединение ингредиентов',
      description: 'Снимите сковороду с огня! Добавьте горячую пасту к бекону, быстро перемешайте. Влейте яичную смесь, постоянно помешивая. При необходимости добавьте воду от пасты для кремовой текстуры.',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=250&fit=crop',
      tip: 'Важно! Сковорода не должна стоять на огне, иначе яйца свернутся',
    },
    {
      number: 5,
      title: 'Подача',
      description: 'Разложите пасту по тарелкам, посыпьте оставшимся пармезаном и свежемолотым чёрным перцем. Подавайте немедленно!',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=250&fit=crop',
    },
  ],
};

const initialComments: Comment[] = [
  {
    id: '1',
    author: { name: 'Мария С.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop', badge: '⭐' },
    text: 'Готовила вчера - вся семья в восторге! Спасибо за рецепт! 🙏',
    likes: 24,
    createdAt: '2 часа назад',
    isLiked: false,
  },
  {
    id: '2',
    author: { name: 'Алексей К.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop' },
    text: 'Важный момент - действительно снимайте с огня перед добавлением яиц, иначе получится омлет с макаронами 😅',
    likes: 45,
    createdAt: '5 часов назад',
    isLiked: true,
  },
  {
    id: '3',
    author: { name: 'Елена В.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop', badge: '🍲' },
    text: 'Добавила немного чеснока - получилось ещё вкуснее!',
    likes: 12,
    createdAt: '1 день назад',
  },
];

export default function RecipeDetailPage() {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(recipeDetail.isLiked);
  const [isSaved, setIsSaved] = useState(recipeDetail.isSaved);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(recipeDetail.likes);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? 'Лайк убран' : 'Рецепт понравился! ❤️',
    });
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? 'Убрано из избранного' : 'Добавлено в избранное! 📌',
    });
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? 'Вы отписались от автора' : `Вы подписались на ${recipeDetail.author.name}`,
    });
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => 
      prev.includes(stepNumber) 
        ? prev.filter(n => n !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  const handleCommentLike = (commentId: string) => {
    setComments(prev => prev.map(c => 
      c.id === commentId 
        ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: { name: 'Вы', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop' },
      text: newComment,
      likes: 0,
      createdAt: 'Только что',
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    toast({ title: 'Комментарий добавлен!' });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const displayedIngredients = showAllIngredients 
    ? recipeDetail.ingredients 
    : recipeDetail.ingredients.slice(0, 4);

  return (
    <div className="page-container">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96">
        <img 
          src={recipeDetail.imageUrl} 
          alt={recipeDetail.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/recipes">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </header>
      </div>

      <div className="px-4 -mt-16 relative z-10 space-y-6">
        {/* Title & Meta */}
        <div className="bg-card rounded-2xl p-5 shadow-lg border border-border">
          <h1 className="text-2xl font-bold text-foreground mb-3">{recipeDetail.title}</h1>
          <p className="text-muted-foreground mb-4">{recipeDetail.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipeDetail.time} мин
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipeDetail.servings} порц.
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              {recipeDetail.calories} ккал
            </span>
            <Badge variant="secondary">{recipeDetail.difficulty}</Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant={isLiked ? "default" : "outline"} 
              size="sm"
              onClick={toggleLike}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <Button 
              variant={isSaved ? "default" : "outline"} 
              size="sm"
              onClick={toggleSave}
              className="flex-1"
            >
              <Bookmark className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Сохранено' : 'Сохранить'}
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Поделиться
            </Button>
          </div>
        </div>

        {/* Author */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={recipeDetail.author.avatar} />
              <AvatarFallback>{recipeDetail.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-bold text-foreground flex items-center gap-2">
                {recipeDetail.author.name}
                {recipeDetail.author.badge && <span>{recipeDetail.author.badge}</span>}
              </p>
              <p className="text-sm text-muted-foreground">
                {recipeDetail.author.recipesCount} рецептов · {recipeDetail.author.followers} подписчиков
              </p>
            </div>
            <Button 
              variant={isFollowing ? "outline" : "hero"} 
              size="sm"
              onClick={toggleFollow}
            >
              {isFollowing ? (
                <>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Отписаться
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Подписаться
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">🛒 Ингредиенты</h2>
          <div className="space-y-3">
            {displayedIngredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-xl">
                <img 
                  src={ing.imageUrl} 
                  alt={ing.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <span className="flex-1 font-medium text-foreground">{ing.name}</span>
                <span className="text-muted-foreground">{ing.amount}</span>
              </div>
            ))}
          </div>
          
          {recipeDetail.ingredients.length > 4 && (
            <Button 
              variant="ghost" 
              className="w-full mt-3"
              onClick={() => setShowAllIngredients(!showAllIngredients)}
            >
              {showAllIngredients ? (
                <>Свернуть <ChevronUp className="h-4 w-4 ml-1" /></>
              ) : (
                <>Показать все ({recipeDetail.ingredients.length}) <ChevronDown className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          )}

          <Button variant="hero" size="lg" className="w-full mt-4">
            Добавить все в корзину
          </Button>
        </div>

        {/* Steps */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">📝 Пошаговый рецепт</h2>
          <div className="space-y-4">
            {recipeDetail.steps.map((step) => (
              <div 
                key={step.number}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-3 p-4 bg-muted/50 hover:bg-muted transition-colors"
                  onClick={() => toggleStep(step.number)}
                >
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </span>
                  <span className="flex-1 text-left font-semibold text-foreground">{step.title}</span>
                  {expandedSteps.includes(step.number) ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
                
                {expandedSteps.includes(step.number) && (
                  <div className="p-4 animate-fade-in">
                    <img 
                      src={step.imageUrl} 
                      alt={step.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                    <p className="text-foreground mb-3">{step.description}</p>
                    {step.tip && (
                      <div className="bg-accent-light rounded-lg p-3 flex items-start gap-2">
                        <span className="text-lg">💡</span>
                        <p className="text-sm text-foreground">{step.tip}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Комментарии ({comments.length})
          </h2>

          {/* Add Comment */}
          <div className="flex gap-3 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop" />
              <AvatarFallback>Вы</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea 
                placeholder="Написать комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[44px] resize-none"
                rows={1}
              />
              <Button size="icon" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm">
                      {comment.author.name}
                      {comment.author.badge && <span className="ml-1">{comment.author.badge}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-foreground text-sm mb-2">{comment.text}</p>
                  <button 
                    className={`flex items-center gap-1 text-xs ${comment.isLiked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                    onClick={() => handleCommentLike(comment.id)}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
