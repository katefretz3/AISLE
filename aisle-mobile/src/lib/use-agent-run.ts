'use client';
// One agent run, shared by every screen that needs it.
//
// The run used to live inside AgentWorkspace, which meant the home screen had
// verified prices and nothing else did: compare fell back to rendering the same
// component, the shopping checklist could never be started, and the budget card
// showed a dash. Owning the run here lets all of them read the same verified
// result without re-collecting, and keeps a single answer to "what does this
// basket cost" across the app.
//
// The finished run is also saved on the device and read back on the next launch
// (lib/agent/saved-run.ts has the rules), so opening the app does not mean
// collecting every catalogue again. It is only reused for the same search area,
// and never for more than 24 hours; offers drop out as they expire.
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {runAgent, basketsFrom, buildShopperModel, type AgentRun, type Basket} from '@/lib/agent';
import {
  nextExpiry,
  regateRun,
  restoreRun,
  runAreaKey,
  runExpiresAt,
  serializeRun,
} from '@/lib/agent/saved-run';
import type {UserState} from '@/lib/catalog';
import {deleteLastRun, loadLastRun, saveLastRun} from '@/lib/persistence';

/** setTimeout's ceiling; longer delays fire immediately. */
const MAX_TIMER_MS = 2_147_483_647;

export type AgentSession = {
  run: AgentRun | null;
  busy: boolean;
  error: string;
  /** Verified baskets, re-totalled locally whenever a match is confirmed. */
  baskets: Basket[];
  /** The cheapest complete basket, or the best-covered one if none is complete. */
  best: Basket | null;
  perShopBudget: number;
  /** Retailers whose catalogue was actually readable on this run. */
  readable: number;
  start: () => void;
  /** Drop the run from memory and from the device. */
  forget: () => void;
  basketFor: (sourceId: string | null) => Basket | null;
};

export function useAgentRun(state: UserState, ready: boolean): AgentSession {
  const [saved, setSaved] = useState<{run: AgentRun; area: string} | null>(null);
  const [restored, setRestored] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [clock, setClock] = useState(() => Date.now());
  const alive = useRef(true),
    inFlight = useRef(false),
    // Bumped by forget(), so a run that was in flight during an erase is
    // neither shown nor saved when it lands.
    generation = useRef(0);
  // Read through a ref so `start` can stay stable: a run is a point-in-time
  // snapshot and must not restart every time someone edits a quantity.
  const latest = useRef(state);
  latest.current = state;
  const area = runAreaKey(state.prefs);

  // A run for another search area, or one past its 24 hours, is not shown.
  // Offers inside a current run are re-gated as the clock moves.
  const run = useMemo(() => {
    if (!saved || saved.area !== area) return null;
    if (!(runExpiresAt(saved.run) > clock)) return null;
    return regateRun(saved.run, clock);
  }, [saved, area, clock]);

  const start = useCallback(() => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    void (async () => {
      try {
        const forArea = runAreaKey(latest.current.prefs);
        const gen = generation.current;
        const result = await runAgent({state: latest.current});
        if (gen !== generation.current) return;
        if (alive.current) {
          setSaved({run: result, area: forArea});
          setClock(Date.now());
        }
        void saveLastRun(serializeRun(result, forArea));
      } catch (e) {
        if (alive.current)
          setError(e instanceof Error ? e.message : 'The price check could not be completed.');
      } finally {
        inFlight.current = false;
        if (alive.current) setBusy(false);
      }
    })();
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  // Read the last run back once, before anything decides to collect afresh.
  useEffect(() => {
    if (!ready || restored) return;
    let cancelled = false;
    void (async () => {
      const now = Date.now();
      const areaNow = runAreaKey(latest.current.prefs);
      const back = restoreRun(await loadLastRun(), areaNow, now);
      if (cancelled) return;
      if (back) {
        setSaved({run: back, area: areaNow});
        setClock(now);
      } else void deleteLastRun();
      setRestored(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, restored]);

  // Wake when the next offer, or the run itself, expires.
  useEffect(() => {
    if (!saved) return;
    const at = nextExpiry(saved.run, clock);
    if (!Number.isFinite(at)) return;
    const timer = setTimeout(
      () => setClock(Date.now()),
      Math.min(MAX_TIMER_MS, Math.max(0, at - Date.now()) + 1000),
    );
    return () => clearTimeout(timer);
  }, [saved, clock]);

  // A saved run past its 24 hours is deleted, not just hidden.
  useEffect(() => {
    if (saved && !(runExpiresAt(saved.run) > clock)) void deleteLastRun();
  }, [saved, clock]);

  useEffect(() => {
    if (ready && restored && !run && !busy && !error) start();
  }, [ready, restored, run, busy, error, start]);

  const perShopBudget = useMemo(() => buildShopperModel(state).perShopBudget, [state]);

  // Re-total locally when a match is confirmed or withdrawn: no network, no
  // re-collection, and no chance of a shown figure drifting from its evidence.
  const baskets = useMemo<Basket[]>(() => {
    if (!run) return [];
    return basketsFrom({
      state,
      perShopBudget,
      sources: run.sources.map(s => ({
        chainId: s.chainId,
        origin: s.origin,
        name: s.name,
        status: s.status,
      })),
      offers: run.offers,
      proposals: new Map(run.proposals.map(p => [`${p.itemId}::${p.sourceId}`, p])),
      unmatched: new Map(run.unmatched.map(u => [u.itemId, {kind: u.kind, detail: u.reason}])),
    });
  }, [run, state, perShopBudget]);

  // A complete basket always beats a partial one; an incomplete basket is never
  // presented as the cheapest, only as the best-covered.
  const best = useMemo(() => {
    if (!baskets.length) return null;
    const complete = baskets.filter(b => b.complete);
    return (complete.length ? complete : baskets)[0] ?? null;
  }, [baskets]);

  const basketFor = useCallback(
    (sourceId: string | null) =>
      sourceId ? (baskets.find(b => b.sourceId === sourceId) ?? null) : null,
    [baskets],
  );

  const forget = useCallback(() => {
    generation.current += 1;
    setSaved(null);
    void deleteLastRun();
  }, []);

  return {
    run,
    busy,
    error,
    baskets,
    best,
    perShopBudget,
    readable: run ? run.sources.filter(s => s.status === 'ready').length : 0,
    start,
    forget,
    basketFor,
  };
}
