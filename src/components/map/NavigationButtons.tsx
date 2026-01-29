import { Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  lat: number;
  lng: number;
  address?: string;
  className?: string;
}

export function NavigationButtons({ lat, lng, address, className = '' }: NavigationButtonsProps) {
  const encodedAddress = encodeURIComponent(address || `${lat},${lng}`);
  
  const openYandexMaps = () => {
    // Yandex Maps with route from current location to destination
    const url = `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`;
    window.open(url, '_blank');
  };

  const openGoogleMaps = () => {
    // Google Maps with directions to destination
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const open2GIS = () => {
    // 2GIS with route
    const url = `https://2gis.ru/routeSearch/to/${lng},${lat}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={openYandexMaps}
        className="flex items-center gap-2"
      >
        <Navigation className="h-4 w-4" />
        Яндекс.Карты
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={openGoogleMaps}
        className="flex items-center gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        Google Maps
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={open2GIS}
        className="flex items-center gap-2"
      >
        <Navigation className="h-4 w-4" />
        2ГИС
      </Button>
    </div>
  );
}
