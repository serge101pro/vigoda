import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Star, Leaf, Award, Truck, Filter, Heart, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface FarmProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  unit: string;
  farm: string;
  farmLogo: string;
  location: string;
  rating: number;
  reviewCount: number;
  organic: boolean;
  delivery: string;
  inStock: boolean;
  category: string;
}

interface Farm {
  id: string;
  name: string;
  logo: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  image: string;
  verified: boolean;
}

const categories = [
  { id: 'all', name: 'Все', emoji: '🌾' },
  { id: 'dairy', name: 'Молочные', emoji: '🥛' },
  { id: 'meat', name: 'Мясо', emoji: '🥩' },
  { id: 'eggs', name: 'Яйца', emoji: '🥚' },
  { id: 'vegetables', name: 'Овощи', emoji: '🥕' },
  { id: 'fruits', name: 'Фрукты', emoji: '🍎' },
  { id: 'honey', name: 'Мёд', emoji: '🍯' },
  { id: 'bread', name: 'Хлеб', emoji: '🍞' },
];

const farms: Farm[] = [
  {
    id: '1',
    name: 'Ферма "Зелёная долина"',
    logo: '🏡',
    location: 'Московская область',
    distance: '45 км',
    rating: 4.9,
    reviewCount: 234,
    specialties: ['Молоко', 'Сыр', 'Творог'],
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80',
    verified: true,
  },
  {
    id: '2',
    name: 'Хозяйство Ивановых',
    logo: '🐄',
    location: 'Тульская область',
    distance: '120 км',
    rating: 4.8,
    reviewCount: 156,
    specialties: ['Говядина', 'Баранина', 'Птица'],
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80',
    verified: true,
  },
  {
    id: '3',
    name: 'Пасека "Медовый рай"',
    logo: '🐝',
    location: 'Рязанская область',
    distance: '180 км',
    rating: 5.0,
    reviewCount: 89,
    specialties: ['Мёд', 'Прополис', 'Пыльца'],
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80',
    verified: true,
  },
];

const farmProducts: FarmProduct[] = [
  {
    id: '1',
    name: 'Молоко цельное фермерское',
    description: 'Свежее молоко от коров свободного выпаса',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    price: 120,
    unit: 'л',
    farm: 'Ферма "Зелёная долина"',
    farmLogo: '🏡',
    location: 'МО, 45 км',
    rating: 4.9,
    reviewCount: 89,
    organic: true,
    delivery: 'Завтра',
    inStock: true,
    category: 'dairy',
  },
  {
    id: '2',
    name: 'Сыр "Российский" выдержанный',
    description: '6 месяцев выдержки, натуральный вкус',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80',
    price: 890,
    unit: 'кг',
    farm: 'Ферма "Зелёная долина"',
    farmLogo: '🏡',
    location: 'МО, 45 км',
    rating: 4.8,
    reviewCount: 156,
    organic: true,
    delivery: '2-3 дня',
    inStock: true,
    category: 'dairy',
  },
  {
    id: '3',
    name: 'Говядина мраморная',
    description: 'Премиальная говядина зернового откорма',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&q=80',
    price: 1490,
    unit: 'кг',
    farm: 'Хозяйство Ивановых',
    farmLogo: '🐄',
    location: 'Тула, 120 км',
    rating: 4.9,
    reviewCount: 67,
    organic: false,
    delivery: '2-3 дня',
    inStock: true,
    category: 'meat',
  },
  {
    id: '4',
    name: 'Яйца деревенские',
    description: 'От кур свободного выгула, крупные',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
    price: 180,
    unit: '10 шт',
    farm: 'Хозяйство Ивановых',
    farmLogo: '🐄',
    location: 'Тула, 120 км',
    rating: 4.7,
    reviewCount: 234,
    organic: true,
    delivery: 'Завтра',
    inStock: true,
    category: 'eggs',
  },
  {
    id: '5',
    name: 'Мёд цветочный',
    description: 'Натуральный мёд с разнотравья',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80',
    price: 650,
    unit: '500 г',
    farm: 'Пасека "Медовый рай"',
    farmLogo: '🐝',
    location: 'Рязань, 180 км',
    rating: 5.0,
    reviewCount: 45,
    organic: true,
    delivery: '3-4 дня',
    inStock: true,
    category: 'honey',
  },
  {
    id: '6',
    name: 'Творог домашний',
    description: 'Мягкий творог 9% жирности',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80',
    price: 280,
    unit: '400 г',
    farm: 'Ферма "Зелёная долина"',
    farmLogo: '🏡',
    location: 'МО, 45 км',
    rating: 4.8,
    reviewCount: 123,
    organic: true,
    delivery: 'Завтра',
    inStock: true,
    category: 'dairy',
  },
  {
    id: '7',
    name: 'Куриная грудка',
    description: 'Охлаждённая, от кур свободного выгула',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80',
    price: 420,
    unit: 'кг',
    farm: 'Хозяйство Ивановых',
    farmLogo: '🐄',
    location: 'Тула, 120 км',
    rating: 4.6,
    reviewCount: 89,
    organic: false,
    delivery: '2-3 дня',
    inStock: true,
    category: 'meat',
  },
  {
    id: '8',
    name: 'Хлеб деревенский',
    description: 'На закваске, бездрожжевой',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    price: 150,
    unit: 'шт',
    farm: 'Ферма "Зелёная долина"',
    farmLogo: '🏡',
    location: 'МО, 45 км',
    rating: 4.9,
    reviewCount: 78,
    organic: true,
    delivery: 'Завтра',
    inStock: true,
    category: 'bread',
  },
];

