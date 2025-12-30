import Map, { NavigationControl, MapRef, Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef, useCallback } from 'react';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  color?: string;
  icon?: string;
  label?: string;
  onClick?: () => void;
}

interface RoutePoint {
  lat: number;
  lng: number;
}

interface VigodaMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MarkerData[];
  userLocation?: { lat: number; lng: number };
  route?: RoutePoint[];
  style?: React.CSSProperties;
  onMarkerClick?: (marker: MarkerData) => void;
}

export const VigodaMap = ({
  center = { lat: 55.7558, lng: 37.6173 },
  zoom = 12,
  markers = [],
  userLocation,
  route,
  style = { width: '100%', height: '400px', borderRadius: '1rem' },
  onMarkerClick,
}: VigodaMapProps) => {
  const mapRef = useRef<MapRef>(null);

  // Функция для принудительного перевода всех меток на русский
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Получаем все слои карты
    const layers = map.getStyle().layers;

    layers.forEach((layer) => {
      // Ищем слои, отвечающие за текст (символы)
      if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
        // Принудительно ставим источник данных "name:ru"
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name:ru'],
          ['get', 'name:en'],
          ['get', 'name']
        ]);
      }
    });
  }, []);

  // GeoJSON для маршрута
  const routeGeoJSON = route && route.length > 1 ? {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: route.map(p => [p.lng, p.lat])
    }
  } : null;

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: center.lng,
        latitude: center.lat,
        zoom: zoom
      }}
      style={style}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
      onLoad={onMapLoad}
    >
      <NavigationControl position="top-right" />

      {/* Маршрут */}
      {routeGeoJSON && (
        <Source id="route" type="geojson" data={routeGeoJSON}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.8
            }}
          />
        </Source>
      )}

      {/* Метка пользователя */}
      {userLocation && (
        <Marker longitude={userLocation.lng} latitude={userLocation.lat}>
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-blue-500 border-3 border-white shadow-lg animate-pulse" />
            <div className="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping" />
          </div>
        </Marker>
      )}

      {/* Маркеры магазинов */}
      {markers.map((marker, index) => (
        <Marker
          key={marker.id}
          longitude={marker.lng}
          latitude={marker.lat}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            marker.onClick?.();
            onMarkerClick?.(marker);
          }}
        >
          <div className="relative cursor-pointer transform hover:scale-110 transition-transform">
            {/* Номер в маршруте */}
            {route && route.length > 1 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center z-10 border border-white">
                {index + 1}
              </div>
            )}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white ${marker.color || 'bg-primary'}`}
            >
              {marker.icon || '📍'}
            </div>
          </div>
        </Marker>
      ))}
    </Map>
  );
};
