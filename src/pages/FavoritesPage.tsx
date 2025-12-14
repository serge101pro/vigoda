import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, ShoppingCart, Grid, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface FavoriteProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  unit: string;
  store: string;
  category: string;
}

interface FavoriteRecipe {
  id: string;
  name: string;
  image: string;
  time: number;
  calories: number;
  author: string;
  likes: number;
}

const favoriteProducts: FavoriteProduct[] = [
  {
    id: '1',
    name: 'Авокадо спелый',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&fit=crop',
    price: 149,
    oldPrice: 199,
    unit: 'шт',
    store: 'Пятёрочка',
    category: 'Фрукты',
  },
  {
    id: '2',
    name: 'Лосось филе',
    image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=200&h=200&fit=crop',
    price: 899,
    unit: 'кг',
    store: 'Перекрёсток',
    category: 'Рыба',
  },
  {
    id: '3',
    name: 'Сыр Пармезан',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop',
    price: 1290,
    oldPrice: 1490,
    unit: 'кг',
    store: 'ВкусВилл',
    category: 'Молочное',
  },
  {
    id: '4',
    name: 'Оливковое масло Extra Virgin',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop',
    price: 649,
    unit: 'л',
    store: 'Магнит',
    category: 'Бакалея',
  },
  {
    id: '5',
    name: 'Клубника свежая',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&fit=crop',
    price: 399,
    oldPrice: 499,
    unit: '250г',
    store: 'Азбука Вкуса',
    category: 'Фрукты',
  },
  {
    id: '6',
    name: 'Моцарелла буррата',
    image: 'https://images.unsplash.com/photo-1626957341926-98752fc2ba90?w=200&h=200&fit=crop',
    price: 349,
    unit: 'шт',
    store: 'ВкусВилл',
    category: 'Молочное',
  },
];

const favoriteRecipes: FavoriteRecipe[] = [
  {
    id: '1',
    name: 'Паста Карбонара',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&h=200&fit=crop',
    time: 25,
    calories: 520,
    author: 'Ирина Петрова',
    likes: 892,
  },
  {
    id: '2',
    name: 'Салат Цезарь с курицей',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
    time: 20,
    calories: 380,
    author: 'Мария Соколова',
    likes: 654,
  },
  {
    id: '3',
    name: 'Тирамису классический',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop',
    time: 40,
    calories: 450,
    author: 'Елена Крылова',
    likes: 1234,
  },
  {
    id: '4',
    name: 'Борщ украинский',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop',
    time: 90,
    calories: 280,
    author: 'Ольга Новикова',
    likes: 567,
  },
];

export default function FavoritesPage() {
  const [products, setProducts] = useState(favoriteProducts);
  const [recipes, setRecipes] = useState(favoriteRecipes);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRemoveProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Товар удалён из избранного' });
  };

  const handleRemoveRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    toast({ title: 'Рецепт удалён из избранного' });
  };

  const handleAddToCart = (product: FavoriteProduct) => {
    toast({ title: `${product.name} добавлен в корзину` });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <Tabs defaultValue="products">
          <TabsList className="w-full">
            <TabsTrigger value="products" className="flex-1">
              🛒 Товары ({products.length})
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex-1">
              🍳 Рецепты ({recipes.length})
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
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <div key={product.id} className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
                      <div className="relative aspect-square">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <Heart className="h-4 w-4 fill-primary text-primary" />
                        </Button>
                        {product.oldPrice && (
                          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-muted-foreground mb-1">{product.store}</p>
                        <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-bold text-foreground">{product.price}₽</span>
                          <span className="text-xs text-muted-foreground">/{product.unit}</span>
                          {product.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through">{product.oldPrice}₽</span>
                          )}
                        </div>
                        <Button variant="hero" size="sm" className="w-full" onClick={() => handleAddToCart(product)}>
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          В корзину
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div key={product.id} className="bg-card rounded-xl p-3 flex items-center gap-4 shadow-sm border border-border">
                      <img src={product.image} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{product.store}</p>
                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-foreground">{product.price}₽</span>
                          {product.oldPrice && (
                            <span className="text-xs text-muted-foreground line-through">{product.oldPrice}₽</span>
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
                  )
                ))}
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
                {filteredRecipes.map((recipe) => (
                  <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                    <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow">
                      <div className="relative h-40">
                        <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
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
                        <p className="text-sm text-muted-foreground mb-2">от {recipe.author}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>⏱ {recipe.time} мин</span>
                          <span>🔥 {recipe.calories} ккал</span>
                          <span>❤️ {recipe.likes}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
