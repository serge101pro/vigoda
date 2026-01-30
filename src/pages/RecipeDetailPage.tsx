import { useState, useMemo } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { extendedRecipes } from '@/data/recipeData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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

const difficultyLabels: Record<string, string> = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { addRecipeIngredientsToCart } = useAppStore();
  
  // Find recipe from data
  const recipe = useMemo(() => {
    return extendedRecipes.find(r => r.id === id);
  }, [id]);
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(recipe?.reviewCount || 0);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([1]);
  const [comments, setComments] = useState<Comment[]>(() => {
    if (!recipe?.reviews) return [];
    return recipe.reviews.map(r => ({
      id: r.id,
      author: { name: r.author, avatar: r.avatar },
      text: r.text,
      likes: Math.floor(Math.random() * 50),
      createdAt: new Date(r.date).toLocaleDateString('ru-RU'),
      isLiked: false,
    }));
  });
  const [newComment, setNewComment] = useState('');
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [servingsDialogOpen, setServingsDialogOpen] = useState(false);
  const [servings, setServings] = useState(recipe?.servings || 2);

  // Handle recipe not found
  if (!recipe) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-foreground mb-4">Рецепт не найден</h1>
        <p className="text-muted-foreground mb-6">К сожалению, такого рецепта не существует.</p>
        <Link to="/recipes">
          <Button>Вернуться к рецептам</Button>
        </Link>
      </div>
    );
  }

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
      title: isFollowing ? 'Вы отписались от автора' : `Вы подписались на ${recipe.authorName}`,
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
      author: { name: 'Вы', avatar: '👤' },
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

  const handleAddIngredients = () => {
    setServingsDialogOpen(true);
  };

  const confirmAddIngredients = () => {
    const recipeData = {
      id: recipe.id,
      name: recipe.name,
      image: recipe.image,
      servings: recipe.servings,
      time: recipe.time,
      calories: recipe.calories,
      ingredients: recipe.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        productId: ing.productId,
      })),
    };
    addRecipeIngredientsToCart(recipeData, servings);
    toast({
      title: 'Ингредиенты добавлены в корзину',
      description: `${recipe.name} на ${servings} ${servings === 1 ? 'порцию' : 'порций'}`,
    });
    setServingsDialogOpen(false);
  };

  const displayedIngredients = showAllIngredients
    ? recipe.ingredients 
    : recipe.ingredients.slice(0, 4);

  return (
    <div className="page-container">
      {/* Hero Image */}
      <div className="relative h-72 md:h-96">
        <img 
          src={recipe.image} 
          alt={recipe.name}
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
          <h1 className="text-2xl font-bold text-foreground mb-3">{recipe.name}</h1>
          <p className="text-muted-foreground mb-4">{recipe.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.time} мин
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} порц.
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              {recipe.calories} ккал
            </span>
            <Badge variant="secondary">{difficultyLabels[recipe.difficulty]}</Badge>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold">{recipe.rating}</span>
            </div>
            <span className="text-muted-foreground">({recipe.reviewCount} отзывов)</span>
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
              <AvatarFallback className="text-2xl">{recipe.authorAvatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-bold text-foreground flex items-center gap-2">
                {recipe.authorName}
              </p>
              <p className="text-sm text-muted-foreground">
                Автор рецепта
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

        {/* Nutrition Info */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">📊 Пищевая ценность</h2>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-3 bg-muted rounded-xl">
              <p className="text-lg font-bold text-primary">{recipe.calories}</p>
              <p className="text-xs text-muted-foreground">ккал</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <p className="text-lg font-bold text-foreground">{recipe.protein}г</p>
              <p className="text-xs text-muted-foreground">белки</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <p className="text-lg font-bold text-foreground">{recipe.fat}г</p>
              <p className="text-xs text-muted-foreground">жиры</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <p className="text-lg font-bold text-foreground">{recipe.carbs}г</p>
              <p className="text-xs text-muted-foreground">углеводы</p>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">🛒 Ингредиенты</h2>
          <div className="space-y-3">
            {displayedIngredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-muted rounded-xl">
                <span className="flex-1 font-medium text-foreground">{ing.name}</span>
                <span className="text-muted-foreground">{ing.amount}</span>
              </div>
            ))}
          </div>
          
          {recipe.ingredients.length > 4 && (
            <Button 
              variant="ghost" 
              className="w-full mt-3"
              onClick={() => setShowAllIngredients(!showAllIngredients)}
            >
              {showAllIngredients ? (
                <>Свернуть <ChevronUp className="h-4 w-4 ml-1" /></>
              ) : (
                <>Показать все ({recipe.ingredients.length}) <ChevronDown className="h-4 w-4 ml-1" /></>
              )}
            </Button>
          )}

          <Button variant="hero" size="lg" className="w-full mt-4" onClick={handleAddIngredients}>
            Добавить все в корзину
          </Button>
        </div>

        {/* Servings Dialog */}
        <Dialog open={servingsDialogOpen} onOpenChange={setServingsDialogOpen}>
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
              
              <Button variant="hero" className="w-full" onClick={confirmAddIngredients}>
                Добавить {recipe.ingredients.length} ингредиентов
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Steps */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4">👨‍🍳 Приготовление</h2>
          <div className="space-y-3">
            {recipe.steps.map((step) => (
              <div key={step.step} className="border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleStep(step.step)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                  <span className="flex-1 font-medium text-foreground">Шаг {step.step}</span>
                  {step.time && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.time} мин
                    </span>
                  )}
                  {expandedSteps.includes(step.step) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedSteps.includes(step.step) && (
                  <div className="px-4 pb-4">
                    <p className="text-muted-foreground pl-11">{step.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
            <h2 className="text-lg font-bold text-foreground mb-4">💡 Советы</h2>
            <ul className="space-y-2">
              {recipe.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-sm">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Comments */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Комментарии ({comments.length})
          </h2>
          
          {/* New comment */}
          <div className="flex gap-3 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarFallback>👤</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Напишите комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] mb-2"
              />
              <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Отправить
              </Button>
            </div>
          </div>
          
          {/* Comments list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-lg">{comment.author.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{comment.author.name}</span>
                    {comment.author.badge && <span>{comment.author.badge}</span>}
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-foreground mb-2">{comment.text}</p>
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    className={`flex items-center gap-1 text-sm ${comment.isLiked ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                    {comment.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom padding */}
      <div className="h-8" />
    </div>
  );
}
