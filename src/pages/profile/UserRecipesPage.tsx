import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Plus, Heart, MessageCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  time_minutes: number;
  servings: number;
  calories: number | null;
  difficulty: string | null;
  rating: number | null;
  review_count: number | null;
  author_id: string | null;
  is_user_created: boolean | null;
}

interface Author {
  id: string;
  name: string;
  avatar: string;
  recipesCount: number;
}

// Mock subscribed authors for demo
const mockSubscribedAuthors: Author[] = [];

const mockRecommendedRecipes: Recipe[] = [
  { id: 'rec1', name: 'Тирамису классический', description: 'Итальянский десерт', image: null, time_minutes: 45, servings: 6, calories: 380, difficulty: 'medium', rating: 4.9, review_count: 234, author_id: null, is_user_created: false },
  { id: 'rec2', name: 'Том Ям', description: 'Тайский суп', image: null, time_minutes: 35, servings: 4, calories: 180, difficulty: 'medium', rating: 4.7, review_count: 156, author_id: null, is_user_created: false },
  { id: 'rec3', name: 'Ризотто с грибами', description: 'Итальянская кухня', image: null, time_minutes: 40, servings: 4, calories: 420, difficulty: 'hard', rating: 4.8, review_count: 189, author_id: null, is_user_created: false },
];

const newRecipes: Recipe[] = [
  { id: 'new1', name: 'Авокадо-тост', description: 'Завтрак', image: null, time_minutes: 10, servings: 1, calories: 280, difficulty: 'easy', rating: 4.5, review_count: 45, author_id: null, is_user_created: false },
  { id: 'new2', name: 'Смузи-боул', description: 'Полезный завтрак', image: null, time_minutes: 15, servings: 2, calories: 220, difficulty: 'easy', rating: 4.6, review_count: 78, author_id: null, is_user_created: false },
];

export default function UserRecipesPage() {
  const [tab, setTab] = useState('my');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    time_minutes: 30,
    servings: 2,
    calories: 0,
    difficulty: 'medium'
  });

  useEffect(() => {
    fetchUserRecipes();
  }, [user]);

  const fetchUserRecipes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRecipes(data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      toast.error('Не удалось загрузить рецепты');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Войдите в систему для создания рецептов');
      return;
    }

    try {
      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update({
            name: formData.name,
            description: formData.description,
            time_minutes: formData.time_minutes,
            servings: formData.servings,
            calories: formData.calories || null,
            difficulty: formData.difficulty,
          })
          .eq('id', editingRecipe.id)
          .eq('author_id', user.id);

        if (error) throw error;
        toast.success('Рецепт обновлён');
      } else {
        const { error } = await supabase
          .from('recipes')
          .insert({
            name: formData.name,
            description: formData.description,
            time_minutes: formData.time_minutes,
            servings: formData.servings,
            calories: formData.calories || null,
            difficulty: formData.difficulty,
            author_id: user.id,
            is_user_created: true,
          });

        if (error) throw error;
        toast.success('Рецепт создан');
      }

      setIsDialogOpen(false);
      setEditingRecipe(null);
      resetForm();
      fetchUserRecipes();
    } catch (err) {
      console.error('Error saving recipe:', err);
      toast.error('Не удалось сохранить рецепт');
    }
  };

  const handleDelete = async (recipeId: string) => {
    if (!user) return;
    
    if (!confirm('Удалить этот рецепт?')) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('author_id', user.id);

      if (error) throw error;
      toast.success('Рецепт удалён');
      fetchUserRecipes();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      toast.error('Не удалось удалить рецепт');
    }
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || '',
      time_minutes: recipe.time_minutes,
      servings: recipe.servings,
      calories: recipe.calories || 0,
      difficulty: recipe.difficulty || 'medium'
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      time_minutes: 30,
      servings: 2,
      calories: 0,
      difficulty: 'medium'
    });
    setEditingRecipe(null);
  };

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipes/${recipeId}`);
  };

  const RecipeCard = ({ recipe, isOwn = false }: { recipe: Recipe; isOwn?: boolean }) => (
    <div 
      className="bg-card rounded-2xl overflow-hidden shadow-md border border-border cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => !isOwn && handleRecipeClick(recipe.id)}
    >
      <div className="h-32 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center relative">
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">🍽️</span>
        )}
        {isOwn && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="bg-background/80 hover:bg-background"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(recipe);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(recipe.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-foreground line-clamp-1">{recipe.name}</h3>
        {recipe.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{recipe.description}</p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recipe.time_minutes} {t('recipes.min')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {recipe.servings}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {recipe.rating ? Math.round((recipe.rating || 0) * 10) : 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {recipe.review_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            0
          </span>
        </div>
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
              <h1 className="text-xl font-bold text-foreground">{t('recipes.title')}</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="hero" size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRecipe ? t('recipes.edit') : t('recipes.new')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('recipes.recipeName')}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Название рецепта"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('recipes.description')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Краткое описание"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="time">{t('recipes.time')}</Label>
                      <Input
                        id="time"
                        type="number"
                        value={formData.time_minutes}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_minutes: parseInt(e.target.value) || 0 }))}
                        min={1}
                      />
                    </div>
                    <div>
                      <Label htmlFor="servings">{t('recipes.servings')}</Label>
                      <Input
                        id="servings"
                        type="number"
                        value={formData.servings}
                        onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                        min={1}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories">{t('recipes.calories')}</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                        min={0}
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">{t('recipes.difficulty')}</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="easy">{t('recipes.easy')}</option>
                        <option value="medium">{t('recipes.medium')}</option>
                        <option value="hard">{t('recipes.hard')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                      {t('recipes.cancel')}
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1">
                      {editingRecipe ? t('recipes.save') : t('recipes.create')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="my" className="flex-1">{t('recipes.your')}</TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1">{t('recipes.subscriptions')}</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('recipes.loading')}</p>
              </div>
            ) : userRecipes.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {userRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} isOwn />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-4">👨‍🍳</p>
                <p className="text-muted-foreground mb-4">{t('recipes.noRecipes')}</p>
                <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('recipes.create')}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            {mockSubscribedAuthors.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Рецепты авторов</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Subscribed authors recipes would go here */}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-4">📚</p>
                <p className="text-muted-foreground mb-4">{t('recipes.noSubscriptions')}</p>
                <p className="text-sm text-muted-foreground">{t('recipes.checkRecommended')}</p>
              </div>
            )}

            {/* Recommended recipes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">{t('recipes.recommended')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {mockRecommendedRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>

            {/* New recipes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">{t('recipes.newRecipes')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {newRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
