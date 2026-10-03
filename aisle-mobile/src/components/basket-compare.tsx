'use client';
// Prices: the price-check results, shop by shop, and the area being searched.
//
// The ranking rule is the honest one: a complete basket always outranks a
// partial one, and an incomplete basket is never called cheapest, only
// best covered. A retailer with a readable catalogue but nothing matched still
// appears, because "we looked and found nothing" is a result.
//
// The search area is on the map below the results. Moving the pin or the
// radius starts a new area, so the old results stop showing until the area is
// checked (a saved check is only ever reused for the area it was made for).
import {useMemo, useState} from 'react';
import {Check, CircleAlert, Info, RefreshCw, ShieldCheck, ShoppingBag, Store} from 'lucide-react';
import {money, type Preferences, type UserState} from '@/lib/catalog';
import type {Basket, AgentRun} from '@/lib/agent';
import {coverageRows, coverageSummary, STATUS_LABEL} from '@/lib/coverage';
import {cityLocation} from '@/lib/locations';
import type {AgentSession} from '@/lib/use-agent-run';
import LocationMap from './location-map';
import {StoreLogo} from './store-logo';
import './basket-compare.css';

type Props = {
  state: UserState;
  agent: AgentSession;
  onShop: (sourceId: string) => void;
  onList: () => void;
  onPrefs: (patch: Partial<Preferences>) => void;
};

const FEED_LABEL = {
  connected: 'Prices read',
  'no-public-feed': 'No price feed',
  unprobed: 'Not checked',
} as const;

export default function BasketCompare({state, agent, onShop, onList, onPrefs}: Props) {
  const {run, busy, error, baskets, best, perShopBudget, readable, start} = agent;
  const complete = useMemo(() => baskets.filter(b => b.complete), [baskets]);
  const prefs = state.prefs;
  const shops = useMemo(
    () =>
      (run?.stores ?? [])
        .filter(s => Number.isFinite(s.lat) && Number.isFinite(s.lng))
        .map(s => ({id: s.id, name: s.name, lat: s.lat, lng: s.lng})),
    [run],
  );

  // Only comparable when two baskets both cover the whole list; comparing a
  // full basket against a partial one would overstate the difference.
  const spread = useMemo(() => {
    if (complete.length < 2) return null;
    const sorted = [...complete].sort((a, b) => a.subtotal - b.subtotal);
    return {
      low: sorted[0],
      high: sorted[sorted.length - 1],
      difference: sorted[sorted.length - 1].subtotal - sorted[0].subtotal,
    };
  }, [complete]);

  return (
    <div className="compare-screen">
      <div className="page-heading">
        <div>
          <h1>Prices</h1>
          <p>
            {run
              ? `${run.stores.length} ${run.stores.length === 1 ? 'shop' : 'shops'} within ${prefs.radius} km. Each price comes from the shop’s own website.`
              : 'Prices from the websites of shops near you.'}
          </p>
        </div>
        <button className="button secondary" disabled={busy} onClick={start}>
          <RefreshCw size={16} className={busy ? 'spin' : ''} />
          {busy ? 'Checking' : run ? 'Check again' : 'Check prices'}
        </button>
      </div>

      {error && (
        <p className="agent-alert" role="alert">
          <CircleAlert size={17} /> {error}
          <button type="button" onClick={start}>
            Try again
          </button>
        </p>
      )}

      {spread && (
        <section className="compare-spread">
          <strong>{money(spread.difference)}</strong>
          <p>
            between the cheapest and dearest full basket: {spread.low.name}{' '}
            {money(spread.low.subtotal)}, {spread.high.name} {money(spread.high.subtotal)}, for the
            same {spread.low.total} items.
          </p>
        </section>
      )}

      {baskets.length === 0 ? (
        <EmptyCompare busy={busy} readable={readable} run={!!run} onList={onList} onCheck={start} />
      ) : (
        <>
          <div className="compare-grid">
            {baskets.map(basket => (
              <BasketCard
                key={basket.sourceId}
                basket={basket}
                budget={perShopBudget}
                isBest={basket === best && basket.complete}
                onShop={() => onShop(basket.sourceId)}
              />
            ))}
          </div>
          <p className="compare-note">
            <Info size={16} />
            <span>
              Products only: delivery, tax, deposits, fees and memberships are not included. Online
              prices can differ from what a branch charges at the shelf.
            </span>
          </p>
        </>
      )}

      <section className="compare-area" aria-labelledby="area-h">
        <div className="section-head">
          <h2 id="area-h">Shops near you</h2>
        </div>
        <LocationMap
          city={prefs.city}
          location={prefs.searchLocation ?? cityLocation(prefs.city)}
          radius={prefs.radius}
          onLocation={searchLocation => onPrefs({searchLocation})}
          onRadius={radius => onPrefs({radius})}
          shops={shops}
        />
        {!run && !busy && (
          <div className="compare-recheck">
            <span>New area? Check it to see its shops and prices.</span>
            <button className="button primary" onClick={start}>
              <RefreshCw size={16} /> Check this area
            </button>
          </div>
        )}
        {run && run.stores.length > 0 && (
          <ul className="compare-stores card">
            {run.stores.slice(0, 10).map(store => (
              <li key={store.id}>
                <StoreLogo store={{id: store.chainId ?? store.id, name: store.name}} />
                <span className="compare-store-copy">
                  <strong>{store.name}</strong>
                  <small>
                    {store.address || 'Address not mapped'} · {store.km.toFixed(1)} km
                  </small>
                </span>
                <span className={`agent-feed ${store.feed}`}>{FEED_LABEL[store.feed]}</span>
              </li>
            ))}
          </ul>
        )}
        {run && run.stores.length === 0 && (
          <p className="field-help">
            The map directory has no grocery shops inside this area. That is a gap in the map data,
            not proof there are none.
          </p>
        )}
        <p className="field-help">Distances are in a straight line, not by road.</p>
      </section>

      <CoverageDirectory run={run} />
    </div>
  );
}

