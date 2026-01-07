import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Users, Briefcase, Star, Clock, ChefHat, Phone, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface CateringPackage {
  id: string;
  name: string;
  description: string;
  image: string;
  priceFrom: number;
  pricePerPerson?: number;
  minGuests: number;
  maxGuests: number;
  includes: string[];
  popular?: boolean;
}

interface ThemeEvent {
  id: string;
  name: string;
  emoji: string;
  image: string;
  description: string;
  priceFrom: number;
}

const privatePackages: CateringPackage[] = [
  {
    id: '1',
    name: 'Лёгкий фуршет',
    description: 'Идеально для небольших встреч и дружеских посиделок',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80',
    priceFrom: 15000,
    pricePerPerson: 1500,
    minGuests: 10,
    maxGuests: 30,
    includes: ['Канапе', 'Мини-сэндвичи', 'Фрукты', 'Напитки'],
  },
  {
    id: '2',
    name: 'Праздничный банкет',
    description: 'Полноценный банкет с горячими блюдами и десертами',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    priceFrom: 45000,
    pricePerPerson: 3000,
    minGuests: 15,
    maxGuests: 100,
    includes: ['Холодные закуски', 'Горячее', 'Гарниры', 'Десерты', 'Напитки'],
    popular: true,
  },
  {
    id: '3',
    name: 'Премиум',
    description: 'Эксклюзивное меню от шеф-повара с авторскими блюдами',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
    priceFrom: 100000,
    pricePerPerson: 5000,
    minGuests: 20,
    maxGuests: 150,
    includes: ['Авторское меню', 'Живая кулинария', 'Премиум напитки', 'Индивидуальная подача'],
  },
];

const corporatePackages: CateringPackage[] = [
  {
    id: '4',
    name: 'Бизнес-ланч',
    description: 'Оперативная доставка обедов в офис',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    priceFrom: 500,
    pricePerPerson: 500,
    minGuests: 10,
    maxGuests: 500,
    includes: ['Салат', 'Суп', 'Горячее', 'Напиток'],
  },
  {
    id: '5',
    name: 'Корпоратив',
    description: 'Организация корпоративных мероприятий любого масштаба',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
    priceFrom: 80000,
    pricePerPerson: 2500,
    minGuests: 30,
    maxGuests: 300,
    includes: ['Фуршет', 'Банкет', 'Напитки', 'Обслуживание'],
    popular: true,
  },
  {
    id: '6',
    name: 'Конференция',
    description: 'Кейтеринг для деловых мероприятий и конференций',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    priceFrom: 30000,
    pricePerPerson: 1200,
    minGuests: 25,
    maxGuests: 500,
    includes: ['Кофе-брейки', 'Фуршет', 'Вода', 'Снеки'],
  },
];

