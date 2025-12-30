// Nominatim API service for geocoding
// https://nominatim.org/release-docs/latest/api/Overview/

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

interface NominatimReverseResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
}

// Search for address by text query
export async function searchAddress(query: string, limit: number = 5): Promise<GeocodingResult[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      'accept-language': 'ru',
      countrycodes: 'ru', // Limit to Russia
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'VigodaApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Nominatim search failed');
    }

    const results: NominatimSearchResult[] = await response.json();

    return results.map((result) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address ? {
        street: [result.address.road, result.address.house_number].filter(Boolean).join(', '),
        city: result.address.city || result.address.state,
        country: result.address.country,
      } : undefined,
    }));
  } catch (error) {
    console.error('Nominatim search error:', error);
    return [];
  }
}

// Reverse geocoding - get address from coordinates
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'ru',
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'VigodaApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Nominatim reverse geocoding failed');
    }

    const result: NominatimReverseResult = await response.json();

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      address: {
        street: [result.address.road, result.address.house_number].filter(Boolean).join(', '),
        city: result.address.city || result.address.state,
        country: result.address.country,
      },
    };
  } catch (error) {
    console.error('Nominatim reverse geocoding error:', error);
    return null;
  }
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Calculate estimated walking time (minutes)
export function calculateWalkingTime(distanceKm: number): number {
  const walkingSpeedKmH = 5; // Average walking speed
  return Math.round((distanceKm / walkingSpeedKmH) * 60);
}

// Calculate optimal route using nearest neighbor algorithm
export function calculateOptimalRoute(
  start: { lat: number; lng: number },
  points: { lat: number; lng: number; id: string }[]
): { route: typeof points; totalDistance: number; totalTime: number } {
  if (points.length === 0) {
    return { route: [], totalDistance: 0, totalTime: 0 };
  }

  const visited: Set<string> = new Set();
  const route: typeof points = [];
  let current = start;
  let totalDistance = 0;

  while (route.length < points.length) {
    let nearestPoint = null;
    let nearestDistance = Infinity;

    for (const point of points) {
      if (visited.has(point.id)) continue;
      
      const distance = calculateDistance(current.lat, current.lng, point.lat, point.lng);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPoint = point;
      }
    }

    if (nearestPoint) {
      visited.add(nearestPoint.id);
      route.push(nearestPoint);
      totalDistance += nearestDistance;
      current = nearestPoint;
    }
  }

  const totalTime = calculateWalkingTime(totalDistance);

  return { route, totalDistance, totalTime };
}