function BasketCard({
  basket,
  budget,
  isBest,
  onShop,
}: {
  basket: Basket;
  budget: number;
  isBest: boolean;
  onShop: () => void;
}) {
  const coverage = basket.total ? Math.round((basket.priced / basket.total) * 100) : 0;
  return (
    <article className={`compare-card${isBest ? ' is-best' : ''}`}>
      <div className="compare-card-head">
        <StoreLogo store={{id: basket.sourceId, name: basket.name}} />
        <h3>{basket.name}</h3>
        {isBest && (
          <span className="compare-badge">
            <Check size={13} /> Cheapest
          </span>
        )}
      </div>
      <strong className="compare-total">
        {basket.priced ? money(basket.subtotal) : 'No prices'}
      </strong>
      <p className="compare-sub">
        {basket.complete
          ? `All ${basket.total} items priced`
          : `${basket.priced} of ${basket.total} items priced`}
      </p>
      <div className="compare-meter" role="img" aria-label={`${coverage}% of your list priced`}>
        <span style={{width: `${coverage}%`}} />
      </div>
      <dl className="compare-facts">
        {basket.complete ? (
          <div>
            <dt>Budget</dt>
            <dd className={basket.overBudget > 0 ? 'is-over' : 'is-under'}>
              {basket.overBudget > 0
                ? `${money(basket.overBudget)} over`
                : `${money(budget - basket.subtotal)} left`}
            </dd>
          </div>
        ) : (
          <div>
            <dt>No price</dt>
            <dd>
              {basket.total - basket.priced} {basket.total - basket.priced === 1 ? 'item' : 'items'}
            </dd>
          </div>
        )}
        <div>
          <dt>Confirmed</dt>
          <dd>
            {basket.priced - basket.unconfirmed} of {basket.priced}
          </dd>
        </div>
      </dl>
      {basket.unconfirmed > 0 && (
        <p className="compare-warn">
          <CircleAlert size={15} />
          <span>
            {basket.unconfirmed} {basket.unconfirmed === 1 ? 'match needs' : 'matches need'} your
            yes on Home before this total can be relied on.
          </span>
        </p>
      )}
      <button className="button primary full" disabled={!basket.priced} onClick={onShop}>
        <ShoppingBag size={16} /> Shop at {basket.name}
      </button>
    </article>
  );
}