const themeEvents: ThemeEvent[] = [
  { id: '1', name: 'Романтический ужин', emoji: '💕', image: 'https://images.unsplash.com/photo-1529543544277-c91cb0c05f11?w=400&q=80', description: 'Создадим незабываемую атмосферу для двоих', priceFrom: 8000 },
  { id: '2', name: 'День рождения', emoji: '🎂', image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80', description: 'Праздничное меню для именинника', priceFrom: 25000 },
  { id: '3', name: 'Детский праздник', emoji: '🎈', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80', description: 'Весёлое меню для маленьких гостей', priceFrom: 20000 },
  { id: '4', name: 'Свадьба', emoji: '💒', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80', description: 'Банкет мечты для вашего торжества', priceFrom: 150000 },
  { id: '5', name: 'Юбилей', emoji: '🏆', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&q=80', description: 'Торжественное меню для круглой даты', priceFrom: 50000 },
  { id: '6', name: 'Новый год', emoji: '🎄', image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&q=80', description: 'Праздничный стол с новогодним настроением', priceFrom: 60000 },
  { id: '7', name: 'Рождество', emoji: '⭐', image: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=400&q=80', description: 'Традиционные блюда для рождественского ужина', priceFrom: 40000 },
  { id: '8', name: 'Пасха', emoji: '🐣', image: 'https://images.unsplash.com/photo-1521967906867-14ec9d64bee8?w=400&q=80', description: 'Пасхальный стол с куличами и угощениями', priceFrom: 30000 },
  { id: '9', name: 'Вечеринка', emoji: '🎉', image: 'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=400&q=80', description: 'Стильный фуршет для вашей вечеринки', priceFrom: 35000 },
  { id: '10', name: 'Дружеские посиделки', emoji: '🍕', image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80', description: 'Неформальное меню для тёплой компании', priceFrom: 15000 },
  { id: '11', name: 'Семейное торжество', emoji: '👨‍👩‍👧‍👦', image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80', description: 'Домашняя кухня для большой семьи', priceFrom: 25000 },
  { id: '12', name: 'Поминки', emoji: '🕯️', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', description: 'Деликатная организация поминальной трапезы', priceFrom: 20000 },
];

const serviceOptions = [
  { id: 'full', name: 'Полное обслуживание', description: 'Официанты, посуда, декор', icon: '🍽️', priceAdd: '+30%' },
  { id: 'partial', name: 'Частичное', description: 'Доставка и сервировка', icon: '📦', priceAdd: '+15%' },
  { id: 'delivery', name: 'Только доставка', description: 'Привезём готовые блюда', icon: '🚗', priceAdd: '' },
];

export default function CateringPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('delivery');

  const handleOrderClick = (packageName: string) => {
    toast({
      title: 'Заявка на кейтеринг',
      description: `Мы свяжемся с вами для обсуждения "${packageName}"`,
    });
  };

  return (
    <div className="page-container pt-4">

      {/* Hero */}
      <section className="relative h-48 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80"
          alt="Кейтеринг"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-2xl font-bold text-foreground mb-1">Вкусно и красиво</h2>
          <p className="text-muted-foreground">Организуем любое мероприятие под ключ</p>
        </div>
      </section>

      {/* Service Type Selection */}
      <section className="px-4 py-4">
        <h3 className="font-semibold mb-3">Тип обслуживания</h3>
        <div className="grid grid-cols-3 gap-2">
          {serviceOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedService(option.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedService === option.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-2xl block mb-1">{option.icon}</span>
              <p className="text-xs font-medium">{option.name}</p>
              {option.priceAdd && (
                <p className="text-xs text-primary mt-1">{option.priceAdd}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4">
        <Tabs defaultValue="private" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl mb-4">
            <TabsTrigger value="private" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Частным
            </TabsTrigger>
            <TabsTrigger value="corporate" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              Компаниям
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              Тематика
            </TabsTrigger>
          </TabsList>

          {/* Private Packages */}
          <TabsContent value="private" className="space-y-4">
            {privatePackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/catering/home-${pkg.id}`)}
              >
                <div className="relative h-40">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  {pkg.popular && (
                    <Badge className="absolute top-3 left-3 bg-primary">Популярное</Badge>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-1">{pkg.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pkg.includes.map((item) => (
                      <span key={item} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{pkg.minGuests}-{pkg.maxGuests} гостей</p>
                      <p className="text-lg font-bold text-primary">от {pkg.priceFrom.toLocaleString()} ₽</p>
                    </div>
                    <Button onClick={(e) => { e.stopPropagation(); navigate(`/catering/home-${pkg.id}`); }}>
                      Подробнее
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Corporate Packages */}
          <TabsContent value="corporate" className="space-y-4">
            {corporatePackages.map((pkg) => (
              <div 
                key={pkg.id}
                className="bg-card rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => navigate(`/catering/office-${pkg.id}`)}
              >
                <div className="relative h-40">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                  {pkg.popular && (
                    <Badge className="absolute top-3 left-3 bg-primary">Популярное</Badge>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-1">{pkg.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pkg.includes.map((item) => (
                      <span key={item} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{pkg.minGuests}-{pkg.maxGuests} человек</p>
                      <p className="text-lg font-bold text-primary">от {pkg.priceFrom.toLocaleString()} ₽</p>
                    </div>
                    <Button onClick={(e) => { e.stopPropagation(); navigate(`/catering/office-${pkg.id}`); }}>
                      Подробнее
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Theme Events */}
          <TabsContent value="themes">
            <div className="grid grid-cols-2 gap-3">
              {themeEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/catering/themed-${event.id}`)}
                  className="bg-card rounded-xl border border-border overflow-hidden text-left hover:border-primary/50 transition-all"
                >
                  <div className="relative h-24">
                    <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-2xl">{event.emoji}</span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm mb-1">{event.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                    <p className="text-sm font-bold text-primary">от {event.priceFrom.toLocaleString()} ₽</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Contact */}
      <section className="px-4 py-6 mb-6">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-bold">Нужна консультация?</h3>
              <p className="text-sm text-muted-foreground">Поможем подобрать меню</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Позвонить
            </Button>
            <Button className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Написать
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
