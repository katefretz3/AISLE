'use client';
// Hierarchical catalogue browser: Department → Aisle → Item.
//
// The way someone looks for something in a shop (walk to Produce, find the
// fruit, pick up blueberries), with a search box that cuts through all three
// levels when they already know what they want.
import {useMemo, useState} from 'react';
import {ArrowLeft, Check, ChevronRight, Plus, Search, X} from 'lucide-react';
import {
  DEPARTMENTS,
  itemsInAisle,
  searchItems,
  type Aisle,
  type CatalogueItem,
  type Department,
} from '@/lib/taxonomy';
import {aisleGlyph, departmentGlyph} from '@/lib/product-glyph';
import {ProductArt} from './product-art';
import './category-browser.css';

type Props = {
  onPick: (id: string) => void;
  /** Ids already on the list, shown with a tick instead of a plus. */
  picked?: Set<string>;
  /** "match" narrows the copy for replacing one unmatched line. */
  mode?: 'add' | 'match';
  /** Optional filter, used by onboarding to offer food only. */
  include?: (item: CatalogueItem) => boolean;
};

function ItemButton({
  item,
  chosen,
  mode,
  trail = false,
  onPick,
}: {
  item: CatalogueItem;
  chosen: boolean;
  mode: 'add' | 'match';
  trail?: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`browse-item${chosen ? ' is-picked' : ''}`}
      onClick={() => onPick(item.id)}
      aria-pressed={chosen}
      aria-label={`${mode === 'match' ? 'Match' : 'Add'} ${item.name}, ${item.brand}, ${item.size}`}
    >
      <ProductArt id={item.id} item={item} />
      <span className="browse-item-copy">
        <strong>{item.name}</strong>
        <small>
          {item.brand} · {item.size}
        </small>
        {trail && (
          <small className="browse-trail">
            {item.department} · {item.aisle}
          </small>
        )}
      </span>
      <span className="browse-item-action" aria-hidden="true">
        {chosen ? <Check size={18} /> : <Plus size={18} />}
      </span>
    </button>
  );
}

export default function CategoryBrowser({
  onPick,
  picked = new Set(),
  mode = 'add',
  include,
}: Props) {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState<Department | null>(null);
  const [aisle, setAisle] = useState<Aisle | null>(null);

  const allow = useMemo(() => include ?? (() => true), [include]);
  const departments = useMemo(
    () =>
      DEPARTMENTS.map(d => ({
        ...d,
        aisles: d.aisles
          .map(a => ({...a, items: itemsInAisle(a.id).filter(allow)}))
          .filter(a => a.items.length),
      })).filter(d => d.aisles.length),
    [allow],
  );

  const results = useMemo(
    () => (query.trim() ? searchItems(query, 80).filter(allow) : []),
    [query, allow],
  );
  const counted = (items: CatalogueItem[]) => items.filter(i => picked.has(i.id)).length;
  const onList = (items: CatalogueItem[]) =>
    counted(items) ? ` · ${counted(items)} on your list` : '';

  function back() {
    if (aisle) setAisle(null);
    else setDepartment(null);
  }

  return (
    <div className="category-browser">
      <label className="browse-search">
        <Search size={19} aria-hidden="true" />
        <input
          aria-label="Search groceries"
          autoComplete="off"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search groceries"
        />
        {query && (
          <button
            type="button"
            className="browse-clear"
            aria-label="Clear search"
            onClick={() => setQuery('')}
          >
            <X size={16} />
          </button>
        )}
      </label>

      <div className="browse-panel">
        {query.trim() ? (
          <>
            <p className="browse-meta" role="status">
              {results.length
                ? `${results.length} ${results.length === 1 ? 'match' : 'matches'}`
                : 'No match'}
            </p>
            {results.length ? (
              <div className="browse-items">
                {results.map(item => (
                  <ItemButton
                    key={item.id}
                    item={item}
                    chosen={picked.has(item.id)}
                    mode={mode}
                    trail
                    onPick={onPick}
                  />
                ))}
              </div>
            ) : (
              <p className="browse-empty">
                No groceries match “{query}”. To add it anyway, use Paste a list. Aisle leaves your
                own items unpriced.
              </p>
            )}
          </>
        ) : !department ? (
          <div className="dept-grid">
            {departments.map(d => {
              const Glyph = departmentGlyph(d.id);
              const items = d.aisles.flatMap(a => a.items);
              return (
                <button
                  type="button"
                  key={d.id}
                  className={`dept-tile dept-${d.id}`}
                  onClick={() => {
                    setDepartment(d);
                    setAisle(null);
                  }}
                >
                  <span className="dept-tile-glyph" aria-hidden="true">
                    <Glyph />
                  </span>
                  <strong>{d.name}</strong>
                  <small>
                    {items.length} items{onList(items)}
                  </small>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="browse-head">
              <button
                type="button"
                className="browse-back"
                onClick={back}
                aria-label={aisle ? `Back to ${department.name}` : 'Back to all departments'}
              >
                <ArrowLeft size={19} />
              </button>
              <div>
                <small>{aisle ? department.name : 'All departments'}</small>
                <strong>{aisle ? aisle.name : department.name}</strong>
              </div>
            </div>
            {aisle ? (
              <div className="browse-items">
                {aisle.items.map(item => (
                  <ItemButton
                    key={item.id}
                    item={item}
                    chosen={picked.has(item.id)}
                    mode={mode}
                    onPick={onPick}
                  />
                ))}
              </div>
            ) : (
              <div className="aisle-list">
                {department.aisles.map(a => {
                  const Glyph = aisleGlyph(a.id, department.id);
                  return (
                    <button
                      type="button"
                      key={a.id}
                      className="aisle-row"
                      onClick={() => setAisle(a)}
                    >
                      <span className={`aisle-glyph dept-${department.id}`} aria-hidden="true">
                        <Glyph />
                      </span>
                      <span className="aisle-row-copy">
                        <strong>{a.name}</strong>
                        <small>
                          {a.items.length} items{onList(a.items)}
                        </small>
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
