'use client';
// Home: the week at a glance, and what the last price check found.
//
// The summary card leads with the answer. Below it, the matches waiting for a
// yes or no, the items no shop priced (grouped by why), and "How we know":
// which shops were read, and the HTTP response behind every figure. Nothing is
// shown unless it came back from a check; an unpriced item stays unpriced.
import {useMemo, useState, type ReactNode} from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  FileSearch,
  Info,
  LoaderCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import type {AgentRun, Basket, UnmatchedKind} from '@/lib/agent';
import type {AgentSession} from '@/lib/use-agent-run';
import {money, productById, type UserState} from '@/lib/catalog';
import {ProductArt} from './product-art';
import {formatPack, withUnitPrices} from '@/lib/unit-price';
import './agent-workspace.css';

type Props = {
  state: UserState;
  agent: AgentSession;
  commit: (update: (state: UserState) => UserState) => void;
  onAdd: (id: string) => void;
  onList: () => void;
  onPreferences: () => void;
  onCompare: () => void;
  /** Shown between the summary and the matches (what is due this week). */
  children?: ReactNode;
};

export default function AgentWorkspace({
  state,
  agent,
  commit,
  onList,
  onPreferences,
  onCompare,
  children,
}: Props) {
  const {run, busy, error, baskets, best, perShopBudget: budget, readable, start} = agent;
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? 'Good morning'
      : hour >= 12 && hour < 18
        ? 'Good afternoon'
        : 'Good evening';
  const today = now.toLocaleDateString('en-CA', {weekday: 'long', month: 'long', day: 'numeric'});
  const count = state.items.length;
  const unpriced = best ? best.total - best.priced : 0;
  // Items with a collected price, counted once across every basket.
  const matchedCount = useMemo(
    () => new Set(baskets.flatMap(b => b.lines.filter(l => l.offer).map(l => l.itemId))).size,
    [baskets],
  );

  function decide(
    itemId: string,
    sourceId: string,
    offerId: string,
    brand: string,
    accept: boolean,
  ) {
    commit(s => {
      const selections = {...s.offerSelections, [itemId]: {...s.offerSelections?.[itemId]}};
      if (accept) selections[itemId][sourceId] = offerId;
      else delete selections[itemId][sourceId];
      const item = s.items.find(i => i.id === itemId);
      const category = item?.productId
        ? (productById[item.productId]?.category ?? 'Other')
        : 'Other';
      return {
        ...s,
        offerSelections: selections,
        events: s.prefs.learning
          ? [
              ...s.events,
              {
                action: accept ? 'offer_accepted' : 'offer_rejected',
                category,
                productId: item?.productId ?? undefined,
                offerId,
                brand,
                date: new Date().toISOString(),
                storeId: sourceId,
              },
            ].slice(-200)
          : s.events,
      };
    });
  }

  return (
    <div className="agent-workspace">
      <header className="home-head">
        <h1>
          {greeting}
          {state.prefs.name ? `, ${state.prefs.name}` : ''}
        </h1>
        <p>
          {today} · {count} {count === 1 ? 'item' : 'items'} on your list
        </p>
      </header>

      <section className={`hero-card${busy ? ' is-busy' : ''}`} aria-labelledby="hero-h">
        {busy ? (
          <>
            <h2 className="hero-kicker" id="hero-h">
              Checking prices
            </h2>
            <p className="hero-title">
              <LoaderCircle size={22} className="spin" /> Reading shop websites near you
            </p>
            <p className="hero-note">
              Finding shops, reading their prices and matching your list. This takes a few seconds.
            </p>
          </>
        ) : best ? (
          <>
            <h2 className="hero-kicker" id="hero-h">
              {best.complete ? 'Cheapest full basket' : 'Partly priced'}
            </h2>
            <p className="hero-figure">
              <span className="hero-amount">{money(best.subtotal)}</span>
              <span className="hero-at">at {best.name}</span>
            </p>
            <div
              className="hero-meter"
              role="img"
              aria-label={`${best.priced} of ${best.total} items priced`}
            >
              <span
                style={{width: `${Math.round((best.priced / Math.max(1, best.total)) * 100)}%`}}
              />
            </div>
            <p className="hero-note">
              {best.complete
                ? `Every item is priced. ${
                    best.subtotal <= budget
                      ? `${money(budget - best.subtotal)} under your ${money(budget)} budget.`
                      : `${money(best.subtotal - budget)} over your ${money(budget)} budget.`
                  }`
                : `${best.priced} of ${best.total} items priced. ${unpriced} ${
                    unpriced === 1 ? 'has' : 'have'
                  } no price at this shop yet.`}
            </p>
          </>
        ) : run ? (
          <>
            <h2 className="hero-kicker" id="hero-h">
              No prices yet
            </h2>
            <p className="hero-title">Nothing on your list could be priced</p>
            <p className="hero-note">
              {readable === 0
                ? 'None of the shops near you publish prices Aisle can read right now.'
                : 'The shops Aisle could read do not carry what is on your list.'}{' '}
              You can still shop your list and add the prices you see on the shelf.
            </p>
          </>
        ) : (
          <>
            <h2 className="hero-kicker" id="hero-h">
              This week
            </h2>
            <p className="hero-title">Price your list</p>
            <p className="hero-note">
              Aisle reads the prices shops publish on their websites and matches them to your list.
              Every figure links to where it came from.
            </p>
          </>
        )}
        <div className="hero-actions">
          {best && !busy ? (
            <>
              <button className="button lime" onClick={onCompare}>
                See prices <ChevronRight size={17} />
              </button>
              <button className="button on-hero" onClick={start}>
                <RefreshCw size={16} /> Check again
              </button>
            </>
          ) : (
            <button className="button lime" disabled={busy} onClick={start}>
              {busy ? (
                <>
                  <LoaderCircle size={17} className="spin" /> Checking
                </>
              ) : (
                <>
                  <RefreshCw size={16} /> {run ? 'Check again' : 'Check prices'}
                </>
              )}
            </button>
          )}
        </div>
        {run && !busy && (
          <p className="hero-when">
            <Clock size={14} /> Prices checked {checkedWhen(run.finishedAt)}
          </p>
        )}
      </section>

      {error && (
        <p className="agent-alert" role="alert">
          <CircleAlert size={17} /> {error}
          <button type="button" onClick={start}>
            Try again
          </button>
        </p>
      )}

      {children}

      {run && (
        <>
          {readable === 0 ? (
            <section className="agent-blocked card">
              <CircleAlert size={20} />
              <div>
                <strong>No shop prices could be read this time</strong>
                <p>
                  {count
                    ? `Your ${count} ${count === 1 ? 'item shows' : 'items show'} as unpriced because no shop's website could be read on this check. That says nothing about whether the shop has them.`
                    : 'No shop website could be read on this check. Add groceries to your list and check again.'}
                </p>
              </div>
            </section>
          ) : (
            <section className="home-section" aria-labelledby="matches-h">
              <div className="section-head">
                <h2 id="matches-h">Your matches</h2>
                <button className="text-button" onClick={onPreferences}>
                  Brand rules <ArrowUpRight size={15} />
                </button>
              </div>
              <p className="section-lede">
                {matchedCount} of {count} {count === 1 ? 'item has' : 'items have'} a price. A match
                only counts toward a total after you confirm it.
              </p>
              <div className="agent-lines">
                {/* Priced items first: they are the output. Items with no price follow in
                    one grouped block, so the explanation is said once rather than once
                    per row. */}
                {state.items
                  .filter(item =>
                    baskets.some(b => b.lines.some(l => l.itemId === item.id && l.offer)),
                  )
                  .map(item => {
                    const candidates = baskets
                      .map(b => ({basket: b, line: b.lines.find(l => l.itemId === item.id)}))
                      .filter(
                        (c): c is {basket: Basket; line: NonNullable<typeof c.line>} =>
                          !!c.line?.offer,
                      );
                    const {priced: unitRows} = withUnitPrices(candidates, c => ({
                      price: c.line.offer!.price,
                      pack: c.line.offer!.pack,
                    }));
                    const unitFor = (sourceId: string) =>
                      unitRows.find(u => u.row.basket.sourceId === sourceId);
                    const product = item.productId ? productById[item.productId] : undefined;
                    return (
                      <article className="agent-line" key={item.id}>
                        <div className="agent-line-head">
                          <ProductArt id={item.productId} small />
                          <div className="agent-line-copy">
                            <strong>
                              {item.qty} × {item.name}
                            </strong>
                            <small>
                              {product ? `${product.brand} · ${product.size}` : 'Your own item'}
                              {item.locked ? ' · locked to this product' : ''}
                            </small>
                          </div>
                        </div>
                        <div className="agent-line-offers">
                          {candidates.map(({basket, line}) => {
                            const unit = unitFor(basket.sourceId);
                            return (
                              <div
                                className={`agent-offer${line.confirmed ? ' is-confirmed' : ''}`}
                                key={basket.sourceId}
                              >
                                <div className="agent-offer-copy">
                                  <strong>{money(line.lineTotal)}</strong>
                                  <span>
                                    {basket.name} · {line.packs}×{' '}
                                    {line.offer!.pack
                                      ? formatPack(line.offer!.pack)
                                      : 'pack size not stated'}
                                  </span>
                                  {unit?.text ? (
                                    <span className={`agent-unit${unit.best ? ' is-best' : ''}`}>
                                      {unit.text}
                                      {unit.best && ' · best value'}
                                    </span>
                                  ) : (
                                    <span className="agent-unit is-unknown">
                                      No unit price: the pack size is not stated
                                    </span>
                                  )}
                                  <a
                                    href={line.offer!.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                  >
                                    {line.offer!.title} <ArrowUpRight size={12} />
                                  </a>
                                  {line.rationale && <em>{line.rationale}</em>}
                                </div>
                                {line.confirmed ? (
                                  <button
                                    className="agent-chip is-on"
                                    onClick={() =>
                                      decide(
                                        item.id,
                                        basket.sourceId,
                                        line.offer!.id,
                                        line.offer!.brand,
                                        false,
                                      )
                                    }
                                  >
                                    <Check size={15} /> Confirmed
                                  </button>
                                ) : (
                                  <span className="agent-offer-decide">
                                    <button
                                      className="agent-chip"
                                      onClick={() =>
                                        decide(
                                          item.id,
                                          basket.sourceId,
                                          line.offer!.id,
                                          line.offer!.brand,
                                          true,
                                        )
                                      }
                                    >
                                      <Check size={15} /> This is right
                                    </button>
                                    <button
                                      className="agent-chip subtle"
                                      onClick={() =>
                                        decide(
                                          item.id,
                                          basket.sourceId,
                                          line.offer!.id,
                                          line.offer!.brand,
                                          false,
                                        )
                                      }
                                    >
                                      <X size={15} /> Not this
                                    </button>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                <UnpricedGroups
                  state={state}
                  run={run}
                  baskets={baskets}
                  onList={onList}
                  onPreferences={onPreferences}
                  onRecheck={start}
                />
              </div>
            </section>
          )}

          <section className="home-section" id="how-we-know" aria-labelledby="how-we-know-h">
            <div className="section-head">
              <h2 id="how-we-know-h">How we know</h2>
              <span className={`agent-mode ${run.mode}`}>
                {run.mode === 'assisted' ? 'AI-assisted matching' : 'Rule-based matching'}
              </span>
            </div>
            <div className="card how-card">
              <dl className="agent-facts">
                <div>
                  <dt>Shops read</dt>
                  <dd>{readable}</dd>
                </div>
                <div>
                  <dt>Prices found</dt>
                  <dd>{run.offers.length}</dd>
                </div>
                <div>
                  <dt>Items on your list</dt>
                  <dd>{count}</dd>
                </div>
                <div>
                  <dt>Budget per shop</dt>
                  <dd>{money(budget)}</dd>
                </div>
              </dl>
              <p className="agent-narrative">{run.narrative}</p>
              {run.warnings.map(w => (
                <p className="agent-warning" key={w}>
                  <Info size={15} /> {w}
                </p>
              ))}
              <Accordion type="multiple" className="agent-evidence">
                <AccordionItem value="evidence">
                  <AccordionTrigger>
                    <span className="agent-acc-label">
                      <FileSearch size={17} /> The responses behind these prices (
                      {run.evidence.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="agent-table-wrap">
                      <table className="agent-table">
                        <thead>
                          <tr>
                            <th>Source</th>
                            <th>Status</th>
                            <th>Read at</th>
                            <th>Size</th>
                            <th>SHA-256</th>
                          </tr>
                        </thead>
                        <tbody>
                          {run.evidence.map(e => (
                            <tr key={e.id}>
                              <td>
                                <a href={e.url} target="_blank" rel="noreferrer noopener">
                                  {e.origin.replace('https://', '')}
                                </a>
                              </td>
                              <td>{e.status}</td>
                              <td>{new Date(e.fetchedAt).toLocaleString('en-CA')}</td>
                              <td>{Math.round(e.bytes / 1024)} KB</td>
                              <td className="agent-hash">{e.bodyHash.slice(0, 16)}…</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {run.rejectedOffers.length > 0 && (
                      <p className="agent-rejected">
                        {run.rejectedOffers.length} collected record
                        {run.rejectedOffers.length === 1 ? ' was' : 's were'} left out before
                        totalling (unavailable, expired or failing verification).
                      </p>
                    )}
                    {run.violations.length > 0 && (
                      <ul className="agent-violations">
                        {run.violations.map((v, i) => (
                          <li key={i}>{v.detail}</li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="trace">
                  <AccordionTrigger>
                    <span className="agent-acc-label">
                      <Info size={17} /> Each step of this check
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="agent-trace">
                      {run.trace.map((t, i) => (
                        <li key={i}>
                          <span className="agent-trace-phase">{t.phase}</span>
                          <span>
                            <strong>{t.label}</strong>: {t.detail}
                          </span>
                          <span className="agent-trace-ms">{t.ms} ms</span>
                        </li>
                      ))}
                    </ol>
                    <p className="agent-foot">
                      Check {run.runId} · {run.durationMs} ms · {run.budgetSpent.toolCalls} tool
                      calls · {Math.round(run.budgetSpent.evidenceBytes / 1024)} KB read
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/** The shared explanation for each kind of gap, said once. */
const GAP_COPY: Record<UnmatchedKind, {title: (n: number) => string; body: string}> = {
  'no-record': {
    title: n => `${n} ${n === 1 ? 'item has' : 'items have'} no matching catalogue record`,
    body:
      'None of the shop websites Aisle could read list these, so they are left blank. That is a ' +
      'gap in what shops publish, not a sign the items are out of stock.',
  },
  discarded: {
    title: n => `${n} ${n === 1 ? 'price was' : 'prices were'} found but could not be trusted`,
    body:
      'A price was found for these but failed a check (wrong currency, out of date, or no record ' +
      'of where it came from), so Aisle left it out.',
  },
  flagged: {
    title: n => `${n} ${n === 1 ? 'item was' : 'items were'} recorded as unavailable`,
    body: 'Aisle found nothing equivalent, so it says so instead of suggesting something close.',
  },
};

/**
 * Every unpriced item, grouped by why.
 *
 * The per-item reasoning is kept behind a disclosure; the sentence that is
 * identical on every row is printed once.
 */
function UnpricedGroups({
  state,
  run,
  baskets,
  onList,
  onPreferences,
  onRecheck,
}: {
  state: UserState;
  run: AgentRun;
  baskets: Basket[];
  onList: () => void;
  onPreferences: () => void;
  onRecheck: () => void;
}) {
  const [open, setOpen] = useState<UnmatchedKind | null>(null);
  const groups = useMemo(() => {
    const priced = new Set(baskets.flatMap(b => b.lines.filter(l => l.offer).map(l => l.itemId)));
    const rows = run.unmatched.filter(
      u => !priced.has(u.itemId) && state.items.some(i => i.id === u.itemId),
    );
    const by = new Map<UnmatchedKind, typeof rows>();
    for (const row of rows) by.set(row.kind, [...(by.get(row.kind) ?? []), row]);
    return [...by.entries()];
  }, [run, baskets, state.items]);

  if (!groups.length) return null;

  return (
    <>
      {groups.map(([kind, rows]) => {
        const copy = GAP_COPY[kind];
        const expanded = open === kind;
        return (
          <section className={`agent-gap-group is-${kind}`} key={kind}>
            <div className="agent-gap-head">
              <CircleAlert size={18} />
              <div>
                <strong>{copy.title(rows.length)}</strong>
                <p>{copy.body}</p>
              </div>
            </div>
            <ul className="agent-gap-items">
              {rows.map(row => (
                <li key={row.itemId}>{row.name}</li>
              ))}
            </ul>
            <div className="agent-gap-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => setOpen(expanded ? null : kind)}
              >
                {expanded ? 'Hide the detail' : 'Why'} <ChevronDown size={14} />
              </button>
              {kind === 'no-record' ? (
                <>
                  <button type="button" className="text-button" onClick={onList}>
                    Edit my list <ArrowUpRight size={14} />
                  </button>
                  <button type="button" className="text-button" onClick={onPreferences}>
                    Brand rules <ArrowUpRight size={14} />
                  </button>
                </>
              ) : kind === 'discarded' ? (
                <button type="button" className="text-button" onClick={onRecheck}>
                  Check again <ArrowUpRight size={14} />
                </button>
              ) : (
                <button type="button" className="text-button" onClick={onList}>
                  Edit my list <ArrowUpRight size={14} />
                </button>
              )}
            </div>
            {expanded && (
              <dl className="agent-gap-detail">
                {rows.map(row => (
                  <div key={row.itemId}>
                    <dt>{row.name}</dt>
                    <dd>{row.reason}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        );
      })}
    </>
  );
}

/** "today at 3:14 p.m.", "yesterday at 9:02 a.m." or a date. A saved check
 *  can be up to a day old, so the time is always shown, never implied. */
function checkedWhen(iso: string, now = new Date()): string {
  const at = new Date(iso);
  const time = at.toLocaleTimeString('en-CA', {hour: 'numeric', minute: '2-digit'});
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((day(now) - day(at)) / 86_400_000);
  if (diff === 0) return `today at ${time}`;
  if (diff === 1) return `yesterday at ${time}`;
  return `on ${at.toLocaleDateString('en-CA', {month: 'short', day: 'numeric'})} at ${time}`;
}
