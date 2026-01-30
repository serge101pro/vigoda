import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, ShoppingCart, Grid, List, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/stores/useAppStore';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { addToCart } = useAppStore();
  const { 
    favoriteProducts, 
    favoriteRecipes, 
    loading, 
    removeProductFromFavorites, 
    removeRecipeFromFavorites 
  } = useFavorites();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemoveProduct = async (productId: string) => {
    await removeProductFromFavorites(productId);
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    await removeRecipeFromFavorites(recipeId);
  };

  const handleAddToCart = (product: { id: string; name: string; price: number; image: string | null; unit: string; category: string }) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      unit: product.unit,
      category: product.category,
      rating: 0,
      reviewCount: 0,
    });
  };

  const filteredProducts = favoriteProducts.filter(f => 
    f.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecipes = favoriteRecipes.filter(f => 
    f.recipe?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="page-container flex flex-col items-center justify-center px-4">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Избранное</h1>
        <p className="text-muted-foreground text-center mb-6">
          Войдите в аккаунт, чтобы сохранять товары и рецепты в избранное
        </p>
        <Link to="/auth/login">
          <Button variant="hero">Войти</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground flex-1">Избранное</h1>
          <div className="flex gap-1">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Поиск в избранном..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="products">
            <TabsList className="w-full">
              <TabsTrigger value="products" className="flex-1">
                🛒 Товары ({favoriteProducts.length})
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex-1">
                🍳 Рецепты ({favoriteRecipes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">В избранном пока пусто</p>
                  <Link to="/catalog">
                    <Button variant="hero" className="mt-4">Перейти в каталог</Button>
                  </Link>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-3'}>
                  {filteredProducts.map((favorite) => {
                    const product = favorite.product;
                    if (!product) return null;
                    
                    return viewMode === 'grid' ? (
                      <div key={favorite.id} className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
                        <div className="relative aspect-square">
                          <SafeImage src={product.image || ''} alt={product.name} className="w-full h-full object-cover" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-background/80"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <Heart className="h-4 w-4 fill-primary text-primary" />
                          </Button>
                          {product.old_price && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                              -{Math.round((1 - product.price / product.old_price) * 100)}%
                            </Badge>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                          <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{product.name}</h3>
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="font-bold text-foreground">{product.price}₽</span>
                            <span className="text-xs text-muted-foreground">/{product.unit}</span>
                            {product.old_price && (
                              <span className="text-xs text-muted-foreground line-through">{product.old_price}₽</span>
                            )}
                          </div>
                          <Button variant="hero" size="sm" className="w-full" onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            В корзину
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div key={favorite.id} className="bg-card rounded-xl p-3 flex items-center gap-4 shadow-sm border border-border">
                        <SafeImage src={product.image || ''} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-foreground">{product.price}₽</span>
                            {product.old_price && (
                              <span className="text-xs text-muted-foreground line-through">{product.old_price}₽</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button variant="hero" size="icon" onClick={() => handleAddToCart(product)}>
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recipes" className="mt-4">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет сохранённых рецептов</p>
                  <Link to="/recipes">
                    <Button variant="hero" className="mt-4">Смотреть рецепты</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRecipes.map((favorite) => {
                    const recipe = favorite.recipe;
                    if (!recipe) return null;
                    
                    return (
                      <Link key={favorite.id} to={`/recipes/${recipe.id}`}>
                        <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow">
                          <div className="relative h-40">
                            <SafeImage src={recipe.image || ''} alt={recipe.name} className="w-full h-full object-cover" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 bg-background/80"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveRecipe(recipe.id);
                              }}
                            >
                              <Heart className="h-4 w-4 fill-primary text-primary" />
                            </Button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-foreground mb-2">{recipe.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>⏱ {recipe.time_minutes} мин</span>
                              {recipe.calories && <span>🔥 {recipe.calories} ккал</span>}
                              {recipe.rating && <span>⭐ {recipe.rating}</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
