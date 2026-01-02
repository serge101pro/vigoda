import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, Percent, Package, ChevronRight, Search, Filter, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { stores, storeCategories } from '@/data/storesData';
import { VigodaMap } from '@/components/map/VigodaMap';
import { StoreFilters } from '@/components/stores/StoreFilters';

// Mock store coordinates
const storeCoordinates: Record<string, { lat: number; lng: number }> = {
  'pyaterochka': { lat: 55.7558, lng: 37.6173 },
  'magnit': { lat: 55.7580, lng: 37.6210 },
  'perekrestok': { lat: 55.7520, lng: 37.6120 },
  'lenta': { lat: 55.7480, lng: 37.6300 },
  'vkusvill': { lat: 55.7600, lng: 37.6080 },
  'auchan': { lat: 55.7650, lng: 37.5950 },
  'svetofor': { lat: 55.7450, lng: 37.6400 },
  'metro': { lat: 55.7700, lng: 37.5800 },
};

// Mock preferred stores (would come from user profile)
const preferredStoreIds = ['pyaterochka', 'vkusvill', 'perekrestok'];

export default function StoresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'discount' | 'products'>('rating');
  const [userLocation, setUserLocation] = useState({ lat: 55.7558, lng: 37.6173 });
  const [showFilters, setShowFilters] = useState(false);
  const [storeTypeFilter, setStoreTypeFilter] = useState<string[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const filteredStores = stores
    .filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           store.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || store.categories?.includes(selectedCategory);
      return matchesSearch && (selectedCategory === 'all' || matchesCategory);
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.averageDiscount - a.averageDiscount;
      if (sortBy === 'products') return b.productsCount - a.productsCount;
      return 0;
    });

  // Get user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.log('Geolocation not available')
      );
    }
  }, []);

  // Map markers with preference highlighting
  const mapMarkers = useMemo(() => {
    return filteredStores.map(store => {
      const coords = storeCoordinates[store.id] || { lat: 55.76, lng: 37.62 };
      const isPreferred = preferredStoreIds.includes(store.id);
      return {
        id: store.id,
        lat: coords.lat,
        lng: coords.lng,
        color: isPreferred ? 'bg-primary' : store.color,
        icon: store.logo,
        label: store.name,
        onClick: () => {},
      };
    });
  }, [filteredStores]);

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
          <h1 className="text-xl font-bold text-foreground">Магазины</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Найти магазин..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {storeCategories.map((cat) => (
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

        {/* Sort Options */}
        <div className="flex gap-2">
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
            variant={sortBy === 'discount' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('discount')}
            className="text-xs"
          >
            <Percent className="h-3 w-3 mr-1" />
            По скидкам
          </Button>
          <Button
            variant={sortBy === 'products' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('products')}
            className="text-xs"
          >
            <Package className="h-3 w-3 mr-1" />
            По товарам
          </Button>
        </div>

        {/* Map */}
        <div className="relative">
          <VigodaMap
            center={userLocation}
            zoom={13}
            markers={mapMarkers}
            userLocation={userLocation}
            style={{ width: '100%', height: '250px', borderRadius: '0.75rem' }}
          />
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute bottom-3 right-3"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                });
              }
            }}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Моё место
          </Button>
          <div className="absolute top-3 left-3 flex gap-1">
            {preferredStoreIds.length > 0 && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                ⭐ {preferredStoreIds.length} избранных
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{stores.length}</p>
            <p className="text-xs text-muted-foreground">Сетей</p>
          </div>
          <div className="bg-accent/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-accent-foreground">50000+</p>
            <p className="text-xs text-muted-foreground">Товаров</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">До 50%</p>
            <p className="text-xs text-muted-foreground">Скидки</p>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Найдено: {filteredStores.length} магазинов
        </p>

        {/* Stores List */}
        <div className="space-y-4">
          {filteredStores.map((store) => (
            <Link
              key={store.id}
              to={`/store/${store.id}`}
              className="block bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className={`w-16 h-16 rounded-2xl ${store.color} flex items-center justify-center text-3xl`}>
                    {store.logo}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{store.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{store.description}</p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {store.rating}
                      </span>
                      <span className="flex items-center gap-1 text-primary">
                        <Percent className="h-4 w-4" />
                        до {store.averageDiscount}%
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        {store.productsCount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {store.features.slice(0, 3).map((feature, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Магазины не найдены</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
