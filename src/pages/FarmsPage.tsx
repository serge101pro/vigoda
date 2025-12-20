import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Leaf, Award, ChevronRight, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { farmProducts } from '@/data/farmData';

interface Farm {
  id: string;
  name: string;
  location: string;
  description: string;
  fullDescription: string;
  image: string;
  logo: string;
  rating: number;
  reviewCount: number;
  productsCount: number;
  certified: boolean;
  specialties: string[];
  features: string[];
  reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
  }[];
}

const farms: Farm[] = [
  {
    id: 'sunny-valley',
    name: 'Ферма "Солнечная долина"',
    location: 'Московская область, Дмитровский район',
    description: 'Семейная ферма с традициями',
    fullDescription: 'Семейная ферма "Солнечная долина" работает с 2005 года.',
    image: '🏡',
    logo: '🌻',
    rating: 4.9,
    reviewCount: 456,
    productsCount: 12,
    certified: true,
    specialties: ['Яйца', 'Молоко', 'Сметана', 'Творог'],
    features: ['Эко-сертификат', 'Доставка от фермы', 'Экскурсии', 'Свободный выгул'],
    reviews: [],
  },
  {
    id: 'white-dews',
    name: 'Ферма "Белые росы"',
    location: 'Тверская область',
    description: 'Премиальные молочные продукты',
    fullDescription: 'Ферма "Белые росы" — это современное производство премиальных молочных продуктов.',
    image: '🐄',
    logo: '💧',
    rating: 4.8,
    reviewCount: 312,
    productsCount: 18,
    certified: true,
    specialties: ['Молоко', 'Масло', 'Сыр', 'Кефир'],
    features: ['Пастбищное содержание', 'Без консервантов', 'Ручная работа', 'Традиционные рецепты'],
    reviews: [],
  },
  {
    id: 'alpine-cheese',
    name: 'Сыроварня "Альпийская"',
    location: 'Краснодарский край',
    description: 'Ремесленные сыры ручной работы',
    fullDescription: 'Сыроварня "Альпийская" производит ремесленные сыры по европейским технологиям.',
    image: '🧀',
    logo: '🏔️',
    rating: 4.9,
    reviewCount: 189,
    productsCount: 8,
    certified: true,
    specialties: ['Твёрдые сыры', 'Мягкие сыры', 'Рикотта', 'Моцарелла'],
    features: ['Швейцарские технологии', 'Выдержка в погребах', 'Медали выставок', 'Дегустации'],
    reviews: [],
  },
  {
    id: 'golden-hive',
    name: 'Пасека "Золотой улей"',
    location: 'Башкортостан',
    description: 'Натуральный башкирский мёд',
    fullDescription: 'Пасека "Золотой улей" — это более 500 пчелиных семей в экологически чистых районах Башкирии.',
    image: '🍯',
    logo: '🐝',
    rating: 4.9,
    reviewCount: 267,
    productsCount: 6,
    certified: true,
    specialties: ['Липовый мёд', 'Гречишный мёд', 'Цветочный мёд', 'Прополис'],
    features: ['Заповедные луга', 'Без пестицидов', 'Сырой мёд', 'Призёр конкурсов'],
    reviews: [],
  },
  {
    id: 'cockerel',
    name: 'Ферма "Петушок"',
    location: 'Рязанская область',
    description: 'Домашняя птица без антибиотиков',
    fullDescription: 'Ферма "Петушок" специализируется на выращивании домашней птицы без антибиотиков.',
    image: '🐓',
    logo: '🌾',
    rating: 4.8,
    reviewCount: 198,
    productsCount: 10,
    certified: true,
    specialties: ['Курица', 'Утка', 'Индейка', 'Яйца'],
    features: ['Без антибиотиков', 'Свободный выгул', 'Натуральные корма', 'Охлаждённое мясо'],
    reviews: [],
  },
];

const specialtyCategories = [
  { id: 'all', label: 'Все', emoji: '🌿' },
  { id: 'dairy', label: 'Молочное', emoji: '🥛' },
  { id: 'eggs', label: 'Яйца', emoji: '🥚' },
  { id: 'meat', label: 'Мясо', emoji: '🥩' },
  { id: 'honey', label: 'Мёд', emoji: '🍯' },
  { id: 'cheese', label: 'Сыры', emoji: '🧀' },
  { id: 'vegetables', label: 'Овощи', emoji: '🥬' },
];

const regionFilters = [
  { id: 'all', label: 'Все регионы' },
  { id: 'moscow', label: 'Москва и область' },
  { id: 'tver', label: 'Тверская область' },
  { id: 'krasnodar', label: 'Краснодарский край' },
  { id: 'bashkortostan', label: 'Башкортостан' },
  { id: 'ryazan', label: 'Рязанская область' },
];

export default function FarmsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'products'>('rating');
  const [onlyCertified, setOnlyCertified] = useState(false);

  const filteredFarms = farms
    .filter(farm => {
      const matchesSearch = farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           farm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           farm.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCertified = !onlyCertified || farm.certified;
      return matchesSearch && matchesCertified;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      if (sortBy === 'products') return b.productsCount - a.productsCount;
      return 0;
    });

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
          <h1 className="text-xl font-bold text-foreground">Фермерские хозяйства</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Найти ферму или продукт..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {specialtyCategories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {cat.emoji} {cat.label}
            </Button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={onlyCertified ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyCertified(!onlyCertified)}
            className="text-xs"
          >
            <Award className="h-3 w-3 mr-1" />
            Сертифицированные
          </Button>
          <Button
            variant={sortBy === 'rating' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('rating')}
            className="text-xs"
          >
            <Star className="h-3 w-3 mr-1" />
            По рейтингу
          </Button>
          <Button
            variant={sortBy === 'reviews' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('reviews')}
            className="text-xs"
          >
            💬 По отзывам
          </Button>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌿</span>
            <div>
              <h2 className="font-bold text-foreground">Натуральные продукты</h2>
              <p className="text-sm text-muted-foreground">Напрямую от фермеров, без посредников</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold text-primary">{farms.length}</p>
            <p className="text-xs text-muted-foreground">Ферм</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-2xl font-bold text-foreground">100+</p>
            <p className="text-xs text-muted-foreground">Продуктов</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Leaf className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">100% Эко</p>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredFarms.length} ферм
        </p>

        {/* Farms List */}
        <div className="space-y-4">
          {filteredFarms.map((farm) => (
            <Link
              key={farm.id}
              to={`/farm/${farm.id}`}
              className="block bg-card rounded-2xl border border-border hover:border-green-500/50 transition-colors overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-3xl">
                    {farm.logo}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground">{farm.name}</h3>
                      {farm.certified && (
                        <Award className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{farm.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {farm.location}
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
                </div>

                {/* Rating & Products */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {farm.rating} ({farm.reviewCount})
                    </span>
                    <span className="text-muted-foreground">
                      {farm.productsCount} товаров
                    </span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {farm.specialties.slice(0, 4).map((spec, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredFarms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Фермы не найдены</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyCertified(false);
            }}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
