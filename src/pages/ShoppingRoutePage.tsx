import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Navigation, ShoppingBag, ChevronRight, Search, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { VigodaMap } from '@/components/map/VigodaMap';
import { RouteNavigation } from '@/components/map/RouteNavigation';
import { useAppStore } from '@/stores/useAppStore';
import { stores } from '@/data/storesData';
import { searchAddress, calculateOptimalRoute, calculateDistance, calculateWalkingTime } from '@/services/nominatimService';

interface StoreWithProducts {
  store: typeof stores[0];
  products: { name: string; price: number; quantity: number }[];
  totalPrice: number;
  lat: number;
  lng: number;
}

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

export default function ShoppingRoutePage() {
  const navigate = useNavigate();
  const cart = useAppStore((state) => state.cart);
  const [userLocation, setUserLocation] = useState({ lat: 55.7558, lng: 37.6173 });
  const [addressSearch, setAddressSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; displayName: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreWithProducts | null>(null);

  // Group store products from cart
  const storeProducts = useMemo(() => {
    const storeMap = new Map<string, StoreWithProducts>();

    // Filter only store products
    const storeItems = cart.filter(item => 
      item.type === 'product' || item.type === 'recipe-ingredients'
    );

    // Distribute products to stores (mock logic)
    storeItems.forEach((item) => {
      // Assign products to random stores for demo
      const storeIds = ['pyaterochka', 'magnit', 'vkusvill'];
      const storeId = storeIds[Math.floor(Math.random() * storeIds.length)];
      const store = stores.find(s => s.id === storeId);
      
      if (store && item.product) {
        const existing = storeMap.get(storeId);
        const product = { name: item.product.name, price: item.product.price, quantity: item.quantity };
        
        if (existing) {
          existing.products.push(product);
          existing.totalPrice += item.product.price * item.quantity;
        } else {
          storeMap.set(storeId, {
            store,
            products: [product],
            totalPrice: item.product.price * item.quantity,
            ...storeCoordinates[storeId],
          });
        }
      }
    });

    return Array.from(storeMap.values());
  }, [cart]);

  // Calculate optimal route
  const routeData = useMemo(() => {
    if (storeProducts.length === 0) {
      return { route: [], stores: [], totalDistance: 0, totalTime: 0 };
    }

    const points = storeProducts.map(sp => ({
      lat: sp.lat,
      lng: sp.lng,
      id: sp.store.id,
    }));

    const result = calculateOptimalRoute(userLocation, points);
    
    // Map route back to store products
    const orderedStores = result.route.map(point => 
      storeProducts.find(sp => sp.store.id === point.id)!
    );

    // Build full route with user location at start
    const fullRoute = [
      userLocation,
      ...result.route,
    ];

    return {
      route: fullRoute,
      stores: orderedStores,
      totalDistance: result.totalDistance,
      totalTime: result.totalTime,
    };
  }, [storeProducts, userLocation]);

  // Search address
  const handleAddressSearch = async () => {
    if (!addressSearch.trim()) return;
    
    setIsSearching(true);
    const results = await searchAddress(addressSearch);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectAddress = (result: { lat: number; lng: number; displayName: string }) => {
    setUserLocation({ lat: result.lat, lng: result.lng });
    setSearchResults([]);
    setAddressSearch(result.displayName.split(',')[0]);
  };

  // Get user geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  // Map markers
  const mapMarkers = useMemo(() => {
    return routeData.stores.map((sp, index) => ({
      id: sp.store.id,
      lat: sp.lat,
      lng: sp.lng,
      color: sp.store.color,
      icon: sp.store.logo,
      label: sp.store.name,
      onClick: () => setSelectedStore(sp),
    }));
  }, [routeData.stores]);

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Маршрут покупок</h1>
          <div className="w-10" />
        </div>
      </header>

      <Breadcrumbs />

      {/* Address Search */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Введите адрес..."
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleAddressSearch} disabled={isSearching}>
            {isSearching ? 'Поиск...' : 'Найти'}
          </Button>
          <Button variant="outline" size="icon" onClick={handleGetLocation}>
            <Navigation className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSelectAddress(result)}
                className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{result.displayName}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="px-4">
        <VigodaMap
          center={userLocation}
          zoom={13}
          markers={mapMarkers}
          userLocation={userLocation}
          route={routeData.route}
          style={{ width: '100%', height: '300px', borderRadius: '0.75rem' }}
          onMarkerClick={(marker) => {
            const store = routeData.stores.find(s => s.store.id === marker.id);
            if (store) setSelectedStore(store);
          }}
        />
      </div>

      {/* Route Summary */}
      {routeData.stores.length > 0 && (
        <div className="px-4 py-4">
          <div className="bg-primary/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Route className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Оптимальный маршрут</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{routeData.stores.length}</div>
                <div className="text-xs text-muted-foreground">магазинов</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{routeData.totalDistance.toFixed(1)} км</div>
                <div className="text-xs text-muted-foreground">расстояние</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">~{routeData.totalTime} мин</div>
                <div className="text-xs text-muted-foreground">пешком</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store List */}
      <div className="px-4 py-2">
        <h2 className="font-bold text-lg mb-3">Порядок посещения</h2>
        
        {routeData.stores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Добавьте товары в корзину для построения маршрута</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routeData.stores.map((sp, index) => {
              const distance = index === 0 
                ? calculateDistance(userLocation.lat, userLocation.lng, sp.lat, sp.lng)
                : calculateDistance(
                    routeData.stores[index - 1].lat,
                    routeData.stores[index - 1].lng,
                    sp.lat,
                    sp.lng
                  );
              const walkTime = calculateWalkingTime(distance);

              return (
                <div key={sp.store.id}>
                  {/* Walking segment */}
                  <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                    <div className="w-6 flex justify-center">
                      <div className="w-0.5 h-4 bg-border" />
                    </div>
                    <Navigation className="h-3 w-3" />
                    <span>{distance.toFixed(1)} км • {walkTime} мин пешком</span>
                  </div>

                  {/* Store card */}
                  <button
                    onClick={() => setSelectedStore(sp)}
                    className={`w-full text-left bg-card rounded-xl p-4 border transition-colors ${
                      selectedStore?.store.id === sp.store.id 
                        ? 'border-primary shadow-md' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl ${sp.store.color} flex items-center justify-center text-2xl`}>
                          {sp.store.logo}
                        </div>
                        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold">{sp.store.name}</h3>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {sp.products.length} товаров на {sp.totalPrice.toFixed(0)}₽
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {sp.store.workingHours}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Store Details */}
      {selectedStore && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${selectedStore.store.color} flex items-center justify-center text-xl`}>
              {selectedStore.store.logo}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{selectedStore.store.name}</h3>
              <p className="text-sm text-muted-foreground">Список покупок</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedStore(null)}>
              Закрыть
            </Button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedStore.products.map((product, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{product.name} × {product.quantity}</span>
                <span className="font-medium">{(product.price * product.quantity).toFixed(0)}₽</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <span className="font-medium">Итого в магазине:</span>
            <span className="font-bold text-lg">{selectedStore.totalPrice.toFixed(0)}₽</span>
          </div>
        </div>
      )}
    </div>
  );
}
