// Cards on the home and spending screens that summarise money: this shop's
// budget, and how close past estimates came to the till.
import {ArrowRight, SlidersHorizontal, Sparkles, Target} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {money, type Trip} from '@/lib/catalog';
import {accuracy} from '@/lib/shopping-history';
import {cx} from './parts';

export type ListTotal = {
  cents: number;
  collected: number;
  observed: number;
  unpriced: number;
};

export function BudgetCard({
  budget,
  items,
  total,
  swapCount,
  swapSaving,
  basketCount,
  onEditBudget,
  onSwaps,
  onCompare,
}: {
  budget: number;
  items: number;
  total: ListTotal;
  swapCount: number;
  swapSaving: number;
  basketCount: number;
  onEditBudget: () => void;
  onSwaps: () => void;
  onCompare: () => void;
}) {
  // The checklist counts prices the household read off a shelf, so this has to
  // as well — two screens answering "what will this shop cost" with different
  // numbers is worse than either answer on its own. The split is stated below.
  const spent = total.cents;
  const known = total.collected + total.observed;
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const over = Math.max(0, spent - budget);
  return (
    <section className="card budget-card">
      <div className="section-top">
        <h3>This shop&rsquo;s budget</h3>
        <button className="icon-button" aria-label="Edit budget" onClick={onEditBudget}>
          <SlidersHorizontal size={17} />
        </button>
      </div>
      <div className="budget-numbers">
        <strong>{known ? money(spent) : '—'}</strong>
        <span>of {money(budget)}</span>
      </div>
      <Progress
        value={pct}
        aria-label="Share of this shop's budget used"
        className={cx('budget-progress', over > 0 && 'over-budget')}
      />
      <p>
        {!items ? (
          'Add groceries to your list and Aisle can tell you what the shop should cost.'
        ) : !known ? (
          'No prices yet. Run a price check, or add what you saw on the shelf while you shop.'
        ) : total.unpriced > 0 ? (
          <>
            {money(spent)} for{' '}
            <strong>
              {known} of {items}
            </strong>{' '}
            items
            {total.observed > 0 && (
              <>
                {' '}
                — {total.observed} of {total.observed === 1 ? 'them a price' : 'those prices'} you
                entered yourself
              </>
            )}
            . The rest have no price, so this is not your whole shop.
          </>
        ) : over > 0 ? (
          <>
            <span className="warning-text">{money(over)} over budget</span>
            {total.observed > 0 ? (
              <>
                , counting {total.observed} {total.observed === 1 ? 'price' : 'prices'} you entered.
              </>
            ) : (
              '.'
            )}{' '}
            Compare baskets or trim the list.
          </>
        ) : (
          <>
            <span className="green-text">{money(budget - spent)} to spare</span>, with every item
            priced
            {total.observed > 0 && <> ({total.observed} from what you saw in the shop)</>}.
          </>
        )}
      </p>
      {swapCount > 0 && (
        <button className="budget-link" onClick={onSwaps}>
          <Sparkles size={16} />{' '}
          {swapCount === 1 ? 'One cheaper option' : `${swapCount} cheaper options`} worth{' '}
          {money(swapSaving)} <ArrowRight size={16} />
        </button>
      )}
      {basketCount > 1 && (
        <button className="budget-link" onClick={onCompare}>
          <Sparkles size={16} /> Compare {basketCount} baskets <ArrowRight size={16} />
        </button>
      )}
    </section>
  );
}

/**
 * How Aisle's estimate compared with the till.
 *
 * Only whole-list estimates are scored. `predicted` is the subtotal of what
 * Aisle could price, so on a shop where it priced 4 of 12 items, putting it
 * beside the receipt total would manufacture an error that says nothing about
 * the estimate. Those trips are counted and named instead.
 */
export function AccuracyCard({trips, shopName}: {trips: Trip[]; shopName: (trip: Trip) => string}) {
  const scored = accuracy(trips);
  const partial = trips.length - scored.comparable.length;
  if (!trips.length) return null;
  return (
    <section className="card accuracy-card">
      <div className="section-top">
        <div>
          <h3>
            <Target size={17} /> How close Aisle got
          </h3>
          <p>
            Only shops where Aisle had a price for every item on your list can be scored against the
            receipt.
          </p>
        </div>
      </div>
      {scored.comparable.length && scored.meanDifference !== null ? (
        <>
          <div className="accuracy-headline">
            <strong>
              {scored.meanDifference === 0
                ? 'Spot on'
                : `${money(Math.abs(scored.meanDifference))} ${scored.meanDifference > 0 ? 'more' : 'less'} than estimated`}
            </strong>
            <span>
              on average across {scored.comparable.length} fully priced{' '}
              {scored.comparable.length === 1 ? 'shop' : 'shops'}
            </span>
          </div>
          <ul className="accuracy-rows">
            {scored.comparable.slice(0, 4).map(({trip, predicted, actual, difference}) => (
              <li key={trip.id}>
                <span>
                  {shopName(trip)} ·{' '}
                  {new Date(trip.date + 'T12:00:00').toLocaleDateString('en-CA', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="accuracy-figures">
                  <small>est. {money(predicted)}</small>
                  <strong>{money(actual)}</strong>
                  <em className={difference > 0 ? 'warning-text' : 'green-text'}>
                    {difference === 0
                      ? 'exact'
                      : `${difference > 0 ? '+' : '−'}${money(Math.abs(difference))}`}
                  </em>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="accuracy-empty">
          No shop has been fully priced yet, so there is nothing honest to score.{' '}
          {partial > 0 &&
            `${partial} recorded ${partial === 1 ? 'shop' : 'shops'} had items Aisle could not price.`}
        </p>
      )}
    </section>
  );
}
