import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, Minus, Plus, Phone, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stores } from '@/data/storesData';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

interface StoreLocation {
  id: string;
  name: string;
  logo: string;
  color: string;
  address: string;
  distance: string;
  distanceMeters: number;
  lat: number;
  lng: number;
  workingHours: string;
  phone: string;
  rating: number;
}

// Mock store locations near user
const mockStoreLocations: StoreLocation[] = [
  {
    id: 'pyaterochka-1',
    name: 'Пятёрочка',
    logo: '🏪',
    color: 'bg-red-500',
    address: 'ул. Ленина, 15',
    distance: '350 м',
    distanceMeters: 350,
    lat: 55.7558,
    lng: 37.6173,
    workingHours: '08:00 - 23:00',
    phone: '+7 (800) 555-55-05',
    rating: 4.2,
  },
  {
    id: 'magnit-1',
    name: 'Магнит',
    logo: '🧲',
    color: 'bg-red-600',
    address: 'пр. Мира, 42',
    distance: '520 м',
    distanceMeters: 520,
    lat: 55.7570,
    lng: 37.6195,
    workingHours: '08:00 - 22:00',
    phone: '+7 (800) 200-90-02',
    rating: 4.1,
  },
  {
    id: 'vkusvill-1',
    name: 'ВкусВилл',
    logo: '🌿',
    color: 'bg-green-500',
    address: 'ул. Тверская, 7',
    distance: '780 м',
    distanceMeters: 780,
    lat: 55.7545,
    lng: 37.6150,
    workingHours: '08:00 - 22:00',
    phone: '+7 (495) 663-86-02',
    rating: 4.7,
  },
  {
    id: 'perekrestok-1',
    name: 'Перекрёсток',
    logo: '🛒',
    color: 'bg-green-600',
    address: 'ул. Арбат, 21',
    distance: '1.2 км',
    distanceMeters: 1200,
    lat: 55.7520,
    lng: 37.6120,
    workingHours: '08:00 - 23:00',
    phone: '+7 (800) 200-95-55',
    rating: 4.5,
  },
  {
    id: 'lenta-1',
    name: 'Лента',
    logo: '🎀',
    color: 'bg-blue-600',
    address: 'Волгоградский пр., 125',
    distance: '2.5 км',
    distanceMeters: 2500,
    lat: 55.7480,
    lng: 37.6300,
    workingHours: '08:00 - 23:00',
    phone: '+7 (800) 700-41-11',
    rating: 4.3,
  },
  {
    id: 'auchan-1',
    name: 'Ашан',
    logo: '🏬',
    color: 'bg-red-700',
    address: 'ТЦ "Авиапарк", Ходынский бульвар, 4',
    distance: '3.8 км',
    distanceMeters: 3800,
    lat: 55.7620,
    lng: 37.5900,
    workingHours: '08:00 - 23:00',
    phone: '+7 (495) 933-23-23',
    rating: 4.2,
  },
];

export default function NearestStoresPage() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(14);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [userLocation] = useState({ lat: 55.7558, lng: 37.6173 });
  const mapRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 10));

  const sortedStores = [...mockStoreLocations].sort((a, b) => a.distanceMeters - b.distanceMeters);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Ближайшие магазины</h1>
          <div className="w-10" />
        </div>
      </header>

      <Breadcrumbs />

      {/* Map Container */}
      <div className="relative h-64 bg-muted" ref={mapRef}>
        {/* Simplified map visualization */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20">
          {/* Grid lines for map effect */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: `${20 + zoom * 2}px ${20 + zoom * 2}px`
          }} />
          
          {/* User location marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute -inset-2 rounded-full bg-blue-500/20 animate-ping" />
            </div>
          </div>

          {/* Store markers */}
          {sortedStores.map((store, index) => {
            // Calculate position based on distance (simplified)
            const angle = (index * 60) * (Math.PI / 180);
            const distance = (store.distanceMeters / 500) * (zoom - 10) * 8;
            const x = 50 + Math.cos(angle) * distance;
            const y = 50 + Math.sin(angle) * distance;
            
            return (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`absolute z-10 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${
                  selectedStore?.id === store.id ? 'scale-125' : ''
                }`}
                style={{ left: `${Math.min(Math.max(x, 10), 90)}%`, top: `${Math.min(Math.max(y, 10), 90)}%` }}
              >
                <div className={`w-10 h-10 rounded-full ${store.color} flex items-center justify-center text-lg shadow-lg border-2 border-white`}>
                  {store.logo}
                </div>
              </button>
            );
          })}
        </div>

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          <Button variant="secondary" size="icon" onClick={handleZoomIn} className="h-9 w-9 shadow-md">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut} className="h-9 w-9 shadow-md">
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute left-3 bottom-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          Масштаб: {zoom}x
        </div>
      </div>

      {/* Selected Store Card */}
      {selectedStore && (
        <div className="px-4 py-3 bg-primary/5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${selectedStore.color} flex items-center justify-center text-2xl`}>
              {selectedStore.logo}
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{selectedStore.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedStore.address}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Navigation className="h-3 w-3" />
                  {selectedStore.distance}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {selectedStore.rating}
                </span>
              </div>
            </div>
            <Link to={`/store/${selectedStore.id.split('-')[0]}`}>
              <Button size="sm">Подробнее</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Store List */}
      <div className="px-4 py-4">
        <h2 className="font-bold text-lg mb-3">Магазины поблизости</h2>
        <div className="space-y-3">
          {sortedStores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className={`w-full text-left bg-card rounded-xl p-4 border transition-colors ${
                selectedStore?.id === store.id 
                  ? 'border-primary shadow-md' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${store.color} flex items-center justify-center text-2xl`}>
                  {store.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{store.name}</h3>
                    <span className="text-sm font-medium text-primary">{store.distance}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{store.address}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {store.workingHours}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {store.rating}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-6">
        <div className="bg-muted rounded-xl p-4">
          <h3 className="font-semibold mb-2">Условные обозначения</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border border-white" />
              <span>Ваше местоположение</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-xs">🏪</div>
              <span>Магазин</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
