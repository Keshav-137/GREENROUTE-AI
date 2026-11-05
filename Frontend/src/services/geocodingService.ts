import { LocationItem } from '@/types';
import { COMMON_LOCATIONS } from '@/utils/constants';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
}

export async function searchLocations(query: string): Promise<LocationItem[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  // Filter local standard locations first for lightning-fast matching
  const queryLower = trimmed.toLowerCase();
  const localMatches: LocationItem[] = COMMON_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(queryLower) ||
      (loc.address && loc.address.toLowerCase().includes(queryLower))
  );

  // If local matches exist or offline/demo, prioritize them
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed
    )}&countrycodes=in&limit=5&addressdetails=1`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: NominatimResult[] = await response.json();
      const apiResults: LocationItem[] = data.map((item) => ({
        name: item.name || item.display_name.split(',')[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));

      // Combine local and remote results without duplicates
      const combined = [...localMatches];
      for (const res of apiResults) {
        if (!combined.some((c) => Math.abs(c.lat - res.lat) < 0.001 && Math.abs(c.lon - res.lon) < 0.001)) {
          combined.push(res);
        }
      }
      return combined.slice(0, 6);
    }
  } catch {
    // If network fails (e.g., sandbox or offline or rate-limit), return curated locations matching query or top defaults
    if (localMatches.length > 0) {
      return localMatches;
    }
  }

  return localMatches.length > 0 ? localMatches : COMMON_LOCATIONS.slice(0, 4);
}

