import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Phone, Clock, Star, Loader2, MapPin, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { VigodaMap } from '@/components/map/VigodaMap';
import { StoreFilters, StoreType, isStoreOpen, getClosingHour, getStoreType } from '@/components/stores/StoreFilters';
import { useProximityNotifications } from '@/hooks/useProximityNotifications';
import { toast } from 'sonner';

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
  type: StoreType;
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
    lat: 55.7588,
    lng: 37.6203,
    workingHours: '08:00 - 23:00',
    phone: '+7 (800) 555-55-05',
    rating: 4.2,
    type: 'grocery',
  },
  {
    id: 'magnit-1',
    name: 'Магнит',
    logo: '🧲',
    color: 'bg-red-600',
    address: 'пр. Мира, 42',
    distance: '520 м',
    distanceMeters: 520,
    lat: 55.7530,
    lng: 37.6145,
    workingHours: '08:00 - 22:00',
    phone: '+7 (800) 200-90-02',
    rating: 4.1,
    type: 'grocery',
  },
  {
    id: 'vkusvill-1',
    name: 'ВкусВилл',
    logo: '🌿',
    color: 'bg-green-500',
    address: 'ул. Тверская, 7',
    distance: '780 м',
    distanceMeters: 780,
    lat: 55.7575,
    lng: 37.6100,
    workingHours: '08:00 - 22:00',
    phone: '+7 (495) 663-86-02',
    rating: 4.7,
    type: 'farm',
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
    lng: 37.6250,
    workingHours: '08:00 - 23:00',
    phone: '+7 (800) 200-95-55',
    rating: 4.5,
    type: 'grocery',
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
    type: 'hypermarket',
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
    type: 'hypermarket',
  },
  {
    id: 'svetofor-1',
    name: 'Светофор',
    logo: '🚦',
    color: 'bg-yellow-500',
    address: 'ул. Народная, 12',
    distance: '1.8 км',
    distanceMeters: 1800,
    lat: 55.7500,
    lng: 37.6350,
    workingHours: '09:00 - 21:00',
    phone: '+7 (800) 100-10-10',
    rating: 3.9,
    type: 'discount',
  },
];

export default function NearestStoresPage() {
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [stores, setStores] = useState(mockStoreLocations);
  
  // Filters state
  const [selectedTypes, setSelectedTypes] = useState<StoreType[]>(['all']);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [openUntilHour, setOpenUntilHour] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Proximity notifications
  const proximityStores = useMemo(() => 
    stores.map(s => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng })),
    [stores]
  );
  
  const { permissionGranted, requestPermission } = useProximityNotifications({
    enabled: notificationsEnabled,
    radiusMeters: 200,
    stores: proximityStores,
  });

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast.success('Уведомления включены');
      }
    } else {
      setNotificationsEnabled(false);
      toast.info('Уведомления отключены');
    }
  };

  // Get user geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Recalculate distances based on user location
          const updatedStores = mockStoreLocations.map(store => {
            const distance = calculateDistance(latitude, longitude, store.lat, store.lng);
            return {
              ...store,
              distanceMeters: Math.round(distance),
              distance: distance < 1000 ? `${Math.round(distance)} м` : `${(distance / 1000).toFixed(1)} км`
            };
          });
          setStores(updatedStores);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to Moscow center
          setUserLocation({ lat: 55.7558, lng: 37.6173 });
          setIsLoadingLocation(false);
          toast.error('Не удалось определить местоположение. Используем центр Москвы.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: 55.7558, lng: 37.6173 });
      setIsLoadingLocation(false);
    }
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter stores based on selected filters
  const filteredStores = useMemo(() => {
    return stores.filter(store => {
      // Type filter
      if (!selectedTypes.includes('all') && !selectedTypes.includes(store.type)) {
        return false;
      }
      // Open now filter
      if (onlyOpenNow && !isStoreOpen(store.workingHours)) {
        return false;
      }
      // Open until filter
      if (openUntilHour !== null) {
        const closingHour = getClosingHour(store.workingHours);
        if (closingHour !== null && closingHour < openUntilHour) {
          return false;
        }
      }
      return true;
    });
  }, [stores, selectedTypes, onlyOpenNow, openUntilHour]);

  const sortedStores = [...filteredStores].sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Convert stores to map markers
  const mapMarkers = sortedStores.map(store => ({
    id: store.id,
    lat: store.lat,
    lng: store.lng,
    color: store.color,
    icon: store.logo,
    label: store.name,
    onClick: () => setSelectedStore(store)
  }));

  return (
    <div className="page-container">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-lg">Ближайшие магазины</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleNotifications}
            className={notificationsEnabled ? 'text-primary' : ''}
          >
            {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <Breadcrumbs />

      {/* Filters */}
      <div className="px-4 py-3">
        <StoreFilters
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
          onlyOpenNow={onlyOpenNow}
          onOnlyOpenNowChange={setOnlyOpenNow}
          openUntilHour={openUntilHour}
          onOpenUntilHourChange={setOpenUntilHour}
        />
      </div>

      {/* Map Container */}
      <div className="relative">
        {isLoadingLocation ? (
          <div className="h-64 bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Определяем местоположение...</span>
            </div>
          </div>
        ) : userLocation ? (
          <VigodaMap
            center={userLocation}
            zoom={14}
            markers={mapMarkers}
            userLocation={userLocation}
            style={{ width: '100%', height: '300px', borderRadius: '0' }}
            onMarkerClick={(marker) => {
              const store = stores.find(s => s.id === marker.id);
              if (store) setSelectedStore(store);
            }}
          />
        ) : null}
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
