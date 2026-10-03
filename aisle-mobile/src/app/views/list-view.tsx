// My list: what to buy, grouped the way the shop is walked, with the
// household's usual items one tap away (the Bring! pattern: pictures you tap
// to put back on the list).
import {useMemo} from 'react';
import {
  ArrowRight,
  Bookmark,
  CheckCheck,
  ClipboardList,
  Download,
  History,
  Info,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {productById, type UserState} from '@/lib/catalog';
import {groupForWalk} from '@/lib/shopping-order';
import {quickAdds} from '@/lib/usuals';
import {tapFeedback} from '@/lib/persistence';
import {BudgetCard, type ListTotal} from '../home-cards';
import {ItemRow, type ItemRowContext} from '../item-row';
import {Empty, ProductIcon} from '../parts';
import './list-view.css';

export type ListViewProps = {
  state: UserState;
  saveStatus: string;
  rowCtx: ItemRowContext;
  listTotal: ListTotal;
  budget: number;
  basketCount: number;
  swapCount: number;
  swapSaving: number;
  priced: {priced: number; total: number} | null;
  onRename: (name: string) => void;
  onAdd: (productId: string) => void;
  onOpenCatalog: (mode: 'browse' | 'paste') => void;
  onOpenStarters: () => void;
  onSaveList: () => void;
  onClear: () => void;
  onExport: () => void;
  onEditBudget: () => void;
  onSwaps: () => void;
  onCompare: () => void;
};

export default function ListView(props: ListViewProps) {
  const {state, rowCtx, listTotal} = props;
  const itemCount = state.items.reduce((n, i) => n + i.qty, 0);
  const missing = state.items.filter(i => !i.productId).length;
  const groups = useMemo(() => groupForWalk(state.items), [state.items]);
  const tiles = useMemo(() => quickAdds(state), [state]);

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>Your grocery list</h1>
          <p>
            {state.items.length
              ? `${state.items.length} ${state.items.length === 1 ? 'product' : 'products'} · ${itemCount} ${itemCount === 1 ? 'item' : 'items'}, in the order you walk the shop.`
              : 'Add what you need. Aisle keeps it in the order you walk the shop.'}
          </p>
        </div>
        <div className="heading-actions">
          {/* The label is hidden on narrow screens, so the name is set here. */}
          <button className="button secondary" aria-label="Export list" onClick={props.onExport}>
            <Download size={16} />
            <span>Export list</span>
          </button>
          <button className="button primary" onClick={() => props.onOpenCatalog('browse')}>
            <Plus size={18} /> Add groceries
          </button>
        </div>
      </div>

      {tiles.length > 0 && (
        <section className="quick-add" aria-labelledby="quick-add-h">
          <div className="quick-add-head">
            <h2 id="quick-add-h">Your usuals</h2>
            <span>Tap to add</span>
          </div>
          <ul className="quick-add-tiles">
            {tiles.map(t => (
              <li key={t.productId}>
                <button
                  type="button"
                  className="quick-add-tile"
                  aria-label={`Add ${t.name}. ${t.why}`}
                  onClick={() => {
                    tapFeedback();
                    props.onAdd(t.productId);
                  }}
                >
                  <ProductIcon product={productById[t.productId]} />
                  <span className="quick-add-name">{t.name}</span>
                  <span className="quick-add-plus" aria-hidden="true">
                    <Plus size={14} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="list-layout">
        <section className="card full-list">
          <div className="list-title">
            <input
              aria-label="List name"
              value={state.listName}
              maxLength={80}
              onChange={e => {
                if (e.target.value.trim()) props.onRename(e.target.value);
              }}
            />
            <span className="saved-label">
              <CheckCheck size={14} />
              {props.saveStatus}
            </span>
          </div>
          <div className="list-chips" role="toolbar" aria-label="List actions">
            <button className="list-chip" onClick={props.onOpenStarters}>
              <History size={16} /> Start from…
            </button>
            <button className="list-chip" onClick={() => props.onOpenCatalog('paste')}>
              <ClipboardList size={16} /> Paste a list
            </button>
            <button className="list-chip" disabled={!state.items.length} onClick={props.onSaveList}>
              <Bookmark size={16} /> Save list
            </button>
            <button
              className="list-chip"
              aria-label="Clear grocery list"
              disabled={!state.items.length}
              onClick={props.onClear}
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
          {missing > 0 && (
            <div className="inline-warning">
              <Info size={16} />
              {missing} {missing === 1 ? 'item needs' : 'items need'} a match before Aisle can price
              a complete basket.
            </div>
          )}
          {state.items.length ? (
            groups.map(group => (
              <section
                className="list-section"
                key={group.id}
                aria-labelledby={`list-section-${group.id}`}
              >
                <h3 className="list-section-head" id={`list-section-${group.id}`}>
                  {group.name}
                  <span>{group.items.length}</span>
                </h3>
                {group.items.map(i => (
                  <ItemRow key={i.id} item={i} ctx={rowCtx} />
                ))}
              </section>
            ))
          ) : (
            <Empty
              title="Your list is empty"
              action={
                <>
                  <button className="button primary" onClick={() => props.onOpenCatalog('browse')}>
                    <Plus size={16} /> Add items
                  </button>
                  <button className="button secondary" onClick={props.onOpenStarters}>
                    <History size={16} /> Start from a previous list
                  </button>
                </>
              }
            >
              Browse by aisle, paste a list you already have, or reuse a shop you have done before.
            </Empty>
          )}
          <button className="list-add" onClick={() => props.onOpenCatalog('browse')}>
            <Plus size={17} /> Add another item
          </button>
          <div className="list-bottom-note">
            <LockKeyhole size={14} /> Lock a product to keep it out of swap suggestions.
          </div>
        </section>
        <aside className="list-aside">
          <BudgetCard
            budget={props.budget}
            items={state.items.length}
            total={listTotal}
            swapCount={props.swapCount}
            swapSaving={props.swapSaving}
            basketCount={props.basketCount}
            onEditBudget={props.onEditBudget}
            onSwaps={props.onSwaps}
            onCompare={props.onCompare}
          />
          <section className="card list-summary">
            <h3>Your list at a glance</h3>
            <div>
              <span>List items</span>
              <strong>{state.items.length}</strong>
            </div>
            <div>
              <span>Priced by Aisle</span>
              <strong>
                {props.priced
                  ? `${props.priced.priced} of ${props.priced.total}`
                  : 'Not checked yet'}
              </strong>
            </div>
            <div>
              <span>Baskets compared</span>
              <strong>{props.basketCount}</strong>
            </div>
            <div>
              <span>Products locked</span>
              <strong>{state.items.filter(i => i.locked).length}</strong>
            </div>
            <button
              className="button primary full"
              onClick={props.onCompare}
              disabled={!state.items.length}
            >
              Compare my list <ArrowRight size={17} />
            </button>
            <p>Review observed prices and confirm retailer products before comparing.</p>
          </section>
          <div className="quiet-tip">
            <ShieldCheck size={20} />
            <p>Your choices stay yours. We ask before changing anything on your list.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
