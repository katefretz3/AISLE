// The household's saved state: loading it, saving every change in order, and
// reporting where saving stands.
//
// Saves are chained, so two quick edits cannot land out of order, and each
// carries the revision it was based on, so a stale copy (from a second window,
// say) is refused rather than silently overwriting newer data.
import {useRef, useState} from 'react';
import {toast} from 'sonner';
import {initialState, type UserState} from '@/lib/catalog';
import {loadState, saveState, StaleRevisionError} from '@/lib/persistence';

export type Household = ReturnType<typeof useHousehold>;

export function useHousehold() {
  const [state, setState] = useState<UserState>(initialState);
  const current = useRef(state),
    revision = useRef(0),
    chain = useRef(Promise.resolve());
  const [ready, setReady] = useState(false),
    [loadError, setLoadError] = useState(false),
    [saveStatus, setSaveStatus] = useState('Saved'),
    [savingError, setSavingError] = useState('');

  function adopt(next: UserState, nextRevision: number) {
    current.current = next;
    revision.current = nextRevision;
    setState(next);
    setSaveStatus('Saved');
    setSavingError('');
  }

  /** Read the saved household. Resolves to it, or null if it could not be read. */
  async function load(): Promise<UserState | null> {
    setLoadError(false);
    try {
      const data = await loadState();
      adopt(data.state, data.revision);
      setReady(true);
      return data.state;
    } catch {
      setLoadError(true);
      return null;
    }
  }

  function persist(next: UserState) {
    setSaveStatus('Saving…');
    chain.current = chain.current.then(async () => {
      try {
        const data = await saveState(next, revision.current);
        revision.current = data.revision;
        setSaveStatus('Saved');
        setSavingError('');
      } catch (e) {
        setSaveStatus('Not saved');
        setSavingError(e instanceof Error ? e.message : 'Unable to save changes');
      }
    });
  }

  /** Apply a change now and save it in the background. */
  function commit(update: UserState | ((s: UserState) => UserState)) {
    if (!ready) {
      toast.error('Your saved list is not ready. Please retry loading.');
      return;
    }
    const next = typeof update === 'function' ? update(current.current) : update;
    current.current = next;
    setState(next);
    persist(next);
  }

  /**
   * Save a change and wait for it, after any saves already queued. If the
   * stored copy turns out to be newer, the change is rebuilt on top of that
   * copy and saved once more, so nothing stored is lost. Resolves to whether
   * that merge happened.
   */
  async function saveNow(build: (s: UserState) => UserState): Promise<{merged: boolean}> {
    await chain.current;
    setSaveStatus('Saving…');
    try {
      const next = build(current.current);
      const result = await saveState(next, revision.current);
      adopt(next, result.revision);
      return {merged: false};
    } catch (error) {
      if (!(error instanceof StaleRevisionError)) {
        setSaveStatus('Not saved');
        throw error;
      }
      const latest = await loadState();
      const next = build(latest.state);
      const result = await saveState(next, latest.revision);
      adopt(next, result.revision);
      return {merged: true};
    }
  }

  return {
    state,
    ready,
    loadError,
    saveStatus,
    savingError,
    setSavingError,
    load,
    commit,
    saveNow,
    retrySave: () => persist(current.current),
  };
}
