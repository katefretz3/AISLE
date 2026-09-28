import type {Preferences} from '../catalog';
import {chainFor} from './registry';
import {USER_AGENT} from './net';
import {cityLocation} from '../locations';
export type GroceryPlace = {
  id: string;
  name: string;
  chainId: string | null;
  lat: number;
  lng: number;
  address: string;
  url: string;
  brand?: string;
  website?: string;
};
export type PlaceResult = {
  places: GroceryPlace[];
  checkedAt: string;
  status: 'ready' | 'unavailable';
  message: string;
};
export function distanceKm(a: {lat: number; lng: number}, b: {lat: number; lng: number}) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad,
    dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function placeArea(prefs: Preferences) {
  const point = prefs.searchLocation ?? cityLocation(prefs.city);
  return {lat: Math.round(point.lat * 20) / 20, lng: Math.round(point.lng * 20) / 20};
}
export function nearbyPlaces(result: PlaceResult, prefs: Preferences) {
  const origin = prefs.searchLocation ?? cityLocation(prefs.city);
  return result.places
    .map(place => ({
      ...place,
      km: distanceKm(origin, place),
      preferred: !!place.chainId && prefs.preferredStores.includes(place.chainId),
    }))
    .filter(p => p.km <= prefs.radius)
    .sort((a, b) =>
      prefs.priority === 'convenience'
        ? a.km - b.km
        : Number(b.preferred) - Number(a.preferred) || a.km - b.km,
    );
}
export type PlaceFetcher = (query: string) => Promise<unknown>;
export type OverpassPost = (url: string, body: string) => Promise<{status: number; text: string}>;

/**
 * Public Overpass instances, tried in order. One instance being down, rate
 * limiting or timing out used to mean "no shops near you"; now the next one is
 * asked. All serve the same OpenStreetMap data.
 */
export const OVERPASS_ENDPOINTS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const MAX_DIRECTORY_BYTES = 2_000_000;

export function overpassReader(
  post: OverpassPost,
  endpoints: string[] = OVERPASS_ENDPOINTS,
): PlaceFetcher {
  return async query => {
    const body = new URLSearchParams({data: query}).toString();
    let last = 'No store directory answered';
    for (const url of endpoints) {
      try {
        const r = await post(url, body);
        if (r.status === 400) throw new Error('The store directory rejected the query');
        if (r.status !== 200) {
          last = `Store directory returned HTTP ${r.status}`;
          continue;
        }
        if (r.text.length > MAX_DIRECTORY_BYTES) {
          last = 'Store directory response too large';
          continue;
        }
        const parsed = JSON.parse(r.text) as {remark?: string};
        // A server-side timeout still answers 200, with a remark and partial data.
        if (!parsed || parsed.remark) {
          last = 'Store directory returned incomplete results';
          continue;
        }
        return parsed;
      } catch (e) {
        // A malformed query fails the same way everywhere; stop there.
        if (e instanceof Error && /rejected the query/.test(e.message)) throw e;
        last = e instanceof Error ? e.message : 'Store directory unreachable';
      }
    }
    throw new Error(last);
  };
}

/** Browser transport. Native builds pass CapacitorHttp instead (agent-client). */
const fetchPost: OverpassPost = async (url, body) => {
  const r = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT},
    body,
    signal: AbortSignal.timeout(20000),
  });
  return {status: r.status, text: await r.text()};
};
const readPlaces = overpassReader(fetchPost);

export async function collectPlaces(
  area: {lat: number; lng: number},
  read: PlaceFetcher = readPlaces,
): Promise<PlaceResult> {
  try {
    // Coarse area only: no household identity, exact pin, dietary data or basket
    // leaves the app. A 29-km fetch covers any supported 25-km radius in this cell.
    const query = `[out:json][timeout:15];nwr["shop"~"^(supermarket|grocery)$"](around:29000,${area.lat},${area.lng});out center tags 400;`;
    const body = (await read(query)) as {
      remark?: string;
      elements?: {
        type: string;
        id: number;
        lat?: number;
        lon?: number;
        center?: {lat: number; lon: number};
        tags?: Record<string, string>;
      }[];
    };
    if (!body || body.remark) throw new Error('Store directory returned incomplete results');
    if (!Array.isArray(body.elements)) throw new Error('Store directory format changed');
    const places = body.elements.slice(0, 400).flatMap(e => {
      const tags = e.tags ?? {},
        name = tags.name ?? tags.brand,
        lat = e.lat ?? e.center?.lat,
        lng = e.lon ?? e.center?.lon;
      if (
        !name ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        !['node', 'way', 'relation'].includes(e.type) ||
        !Number.isFinite(e.id)
      )
        return [];
      const match = chainFor(name, tags.brand ?? '');
      // `website` is retained so feed discovery has a real, mapped address to probe
      // rather than a domain guessed from the store's name.
      const website = tags.website ?? tags['brand:website'] ?? tags['contact:website'];
      return [
        {
          id: `${e.type}/${e.id}`,
          name: name.slice(0, 160),
          chainId: match?.id ?? null,
          lat: lat!,
          lng: lng!,
          address: [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']]
            .filter(Boolean)
            .join(' ')
            .slice(0, 240),
          url: `https://www.openstreetmap.org/${e.type}/${e.id}`,
          brand: tags.brand?.slice(0, 120),
          website: typeof website === 'string' ? website.slice(0, 300) : undefined,
        },
      ];
    });
    return {
      places: [
        ...new Map(
          places.map(p => [`${p.name.toLowerCase()}:${p.lat.toFixed(3)}:${p.lng.toFixed(3)}`, p]),
        ).values(),
      ],
      checkedAt: new Date().toISOString(),
      status: 'ready',
      message:
        'OpenStreetMap directory; coverage and opening hours may be incomplete. Distances are straight-line, not driving routes.',
    };
  } catch (e) {
    console.warn(
      'Nearby store source unavailable',
      e instanceof Error ? e.message : 'Unknown error',
    );
    return {
      places: [],
      checkedAt: new Date().toISOString(),
      status: 'unavailable',
      message:
        'The map directory could not be reached. Try again later; your saved location is unchanged.',
    };
  }
}
