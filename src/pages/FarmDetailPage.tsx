import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Award, Leaf, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { farmProducts } from '@/data/farmData';
import { FarmProductCarousel } from '@/components/home/FarmProductCarousel';

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

export default function FarmDetailPage() {
  const { id } = useParams();
  const farm = farms.find(f => f.id === id);

  if (!farm) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Ферма не найдена</h2>
          <Link to="/farms">
            <Button>Вернуться к фермам</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get products from this farm
  const farmProductsList = farmProducts.filter(p => 
    p.farm.name.toLowerCase().includes(farm.name.split('"')[1]?.toLowerCase() || farm.name.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="relative h-48 bg-gradient-to-br from-green-500 to-green-600">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/farms">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </header>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center text-4xl shadow-lg">
              {farm.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{farm.name}</h1>
                {farm.certified && (
                  <Award className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{farm.rating}</span>
                </div>
                <span className="text-muted-foreground">({farm.reviewCount} отзывов)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{farm.location}</span>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Leaf className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Эко продукты</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-lg font-bold text-foreground">{farm.productsCount}</p>
            <p className="text-xs text-muted-foreground">Товаров</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Truck className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Доставка</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-2">О ферме</h2>
          <p className="text-muted-foreground text-sm">{farm.fullDescription}</p>
        </div>

        {/* Features */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-3">Преимущества</h2>
          <div className="flex flex-wrap gap-2">
            {farm.features.map((feature, i) => (
              <Badge key={i} variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-3">Специализация</h2>
          <div className="flex flex-wrap gap-2">
            {farm.specialties.map((spec, i) => (
              <Badge key={i} variant="outline">
                {spec}
              </Badge>
            ))}
          </div>
        </div>

        {/* Products from this farm */}
        {farmProductsList.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground mb-3">Продукты фермы</h2>
            <FarmProductCarousel products={farmProductsList} rows={1} />
          </div>
        )}

        {/* All farm products */}
        <div>
          <h2 className="font-bold text-foreground mb-3">Все фермерские продукты</h2>
          <FarmProductCarousel products={farmProducts} rows={1} />
        </div>

        {/* Reviews */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-4">Отзывы покупателей</h2>
          <div className="space-y-4">
            {farm.reviews.map((review, i) => (
              <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{review.author}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-4 w-4 ${j < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{review.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link to="/farm-products">
          <Button variant="hero" size="lg" className="w-full">
            Смотреть все продукты фермы
          </Button>
        </Link>
      </div>
    </div>
  );
}
