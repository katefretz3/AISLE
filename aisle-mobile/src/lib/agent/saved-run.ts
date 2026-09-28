// The last price check, kept on the device between launches.
//
// Without this every launch started a fresh collection, and the privacy policy's
// "kept for 24 hours" described nothing. With it, a run is saved when it
// finishes and read back on the next launch, but only on these terms:
//
//   - It is thrown away 24 hours after it finished, along with the nearby-shop
//     list inside it.
//   - It is thrown away if the household's search area or radius changed, since
//     the shops and prices in it were for somewhere else.
//   - Every offer goes back through the same gate as a live one (`faultsOf`),
//     against the evidence rows saved with it. An offer that has expired since,
//     or whose evidence row is missing or malformed, is dropped, not shown.
//
// Nothing here makes a price. It can only keep or discard ones that already
// passed the gate once.
import type {Preferences} from '../catalog';
import type {AgentRun} from './orchestrator';
import {placeArea} from './places';
import {EvidenceLedger, faultsOf} from './provenance';

export const RUN_LIFETIME_MS = 24 * 3600_000;
export const STALE_NARRATIVE =
  'Some prices from this check have expired since it ran, so its summary is no longer shown. Run a price check for current prices.';
const VERSION = 1;

/** Which search the run answered. A run is only reused for the same one. */
export function runAreaKey(prefs: Preferences): string {
  const {lat, lng} = placeArea(prefs);
  return `${lat.toFixed(2)},${lng.toFixed(2)}:${prefs.radius}`;
}

export const runExpiresAt = (run: AgentRun) => Date.parse(run.finishedAt) + RUN_LIFETIME_MS;

export function serializeRun(run: AgentRun, area: string): string {
  return JSON.stringify({version: VERSION, area, run});
}

/**
 * Read a saved run back, or null when it must not be used: unreadable, from
 * another version, for another area, finished in the future, or past its 24
 * hours. Offers that no longer pass the gate are removed.
 */
export function restoreRun(raw: string | null, area: string, now: number): AgentRun | null {
  if (!raw) return null;
  let saved: {version?: unknown; area?: unknown; run?: Partial<AgentRun>};
  try {
    saved = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!saved || saved.version !== VERSION || saved.area !== area) return null;
  const run = saved.run;
  if (
    !run ||
    typeof run.finishedAt !== 'string' ||
    !Array.isArray(run.offers) ||
    !Array.isArray(run.evidence) ||
    !Array.isArray(run.sources) ||
    !Array.isArray(run.proposals) ||
    !Array.isArray(run.unmatched) ||
    !Array.isArray(run.stores)
  )
    return null;
  const finished = Date.parse(run.finishedAt);
  if (!(finished <= now + 60_000)) return null;
  if (!(finished + RUN_LIFETIME_MS > now)) return null;
  return regateRun(run as AgentRun, now);
}

/**
 * Put every offer back through the gate at `now`. Returns the same object when
 * nothing changed, so callers can memoise on identity.
 */
export function regateRun(run: AgentRun, now: number): AgentRun {
  const ledger = EvidenceLedger.fromRecord(run.evidence);
  const kept: AgentRun['offers'] = [];
  const dropped: AgentRun['rejectedOffers'] = [];
  for (const offer of run.offers) {
    const faults = faultsOf(offer, ledger, now);
    if (faults.length) dropped.push({offerId: offer.id, retailer: offer.retailer, faults});
    else kept.push(offer);
  }
  if (!dropped.length) return run;
  return {
    ...run,
    offers: kept,
    rejectedOffers: [...run.rejectedOffers, ...dropped],
    // The written summary may quote a price that has just been dropped, so it
    // is not shown once anything in it has gone.
    narrative: STALE_NARRATIVE,
  };
}

/** The next moment after `after` when something in this run stops being
 *  usable, an offer or the run itself. Infinity when nothing is left to expire. */
export function nextExpiry(run: AgentRun, after: number): number {
  let next = Infinity;
  for (const at of [runExpiresAt(run), ...run.offers.map(o => Date.parse(o.expiresAt))])
    if (at > after && at < next) next = at;
  return next;
}
