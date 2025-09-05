import { supabase } from '@/integrations/supabase/client';

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

/**
 * Get city coordinates from cache or geocode using external API
 * @param cityName Name of the city
 * @returns Coordinates or null if not found
 */
export async function geocodeCity(cityName: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // First, try to get from cache
    const { data: cachedCoords, error: cacheError } = await supabase
      .rpc('get_or_cache_city_coordinates', { city_name_param: cityName });
    
    if (!cacheError && cachedCoords && cachedCoords.length > 0) {
      const coords = cachedCoords[0];
      return {
        lat: parseFloat(coords.latitude.toString()),
        lon: parseFloat(coords.longitude.toString())
      };
    }

    // If not in cache, geocode using external API
    console.log(`Geocoding ${cityName} using external API...`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
      
      // Cache the result for future use
      await supabase.rpc('cache_city_coordinates', {
        city_name_param: cityName,
        lat_param: result.lat,
        lon_param: result.lon
      });
      
      return result;
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Calculate distance between two cities with caching
 * @param cityA First city name
 * @param cityB Second city name
 * @returns Distance in kilometers or null if calculation fails
 */
export async function calculateCachedDistance(cityA: string, cityB: string): Promise<number | null> {
  try {
    // First, check if distance is already cached
    const { data: cachedDistance, error: cacheError } = await supabase
      .rpc('get_cached_distance', { city_a_param: cityA, city_b_param: cityB });
    
    if (!cacheError && cachedDistance !== null && cachedDistance !== undefined) {
      const distance = typeof cachedDistance === 'number' ? cachedDistance : Number(cachedDistance);
      return isNaN(distance) ? null : distance;
    }

    // If not cached, calculate distance
    const [coordsA, coordsB] = await Promise.all([
      geocodeCity(cityA),
      geocodeCity(cityB)
    ]);

    if (!coordsA || !coordsB) {
      return null;
    }

    const distance = calculateHaversineDistance(
      coordsA.lat,
      coordsA.lon,
      coordsB.lat,
      coordsB.lon
    );

    // Cache the calculated distance
    await supabase.rpc('cache_distance', {
      city_a_param: cityA,
      city_b_param: cityB,
      distance_param: distance
    });

    return distance;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return null;
  }
}

/**
 * Batch calculate distances for multiple professionals from a company location
 * @param companyCity Company's city
 * @param professionalCities Array of professional city names
 * @returns Array of distances in the same order as input cities
 */
export async function batchCalculateDistances(
  companyCity: string,
  professionalCities: string[]
): Promise<(number | null)[]> {
  const uniqueCities = [...new Set([companyCity, ...professionalCities])];
  
  // Get all coordinates in batch
  const coordinatesMap = new Map<string, { lat: number; lon: number }>();
  
  // First try to get all from cache
  for (const city of uniqueCities) {
    const coords = await geocodeCity(city);
    if (coords) {
      coordinatesMap.set(city, coords);
    }
  }

  // Now calculate distances
  const companyCoords = coordinatesMap.get(companyCity);
  if (!companyCoords) {
    return professionalCities.map(() => null);
  }

  const distances = await Promise.all(
    professionalCities.map(async (city) => {
      if (!city) return null;
      
      try {
        // Try to get cached distance first
        const { data: cachedDistance } = await supabase
          .rpc('get_cached_distance', { city_a_param: companyCity, city_b_param: city });
        
        if (cachedDistance !== null && cachedDistance !== undefined) {
          const distance = typeof cachedDistance === 'number' ? cachedDistance : Number(cachedDistance);
          return isNaN(distance) ? null : distance;
        }

        // Calculate if not cached
        const professionalCoords = coordinatesMap.get(city);
        if (!professionalCoords) return null;

        const distance = calculateHaversineDistance(
          companyCoords.lat,
          companyCoords.lon,
          professionalCoords.lat,
          professionalCoords.lon
        );

        // Cache the result
        await supabase.rpc('cache_distance', {
          city_a_param: companyCity,
          city_b_param: city,
          distance_param: distance
        });

        return distance;
      } catch (error) {
        console.error(`Error calculating distance to ${city}:`, error);
        return null;
      }
    })
  );

  return distances;
}
