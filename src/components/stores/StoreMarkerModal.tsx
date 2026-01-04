import { Star, Clock, MapPin, Heart, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

interface StoreMarkerModalProps {
  store: {
    id: string;
    name: string;
    logo: string;
    color: string;
    address: string;
    workingHours: string;
    phone?: string;
    rating: number;
    distance?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function StoreMarkerModal({
  store,
  isOpen,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}: StoreMarkerModalProps) {
  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${store.color} flex items-center justify-center text-2xl`}>
              {store.logo}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-lg">{store.name}</h3>
              {store.distance && (
                <p className="text-sm text-muted-foreground font-normal">{store.distance}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Адрес</p>
              <p className="text-sm text-muted-foreground">{store.address}</p>
            </div>
          </div>

          {/* Working hours */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Время работы</p>
              <p className="text-sm text-muted-foreground">{store.workingHours}</p>
            </div>
          </div>

          {/* Phone */}
          {store.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Телефон</p>
                <a href={`tel:${store.phone}`} className="text-sm text-primary hover:underline">
                  {store.phone}
                </a>
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{store.rating}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant={isFavorite ? "default" : "outline"}
              className="flex-1"
              onClick={onToggleFavorite}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'В избранном' : 'В избранное'}
            </Button>
            <Link to={`/store/${store.id.split('-')[0]}`} className="flex-1">
              <Button className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Подробнее
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