function EmptyCompare({
  busy,
  readable,
  run,
  onList,
  onCheck,
}: {
  busy: boolean;
  readable: number;
  run: boolean;
  onList: () => void;
  onCheck: () => void;
}) {
  return (
    <section className="compare-empty card">
      <span className="empty-icon">
        <Store />
      </span>
      <h2>
        {busy
          ? 'Checking prices'
          : !run
            ? 'No prices checked for this area'
            : readable === 0
              ? 'No shop near you publishes prices Aisle can read'
              : 'Nothing on your list matched a price'}
      </h2>
      <p>
        {busy
          ? 'Finding shops near you and reading the prices they publish. This takes a few seconds.'
          : !run
            ? 'Check prices and Aisle will read what the shops in your area publish.'
            : readable === 0
              ? 'Aisle only shows prices it has read itself, so it shows none rather than guessing. A wider search area may reach a shop that publishes them.'
              : 'The shops Aisle could read do not list your items, or the matches broke your brand or size rules.'}
      </p>
      {!busy && (
        <div className="compare-empty-actions">
          {!run ? (
            <button className="button primary" onClick={onCheck}>
              <RefreshCw size={16} /> Check prices
            </button>
          ) : (
            <button className="button secondary" onClick={onList}>
              Edit list
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Every Ontario chain Aisle knows, and whether it can read that chain's prices.
 *
 * The useful fact is the uncomfortable one: most large banners publish nothing
 * machine-readable, so Aisle cannot price them and says so instead of guessing.
 */
function CoverageDirectory({run}: {run: AgentRun | null}) {
  const [open, setOpen] = useState(false);
  const rows = useMemo(() => coverageRows(run), [run]);
  const summary = useMemo(() => coverageSummary(rows), [rows]);
  const shown = open ? rows : rows.slice(0, 6);
  return (
    <section className="coverage-directory" aria-labelledby="coverage-h">
      <div className="section-head">
        <h2 id="coverage-h">Which chains Aisle can price</h2>
      </div>
      <p className="section-lede">
        <ShieldCheck size={15} /> {summary.readable} of {summary.total} Ontario chains publish
        prices Aisle is allowed to read.
        {summary.nearbyUnreadable > 0 &&
          ` ${summary.nearbyUnreadable} ${summary.nearbyUnreadable === 1 ? 'chain' : 'chains'} near you ` +
            `${summary.nearbyUnreadable === 1 ? 'does' : 'do'} not.`}
      </p>
      <ul className="coverage-list card">
        {shown.map(row => (
          <li key={row.chain.id} className={`coverage-row is-${row.status}`}>
            <StoreLogo store={{id: row.chain.id, name: row.chain.name}} />
            <span className="coverage-copy">
              <strong>{row.chain.name}</strong>
              <small>{row.explanation}</small>
              {row.nearby > 0 && (
                <small className="coverage-nearby">
                  {row.nearby} {row.nearby === 1 ? 'branch' : 'branches'} near you
                  {row.nearestKm !== null && `, closest ${row.nearestKm.toFixed(1)} km`}
                </small>
              )}
            </span>
            <span className={`agent-feed coverage-${row.status}`}>{STATUS_LABEL[row.status]}</span>
          </li>
        ))}
      </ul>
      {rows.length > 6 && (
        <button className="text-button" onClick={() => setOpen(v => !v)}>
          {open ? 'Show fewer' : `Show all ${rows.length} chains`}
        </button>
      )}
      <p className="field-help">
        A chain marked “No price feed” may have shops near you. It does not publish prices Aisle is
        allowed to read, so they stay blank.
      </p>
    </section>
  );
}
