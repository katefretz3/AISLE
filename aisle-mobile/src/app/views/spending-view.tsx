// My spending: what the household recorded paying, and how Aisle's estimates
// compared with the till. Every figure here comes from a saved trip.
import {
  ChevronRight,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Upload,
  Wallet,
} from 'lucide-react';
import {StoreLogo} from '@/components/store-logo';
import {money, type Store, type Trip} from '@/lib/catalog';
import {AccuracyCard} from '../home-cards';
import {Empty, Pill} from '../parts';

export default function SpendingView({
  trips,
  perShopBudget,
  shopIdentity,
  onAddReceipt,
  onOpenTrip,
}: {
  trips: Trip[];
  perShopBudget: number;
  shopIdentity: (id: string, fallbackName?: string) => Store;
  onAddReceipt: () => void;
  onOpenTrip: (trip: Trip) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">A LITTLE MORE CLARITY</span>
          <h1>Your grocery spending</h1>
          <p>Make sense of your shops, one receipt at a time.</p>
        </div>
        <button className="button primary" onClick={onAddReceipt}>
          <Plus size={17} /> Add a receipt
        </button>
      </div>
      {trips.length > 0 && (
        <div className="spending-stats">
          <div className="card metric">
            <span>
              <Wallet size={18} /> Recorded spending
            </span>
            <strong>{money(trips.reduce((sum, t) => sum + t.total, 0))}</strong>
            <p>
              Across {trips.length} saved {trips.length === 1 ? 'trip' : 'trips'}
            </p>
          </div>
          <div className="card metric">
            <span>
              <ShoppingBag size={18} /> Average shop
            </span>
            <strong>
              {money(Math.round(trips.reduce((sum, t) => sum + t.total, 0) / trips.length))}
            </strong>
            <p>From the totals you entered</p>
          </div>
          <div className="card metric">
            <span>
              <Wallet size={18} /> Against your budget
            </span>
            <strong>
              {(() => {
                const avg = Math.round(trips.reduce((sum, t) => sum + t.total, 0) / trips.length);
                const diff = avg - perShopBudget;
                return diff === 0
                  ? 'On budget'
                  : `${money(Math.abs(diff))} ${diff > 0 ? 'over' : 'under'}`;
              })()}
            </strong>
            <p>Average shop vs your {money(perShopBudget)} per-shop budget</p>
          </div>
        </div>
      )}
      <AccuracyCard
        trips={trips}
        shopName={trip => shopIdentity(trip.storeId, trip.storeName).name}
      />
      <section className="card history-card">
        <div className="section-top">
          <h3>Your shopping history</h3>
          <Pill kind="neutral">{trips.length} receipts</Pill>
        </div>
        {trips.length ? (
          <div>
            {trips.map(t => {
              const s = shopIdentity(t.storeId, t.storeName);
              return (
                <button className="history-row" key={t.id} onClick={() => onOpenTrip(t)}>
                  <StoreLogo store={s} />
                  <div>
                    <strong>{s.name}</strong>
                    <span>
                      {new Date(t.date + 'T12:00:00').toLocaleDateString('en-CA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      · {t.receiptId ? 'Receipt attached' : 'Manual entry'}
                    </span>
                  </div>
                  <strong>{money(t.total)}</strong>
                  <ChevronRight size={17} />
                </button>
              );
            })}
          </div>
        ) : (
          <Empty
            icon={ReceiptText}
            title="No shops recorded yet"
            action={
              <button className="button secondary" onClick={onAddReceipt}>
                <Upload size={16} /> Record a shop
              </button>
            }
          >
            After a shop, enter what you actually paid. Aisle compares that against your budget — it
            is the only figure here it does not have to guess at.
          </Empty>
        )}
      </section>
      <div className="transparency-note">
        <ShieldCheck size={21} />
        <div>
          <strong>A receipt proves what you paid.</strong>
          <p>
            It doesn’t prove what another store would have charged. We’ll only call savings verified
            when both sides have reliable, same-day prices for the same products.
          </p>
        </div>
      </div>
    </>
  );
}