export default function FarmProductsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredProducts = farmProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.farm.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (product: FarmProduct) => {
    toast({
      title: 'Добавлено в корзину',
      description: product.name,
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Фермерские продукты</h1>
          <button className="p-2 rounded-full hover:bg-muted">
            <Filter className="h-5 w-5" />
          </button>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Поиск продуктов или ферм..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted border-0 rounded-xl"
            />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="px-4 py-4">
        <div className="relative h-36 rounded-2xl overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
            alt="Фермерские продукты"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center p-4">
            <div className="text-primary-foreground">
              <div className="flex items-center gap-2 mb-1">
                <Leaf className="h-5 w-5" />
                <span className="text-sm font-medium">100% натуральное</span>
              </div>
              <h2 className="text-xl font-bold">Прямо с фермы</h2>
              <p className="text-sm opacity-90">Без посредников</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Leaf className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-xs font-medium">Эко продукты</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Award className="h-6 w-6 mx-auto mb-1 text-amber-500" />
            <p className="text-xs font-medium">Проверенные</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Truck className="h-6 w-6 mx-auto mb-1 text-blue-500" />
            <p className="text-xs font-medium">Доставка</p>
          </div>
        </div>
      </section>

      {/* Featured Farms */}
      <section className="px-4 pb-4">
        <h3 className="font-bold text-lg mb-3">Проверенные фермы</h3>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {farms.map((farm) => (
            <div 
              key={farm.id}
              className="flex-shrink-0 w-64 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="relative h-24">
                <img src={farm.image} alt={farm.name} className="w-full h-full object-cover" />
                {farm.verified && (
                  <Badge className="absolute top-2 right-2 bg-primary text-xs">
                    ✓ Проверено
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{farm.logo}</span>
                  <h4 className="font-semibold text-sm truncate">{farm.name}</h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{farm.location} • {farm.distance}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{farm.rating}</span>
                  <span className="text-xs text-muted-foreground">({farm.reviewCount})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {farm.specialties.slice(0, 2).map((spec) => (
                    <span key={spec} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              <span>{cat.emoji}</span>
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-6">
        <h3 className="font-bold text-lg mb-3">
          {selectedCategory === 'all' 
            ? 'Все продукты' 
            : categories.find(c => c.id === selectedCategory)?.name}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="relative aspect-square">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.includes(product.id) 
                        ? 'fill-destructive text-destructive' 
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
                {product.organic && (
                  <Badge className="absolute top-2 left-2 bg-primary text-xs">
                    <Leaf className="h-3 w-3 mr-1" /> Эко
                  </Badge>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                </div>
                <h4 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <span>{product.farmLogo}</span>
                  <span className="truncate">{product.farm}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-primary">{product.price} ₽</p>
                    <p className="text-xs text-muted-foreground">/{product.unit}</p>
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-xl h-9 w-9"
                    onClick={() => handleAddToCart(product)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-6">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
          <h3 className="font-bold mb-3">Как это работает?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <p className="font-medium">Выберите продукты</p>
                <p className="text-sm text-muted-foreground">Из каталога проверенных ферм</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <p className="font-medium">Фермер готовит заказ</p>
                <p className="text-sm text-muted-foreground">Свежие продукты специально для вас</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <p className="font-medium">Доставляем к двери</p>
                <p className="text-sm text-muted-foreground">В удобное для вас время</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
