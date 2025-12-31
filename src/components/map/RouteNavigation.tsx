import { useState, useMemo } from 'react';
import { Navigation, Footprints, Car, ChevronLeft, ChevronRight, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculateDistance, calculateWalkingTime } from '@/services/nominatimService';

interface RouteStep {
  storeId: string;
  storeName: string;
  storeLogo: string;
  storeColor: string;
  lat: number;
  lng: number;
  distance: number;
  walkingTime: number;
  drivingTime: number;
  products?: { name: string; price: number; quantity: number }[];
  totalPrice?: number;
}

interface RouteNavigationProps {
  userLocation: { lat: number; lng: number };
  stores: {
    store: { id: string; name: string; logo: string; color: string };
    lat: number;
    lng: number;
    products?: { name: string; price: number; quantity: number }[];
    totalPrice?: number;
  }[];
  transportMode: 'walking' | 'driving';
  onTransportModeChange: (mode: 'walking' | 'driving') => void;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onStoreClick?: (storeId: string) => void;
}

export function RouteNavigation({
  userLocation,
  stores,
  transportMode,
  onTransportModeChange,
  currentStepIndex,
  onStepChange,
  onStoreClick,
}: RouteNavigationProps) {
  // Calculate route steps with distances
  const routeSteps = useMemo<RouteStep[]>(() => {
    return stores.map((store, index) => {
      const prevLocation = index === 0 ? userLocation : stores[index - 1];
      const distance = calculateDistance(prevLocation.lat, prevLocation.lng, store.lat, store.lng);
      const walkingTime = calculateWalkingTime(distance);
      const drivingTime = Math.max(1, Math.round(walkingTime / 4)); // ~4x faster by car
      
      return {
        storeId: store.store.id,
        storeName: store.store.name,
        storeLogo: store.store.logo,
        storeColor: store.store.color,
        lat: store.lat,
        lng: store.lng,
        distance,
        walkingTime,
        drivingTime,
        products: store.products,
        totalPrice: store.totalPrice,
      };
    });
  }, [stores, userLocation]);

  const totalDistance = useMemo(() => 
    routeSteps.reduce((sum, step) => sum + step.distance, 0)
  , [routeSteps]);

  const totalTime = useMemo(() => 
    routeSteps.reduce((sum, step) => 
      sum + (transportMode === 'walking' ? step.walkingTime : step.drivingTime), 0
    )
  , [routeSteps, transportMode]);

  const currentStep = routeSteps[currentStepIndex];
  const hasNext = currentStepIndex < routeSteps.length - 1;
  const hasPrev = currentStepIndex > 0;

  if (routeSteps.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Transport Mode Toggle */}
      <div className="flex items-center justify-between bg-muted rounded-xl p-2">
        <Button
          variant={transportMode === 'walking' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => onTransportModeChange('walking')}
        >
          <Footprints className="h-4 w-4 mr-2" />
          Пешком
        </Button>
        <Button
          variant={transportMode === 'driving' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => onTransportModeChange('driving')}
        >
          <Car className="h-4 w-4 mr-2" />
          На машине
        </Button>
      </div>

      {/* Route Summary */}
      <div className="bg-primary/10 rounded-xl p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="font-medium">{totalDistance.toFixed(1)} км</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">~{totalTime} мин</span>
            </div>
          </div>
          <Badge variant="secondary">{routeSteps.length} магазинов</Badge>
        </div>
      </div>

      {/* Current Step Card */}
      {currentStep && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {currentStepIndex + 1}
              </div>
              <span className="text-sm text-muted-foreground">
                Шаг {currentStepIndex + 1} из {routeSteps.length}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {transportMode === 'walking' ? (
                <>
                  <Footprints className="h-3 w-3 mr-1" />
                  {currentStep.walkingTime} мин
                </>
              ) : (
                <>
                  <Car className="h-3 w-3 mr-1" />
                  {currentStep.drivingTime} мин
                </>
              )}
            </Badge>
          </div>

          {/* Direction */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {currentStepIndex === 0 ? (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>Ваше местоположение</span>
                </>
              ) : (
                <>
                  <div className={`w-5 h-5 rounded-md ${routeSteps[currentStepIndex - 1].storeColor} flex items-center justify-center text-xs`}>
                    {routeSteps[currentStepIndex - 1].storeLogo}
                  </div>
                  <span>{routeSteps[currentStepIndex - 1].storeName}</span>
                </>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-md ${currentStep.storeColor} flex items-center justify-center text-xs`}>
                {currentStep.storeLogo}
              </div>
              <span className="font-medium">{currentStep.storeName}</span>
            </div>
          </div>

          {/* Distance info */}
          <div className="text-sm text-muted-foreground mb-3">
            <Navigation className="inline h-3 w-3 mr-1" />
            {currentStep.distance.toFixed(2)} км от предыдущей точки
          </div>

          {/* Store products preview */}
          {currentStep.products && currentStep.products.length > 0 && (
            <button 
              className="w-full text-left bg-muted rounded-lg p-3"
              onClick={() => onStoreClick?.(currentStep.storeId)}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentStep.products.length} товаров
                </span>
                <span className="text-sm font-bold text-primary">
                  {currentStep.totalPrice?.toFixed(0)}₽
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {currentStep.products.slice(0, 3).map(p => p.name).join(', ')}
                {currentStep.products.length > 3 && '...'}
              </div>
            </button>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev}
              onClick={() => onStepChange(currentStepIndex - 1)}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад
            </Button>
            <Button
              variant={hasNext ? 'default' : 'outline'}
              size="sm"
              disabled={!hasNext}
              onClick={() => onStepChange(currentStepIndex + 1)}
              className="flex-1"
            >
              Далее
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Mini step indicators */}
      <div className="flex items-center justify-center gap-1">
        {routeSteps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentStepIndex 
                ? 'bg-primary' 
                : index < currentStepIndex 
                  ? 'bg-primary/50' 
                  : 'bg-muted-foreground/30'
            }`}
            onClick={() => onStepChange(index)}
          />
        ))}
      </div>
    </div>
  );
}
