import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Star, Users, MapPin, Clock, Check, Phone, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/useAppStore';
import { allCateringOffers } from '@/data/cateringData';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

interface ServiceOption {
  id: string;
  name: string;
  pricePerPerson: number;
  included: boolean;
}

export default function CateringDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addCateringToCart } = useAppStore();
  const [isFavorite, setIsFavorite] = useState(false);

  const offer = allCateringOffers.find(o => o.id === id);

  // Initialize guest count based on offer's min/max
  const [guestCount, setGuestCount] = useState(offer?.guestsMin || 10);

  // Service options with prices
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([
    { id: 'service', name: 'Сервировка стола', pricePerPerson: 150, included: true },
    { id: 'tableware', name: 'Посуда', pricePerPerson: 100, included: true },
    { id: 'waiter', name: 'Официант (3 часа)', pricePerPerson: 200, included: true },
    { id: 'cleanup', name: 'Уборка после', pricePerPerson: 100, included: true },
    { id: 'decor', name: 'Декорирование', pricePerPerson: 300, included: false },
    { id: 'music', name: 'Музыкальное сопровождение', pricePerPerson: 150, included: false },
    { id: 'photo', name: 'Фотограф (2 часа)', pricePerPerson: 500, included: false },
  ]);

  const toggleService = (serviceId: string) => {
    setServiceOptions(prev => prev.map(s => 
      s.id === serviceId ? { ...s, included: !s.included } : s
    ));
  };

  // Calculate total price based on selected services
  const { basePricePerPerson, totalPrice, depositAmount } = useMemo(() => {
    const basePrice = offer?.priceFrom || 1000;
    const additionalServices = serviceOptions
      .filter(s => s.included)
      .reduce((sum, s) => sum + s.pricePerPerson, 0);
    const pricePerPerson = basePrice + additionalServices;
    const total = pricePerPerson * guestCount;
    const deposit = Math.round(total * 0.3); // 30% deposit
    return { basePricePerPerson: pricePerPerson, totalPrice: total, depositAmount: deposit };
  }, [offer, serviceOptions, guestCount]);

  if (!offer) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Предложение не найдено</p>
          <Link to="/catering">
            <Button>Вернуться к кейтерингу</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryLabels = {
    home: 'На дом',
    office: 'В офис',
    themed: 'Тематический'
  };

  const categoryColors = {
    home: 'bg-green-500/10 text-green-600',
    office: 'bg-blue-500/10 text-blue-600',
    themed: 'bg-purple-500/10 text-purple-600'
  };

  const similarOffers = allCateringOffers
    .filter(o => o.category === offer.category && o.id !== offer.id)
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Ссылка скопирована!' });
  };

  const handleOrder = () => {
    addCateringToCart({
      id: offer.id,
      name: offer.title,
      image: offer.image,
      pricePerPerson: basePricePerPerson,
      guestCount,
      depositPercent: 30,
      totalPrice,
      services: serviceOptions,
    });
    toast({
      title: 'Добавлено в корзину!',
      description: `${offer.title} на ${guestCount} гостей. Предоплата: ${depositAmount.toLocaleString()} ₽`,
    });
  };

  return (
    <div className="page-container pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg truncate max-w-[200px]">Кейтеринг</h1>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-muted">
              <Share2 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)} 
              className="p-2 rounded-full hover:bg-muted"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} />
            </button>
          </div>
        </div>
        <Breadcrumbs />
      </header>

      {/* Main Image */}
      <section className="relative">
        <div className="aspect-video bg-muted">
          <img 
            src={offer.image} 
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        </div>
        <Badge className={`absolute top-4 left-4 ${categoryColors[offer.category]}`}>
          {categoryLabels[offer.category]}
        </Badge>
      </section>

      {/* Info */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium">{offer.rating}</span>
            <span className="text-sm text-muted-foreground">({offer.reviewCount} отзывов)</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-2">{offer.title}</h2>
        <p className="text-muted-foreground mb-4">{offer.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {offer.guestsMin}-{offer.guestsMax} гостей
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Доставка от 2 часов
          </span>
        </div>

        {/* Guest Count Slider */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-2">Количество гостей</p>
          <div className="flex items-center gap-4 mb-3">
            <Slider
              value={[guestCount]}
              onValueChange={([value]) => setGuestCount(value)}
              min={offer.guestsMin}
              max={offer.guestsMax}
              step={1}
              className="flex-1"
            />
            <span className="font-bold text-lg w-12 text-right">{guestCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Итого</p>
              <p className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} ₽</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Предоплата 30%</p>
              <p className="text-lg font-semibold text-foreground">{depositAmount.toLocaleString()} ₽</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 mb-6">
        <Tabs defaultValue="includes" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted rounded-xl">
            <TabsTrigger value="includes">Включено</TabsTrigger>
            <TabsTrigger value="menu">Меню</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>

          <TabsContent value="includes" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-3">Выберите услуги</h4>
              <div className="space-y-3">
                {serviceOptions.map((service) => (
                  <div 
                    key={service.id} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      service.included 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={service.included} 
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <span className={service.included ? 'font-medium' : 'text-muted-foreground'}>
                        {service.name}
                      </span>
                    </div>
                    <span className={`font-semibold ${service.included ? 'text-primary' : 'text-muted-foreground'}`}>
                      +{service.pricePerPerson} ₽/чел
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Цена за гостя:</span>
                  <span className="font-bold text-lg">{basePricePerPerson} ₽</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-4">
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="font-semibold mb-3">Меню</h4>
              <div className="space-y-2">
                {offer.menuItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="space-y-3">
              {offer.reviews.map((review, idx) => (
                <div key={idx} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{review.author}</span>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Similar Offers */}
      {similarOffers.length > 0 && (
        <section className="px-4 mb-24">
          <h3 className="font-bold text-lg mb-3">Похожие предложения</h3>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {similarOffers.map((similar) => (
              <Link 
                key={similar.id}
                to={`/catering/${similar.id}`}
                className="flex-shrink-0 w-48 bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="aspect-video bg-muted">
                  <img src={similar.image} alt={similar.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="font-medium line-clamp-1 mb-1">{similar.title}</p>
                  <p className="text-sm text-primary font-bold">от {similar.priceFrom}₽/чел</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 z-30">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-12 w-12">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            className="flex-1 h-12 rounded-xl text-base"
            variant="hero"
            onClick={handleOrder}
          >
            Заказать за {depositAmount.toLocaleString()} ₽
          </Button>
        </div>
      </div>
    </div>
  );
}
