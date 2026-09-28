// One line of the grocery list, in the list view or the in-store checklist.
import {LockKeyhole, Minus, Plus, Tag, X} from 'lucide-react';
import {Checkbox} from '@/components/ui/checkbox';
import {money, productById, type ListItem} from '@/lib/catalog';
import type {priceHistory} from '@/lib/shopping-history';
import {isStale, shelfPriceAgeDays, type resolveLinePrice} from '@/lib/shelf-prices';
import {tapFeedback} from '@/lib/persistence';
import {cx, ProductIcon} from './parts';

/** What a row needs from the app: prices, history and the actions it can take. */
export type ItemRowContext = {
  lineFor: (item: ListItem, shopping: boolean) => ReturnType<typeof resolveLinePrice>;
  /** Unit price of the collected offer in the basket being shopped, if any. */
  unitPrice: (itemId: string) => string | null;
  paidHistory: ReturnType<typeof priceHistory>;
  updateItem: (id: string, patch: Partial<ListItem>) => void;
  removeItem: (item: ListItem) => void;
  capturePrice: (item: ListItem) => void;
  matchItem: (item: ListItem) => void;
};

export function ItemRow({
  item,
  ctx,
  compact = false,
  shopping = false,
}: {
  item: ListItem;
  ctx: ItemRowContext;
  compact?: boolean;
  shopping?: boolean;
}) {
  const p = item.productId ? productById[item.productId] : null;
  const resolved = ctx.lineFor(item, shopping);
  const price = resolved?.cents ?? null;
  const observed = resolved?.source === 'observed' ? resolved.shelf! : null;
  const unitText = shopping && resolved?.source === 'collected' ? ctx.unitPrice(item.id) : null;
  const paid = item.productId ? (ctx.paidHistory.get(item.productId) ?? null) : null;
  // At most one line under the price. While shopping, the unit price of the
  // offer in front of you wins; what you paid before only fills the gap where
  // no price was collected at all.
  const secondary = observed ? (
    // A price the household typed is always marked as theirs, wherever it shows.
    <small className="item-observed">
      you saw this{isStale(observed) ? ` · ${shelfPriceAgeDays(observed)} days ago` : ''}
    </small>
  ) : shopping ? (
    unitText ? (
      <small className="item-unit">{unitText}</small>
    ) : paid && price === null ? (
      <small className="item-paid">paid {money(Math.round(paid.last.unitCents))} last time</small>
    ) : null
  ) : paid ? (
    <small className="item-paid">
      paid {money(Math.round(paid.last.unitCents))} at {paid.last.storeName}
    </small>
  ) : null;
  return (
    <div className={cx('item-row', item.checked && 'is-checked')}>
      {shopping && (
        <Checkbox
          aria-label={`Mark ${item.name} as bought`}
          checked={item.checked}
          onCheckedChange={v => {
            if (v === true) tapFeedback();
            ctx.updateItem(item.id, {checked: v === true});
          }}
          className="item-check"
        />
      )}
      <ProductIcon product={p} small={compact} />
      <div className="item-copy">
        <strong>{item.name}</strong>
        <span>{p ? `${p.brand} · ${p.size}` : 'Not matched to a catalogue item'}</span>
      </div>
      {!compact && !shopping && (
        <button
          className={cx('icon-button lock-button', item.locked && 'is-locked')}
          aria-label={`${item.locked ? 'Unlock' : 'Lock'} ${item.name}`}
          title={item.locked ? 'Exact product locked' : 'Keep this exact product'}
          onClick={() => ctx.updateItem(item.id, {locked: !item.locked})}
        >
          <LockKeyhole size={15} />
        </button>
      )}
      {!compact && !shopping && (
        <div className="quantity">
          <button
            aria-label={`Decrease ${item.name} quantity`}
            disabled={item.qty === 1}
            onClick={() => ctx.updateItem(item.id, {qty: item.qty - 1})}
          >
            <Minus size={13} />
          </button>
          <span>{item.qty}</span>
          <button
            aria-label={`Increase ${item.name} quantity`}
            disabled={item.qty >= 99}
            onClick={() => ctx.updateItem(item.id, {qty: item.qty + 1})}
          >
            <Plus size={13} />
          </button>
        </div>
      )}
      {compact || shopping ? <span className="item-quantity">×{item.qty}</span> : null}
      {shopping ? (
        <button
          type="button"
          className={cx(
            'item-price is-capture',
            observed && 'is-observed',
            price == null && 'is-empty',
          )}
          aria-label={
            price != null
              ? `Change the price recorded for ${item.name}`
              : `Add the shelf price for ${item.name}`
          }
          onClick={() => ctx.capturePrice(item)}
        >
          {price != null ? (
            money(price)
          ) : (
            <span className="item-price-add">
              <Tag size={13} /> price
            </span>
          )}
          {secondary}
        </button>
      ) : (
        <span className="item-price">
          {price != null ? money(price) : '—'}
          {secondary}
        </span>
      )}
      {!p && !compact && (
        <button className="text-button" onClick={() => ctx.matchItem(item)}>
          Match
        </button>
      )}
      {!compact && !shopping && (
        <button
          className="icon-button remove"
          aria-label={`Remove ${item.name}`}
          onClick={() => ctx.removeItem(item)}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
