import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Leaf, Award, ChevronRight, Search } from 'lucide-react';
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
    fullDescription: 'Семейная ферма "Солнечная долина" работает с 2005 года. Мы специализируемся на производстве натуральных молочных продуктов и яиц от кур свободного выгула. Все наши животные содержатся в комфортных условиях и питаются только натуральными кормами.',
    image: '🏡',
    logo: '🌻',
    rating: 4.9,
    reviewCount: 456,
    productsCount: 12,
    certified: true,
    specialties: ['Яйца', 'Молоко', 'Сметана', 'Творог'],
    features: ['Эко-сертификат', 'Доставка от фермы', 'Экскурсии', 'Свободный выгул'],
    reviews: [
      { author: 'Мария К.', rating: 5, text: 'Потрясающее качество продуктов! Яйца с ярким желтком, молоко как из детства.', date: '18.12.2024' },
      { author: 'Алексей П.', rating: 5, text: 'Заказываю регулярно. Дети обожают их творог!', date: '15.12.2024' },
      { author: 'Елена С.', rating: 5, text: 'Были на экскурсии — чистота идеальная. Теперь только у них покупаем.', date: '12.12.2024' },
    ],
  },
  {
    id: 'white-dews',
    name: 'Ферма "Белые росы"',
    location: 'Тверская область',
    description: 'Премиальные молочные продукты',
    fullDescription: 'Ферма "Белые росы" — это современное производство премиальных молочных продуктов. Наши коровы пасутся на экологически чистых лугах Тверской области. Мы используем только традиционные технологии производства без консервантов и добавок.',
    image: '🐄',
    logo: '💧',
    rating: 4.8,
    reviewCount: 312,
    productsCount: 18,
    certified: true,
    specialties: ['Молоко', 'Масло', 'Сыр', 'Кефир'],
    features: ['Пастбищное содержание', 'Без консервантов', 'Ручная работа', 'Традиционные рецепты'],
    reviews: [
      { author: 'Ольга М.', rating: 5, text: 'Их масло — лучшее, что я пробовала! Настоящий деревенский вкус.', date: '17.12.2024' },
      { author: 'Дмитрий В.', rating: 5, text: 'Качество молока на высоте. Дети пьют с удовольствием.', date: '14.12.2024' },
      { author: 'Анна Л.', rating: 4, text: 'Отличные продукты, только доставка иногда задерживается.', date: '10.12.2024' },
    ],
  },
  {
    id: 'alpine-cheese',
    name: 'Сыроварня "Альпийская"',
    location: 'Краснодарский край',
    description: 'Ремесленные сыры ручной работы',
    fullDescription: 'Сыроварня "Альпийская" производит ремесленные сыры по европейским технологиям. Наши сыровары прошли обучение в Швейцарии и Италии. Мы используем только молоко от коров свободного выпаса с горных пастбищ Краснодарского края.',
    image: '🧀',
    logo: '🏔️',
    rating: 4.9,
    reviewCount: 189,
    productsCount: 8,
    certified: true,
    specialties: ['Твёрдые сыры', 'Мягкие сыры', 'Рикотта', 'Моцарелла'],
    features: ['Швейцарские технологии', 'Выдержка в погребах', 'Медали выставок', 'Дегустации'],
    reviews: [
      { author: 'Игорь Н.', rating: 5, text: 'Сыр выдержки 6 месяцев — шедевр! Как в Италии.', date: '19.12.2024' },
      { author: 'Светлана К.', rating: 5, text: 'Были на дегустации — теперь постоянные клиенты!', date: '16.12.2024' },
      { author: 'Павел Д.', rating: 5, text: 'Качество европейское, цены российские. Рекомендую!', date: '13.12.2024' },
    ],
  },
  {
    id: 'golden-hive',
    name: 'Пасека "Золотой улей"',
    location: 'Башкортостан',
    description: 'Натуральный башкирский мёд',
    fullDescription: 'Пасека "Золотой улей" — это более 500 пчелиных семей в экологически чистых районах Башкирии. Наш мёд собирается с заповедных лугов и лесов. Мы не используем сахарный сироп и химические добавки. Только чистый мёд!',
    image: '🍯',
    logo: '🐝',
    rating: 4.9,
    reviewCount: 267,
    productsCount: 6,
    certified: true,
    specialties: ['Липовый мёд', 'Гречишный мёд', 'Цветочный мёд', 'Прополис'],
    features: ['Заповедные луга', 'Без пестицидов', 'Сырой мёд', 'Призёр конкурсов'],
    reviews: [
      { author: 'Татьяна В.', rating: 5, text: 'Настоящий башкирский мёд! Аромат божественный.', date: '18.12.2024' },
      { author: 'Сергей М.', rating: 5, text: 'Покупаю каждый год. Лучший мёд для здоровья.', date: '14.12.2024' },
      { author: 'Наталья П.', rating: 5, text: 'Вся семья лечится их мёдом. Спасибо!', date: '11.12.2024' },
    ],
  },
  {
    id: 'cockerel',
    name: 'Ферма "Петушок"',
    location: 'Рязанская область',
    description: 'Домашняя птица без антибиотиков',
    fullDescription: 'Ферма "Петушок" специализируется на выращивании домашней птицы без антибиотиков и гормонов роста. Наши куры и утки содержатся в свободных условиях с доступом к свежему воздуху и натуральным кормам.',
    image: '🐓',
    logo: '🌾',
    rating: 4.8,
    reviewCount: 198,
    productsCount: 10,
    certified: true,
    specialties: ['Курица', 'Утка', 'Индейка', 'Яйца'],
    features: ['Без антибиотиков', 'Свободный выгул', 'Натуральные корма', 'Охлаждённое мясо'],
    reviews: [
      { author: 'Елена Р.', rating: 5, text: 'Бульон из их курицы — золотой! Вкус как у бабушки.', date: '17.12.2024' },
      { author: 'Андрей К.', rating: 5, text: 'Наконец-то настоящая домашняя курица!', date: '13.12.2024' },
      { author: 'Ирина С.', rating: 4, text: 'Отличное мясо, но цены выше магазинных.', date: '09.12.2024' },
    ],
  },
];

export default function FarmsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-xl font-bold text-foreground">Фермерские хозяйства</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Найти ферму..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
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
      </div>
    </div>
  );
}
