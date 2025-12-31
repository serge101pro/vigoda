import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  products?: { name: string; quantity: number }[];
}

interface ProximityNotificationOptions {
  enabled: boolean;
  radiusMeters: number;
  stores: Store[];
}

// Haversine formula to calculate distance between two points
function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useProximityNotifications({ enabled, radiusMeters, stores }: ProximityNotificationOptions) {
  const [notifiedStores, setNotifiedStores] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Ваш браузер не поддерживает уведомления');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermissionGranted(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      if (!granted) {
        toast.error('Разрешите уведомления для получения напоминаний о магазинах');
      }
      return granted;
    }

    toast.error('Уведомления заблокированы. Разрешите их в настройках браузера');
    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((store: Store) => {
    if (!permissionGranted && Notification.permission !== 'granted') return;

    const productList = store.products?.slice(0, 3).map(p => 
      `${p.name} (${p.quantity})`
    ).join(', ') || '';

    const body = store.products?.length
      ? `Купить: ${productList}${store.products.length > 3 ? '...' : ''}`
      : 'Вы близко к магазину из вашего списка покупок';

    // Create browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`📍 ${store.name} рядом!`, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: `store-${store.id}`,
        requireInteraction: false,
        silent: false,
      });
    }

    // Also show in-app toast
    toast.info(`📍 ${store.name} рядом!`, {
      description: body,
      duration: 8000,
      action: {
        label: 'Показать',
        onClick: () => {
          // Could navigate to store or show details
          console.log('Navigate to store:', store.id);
        },
      },
    });
  }, [permissionGranted]);

  // Check proximity to stores
  const checkProximity = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ lat: latitude, lng: longitude });

    stores.forEach(store => {
      if (notifiedStores.has(store.id)) return;

      const distance = calculateDistanceMeters(latitude, longitude, store.lat, store.lng);
      
      if (distance <= radiusMeters) {
        showNotification(store);
        setNotifiedStores(prev => new Set([...prev, store.id]));
      }
    });
  }, [stores, radiusMeters, notifiedStores, showNotification]);

  // Start watching position
  useEffect(() => {
    if (!enabled || stores.length === 0) return;

    if (!navigator.geolocation) {
      toast.error('Геолокация не поддерживается вашим браузером');
      return;
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      checkProximity,
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Разрешите доступ к геолокации для уведомлений о магазинах');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000, // Use cached position up to 30 seconds old
        timeout: 60000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, stores, checkProximity]);

  // Reset notified stores when stores list changes
  useEffect(() => {
    setNotifiedStores(new Set());
  }, [stores.length]);

  return {
    userLocation,
    notifiedStores,
    permissionGranted,
    requestPermission,
    resetNotifications: () => setNotifiedStores(new Set()),
  };
}
