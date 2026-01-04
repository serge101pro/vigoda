import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Percent, Package, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { stores } from '@/data/storesData';
import { mockProducts } from '@/data/mockData';
import { ProductCarousel } from '@/components/home/ProductCarousel';
import { VigodaMap } from '@/components/map/VigodaMap';

export default function StoreDetailPage() {
  const { id } = useParams();
  const store = stores.find(s => s.id === id);

  if (!store) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Магазин не найден</h2>
          <Link to="/stores">
            <Button>Вернуться к магазинам</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter products that have this store in their stores array
  const storeProducts = mockProducts.filter(p => 
    p.stores?.some(s => s.name.toLowerCase().includes(store.name.split(' ')[0].toLowerCase()))
  );

  return (
    <div className="page-container">
      {/* Hero */}
      <div className={`relative h-48 ${store.color}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link to="/stores">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </header>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center text-4xl shadow-lg">
              {store.logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{store.rating}</span>
                </div>
                <span className="text-muted-foreground">({store.reviewCount.toLocaleString()} отзывов)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Percent className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">до {store.averageDiscount}%</p>
            <p className="text-xs text-muted-foreground">Скидки</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Package className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{store.productsCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Товаров</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{store.workingHours.split(' - ')[0]}</p>
            <p className="text-xs text-muted-foreground">Открытие</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-2">О магазине</h2>
          <p className="text-muted-foreground text-sm">{store.fullDescription}</p>
        </div>

        {/* Features */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-3">Преимущества</h2>
          <div className="flex flex-wrap gap-2">
            {store.features.map((feature, i) => (
              <Badge key={i} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="space-y-3">
          <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Время работы</p>
              <p className="text-sm text-muted-foreground">{store.workingHours}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Доставка</p>
              <p className="text-sm text-muted-foreground">{store.deliveryInfo}</p>
            </div>
          </div>
        </div>

        {/* Store Location Map */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Расположение магазина
          </h2>
          <VigodaMap
            center={{ lat: 55.7558, lng: 37.6173 }}
            zoom={15}
            markers={[{
              id: store.id,
              lat: 55.7558,
              lng: 37.6173,
              color: store.color,
              icon: store.logo,
              label: store.name,
            }]}
            style={{ width: '100%', height: '200px', borderRadius: '0.75rem' }}
          />
          <p className="text-sm text-muted-foreground mt-2">
            г. Москва, ул. Примерная, д. 1
          </p>
        </div>

        {/* Categories */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-3">Категории товаров</h2>
          <div className="flex flex-wrap gap-2">
            {store.categories.map((cat, i) => (
              <Badge key={i} variant="outline">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Products from this store */}
        {storeProducts.length > 0 && (
          <div>
            <h2 className="font-bold text-foreground mb-3 px-0">Товары из {store.name}</h2>
            <ProductCarousel products={storeProducts} rows={1} />
          </div>
        )}

        {/* Reviews */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h2 className="font-bold text-foreground mb-4">Отзывы покупателей</h2>
          <div className="space-y-4">
            {store.reviews.map((review, i) => (
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
        <Button variant="hero" size="lg" className="w-full">
          Смотреть все товары
        </Button>
      </div>
    </div>
  );
}
