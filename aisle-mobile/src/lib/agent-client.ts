// The store directory (OpenStreetMap shops near the household), cached on the
// device for a day so every price check does not ask Overpass again.
//
// One file, for one search area. A different area replaces it; an expired one
// is deleted before a new lookup; "Erase everything" deletes it.
import {Capacitor, CapacitorHttp} from '@capacitor/core';
import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';
import {collectPlaces, overpassReader, type OverpassPost, type PlaceResult} from './agent/places';
import {USER_AGENT} from './agent/net';

const directory = Directory.Data;
const CACHE = 'aisle/places.json';
const READY_MS = 24 * 3600_000;
/** A failed lookup is remembered briefly so a flapping mirror is not hammered. */
const FAILED_MS = 5 * 60_000;

type Cached = {area: string; result: PlaceResult};

const nativePost: OverpassPost = async (url, body) => {
  const r = await CapacitorHttp.post({
    url,
    headers: {'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT},
    data: body,
    responseType: 'text',
    connectTimeout: 12000,
    readTimeout: 20000,
  });
  return {status: r.status, text: typeof r.data === 'string' ? r.data : JSON.stringify(r.data)};
};

export function cacheIsFresh(result: PlaceResult, now = Date.now()) {
  const age = now - Date.parse(result.checkedAt);
  return age >= 0 && age < (result.status === 'ready' ? READY_MS : FAILED_MS);
}

async function readCache(): Promise<Cached | null> {
  try {
    const r = await Filesystem.readFile({path: CACHE, directory, encoding: Encoding.UTF8});
    const parsed = JSON.parse(typeof r.data === 'string' ? r.data : await r.data.text());
    return parsed && typeof parsed.area === 'string' && parsed.result ? parsed : null;
  } catch {
    return null;
  }
}

export async function loadPlaces(area: {lat: number; lng: number}): Promise<PlaceResult> {
  const key = `${area.lat},${area.lng}`;
  const old = await readCache();
  if (old && old.area === key && cacheIsFresh(old.result)) return old.result;
  if (old) await deletePlacesCache();
  const next = await collectPlaces(
    area,
    Capacitor.isNativePlatform() ? overpassReader(nativePost) : undefined,
  );
  try {
    await Filesystem.writeFile({
      path: CACHE,
      directory,
      encoding: Encoding.UTF8,
      data: JSON.stringify({area: key, result: next} satisfies Cached),
      recursive: true,
    });
  } catch {
    /* Not cached means looked up again next time, nothing worse. */
  }
  return next;
}

/** The directory cache, plus the per-area files and the sample-market cache
 *  that earlier versions wrote and never removed. */
export async function deletePlacesCache(): Promise<void> {
  const doomed = [CACHE];
  try {
    const {files} = await Filesystem.readdir({path: 'aisle', directory});
    for (const f of files) {
      const name = typeof f === 'string' ? f : f.name;
      if (/^places-.*\.json$/.test(name) || name === 'market.json') doomed.push(`aisle/${name}`);
    }
  } catch {
    /* no folder yet */
  }
  await Promise.all(
    doomed.map(path => Filesystem.deleteFile({path, directory}).catch(() => undefined)),
  );
}
