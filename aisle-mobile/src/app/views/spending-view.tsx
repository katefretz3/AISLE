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
          <h1>Spending</h1>
          <p>
            {trips.length
              ? `${trips.length} ${trips.length === 1 ? 'shop' : 'shops'} recorded, from your own receipts`
              : 'What you paid, from your own receipts'}
          </p>
        </div>
        <button className="button primary" onClick={onAddReceipt}>
          <Plus size={17} /> Add a receipt
        </button>
      </div>
      {trips.length > 0 && (
        <div className="spending-stats">
          <div className="card metric is-lead">
            <span>
              <Wallet size={18} /> Recorded spending
            </span>
            <strong>{money(trips.reduce((sum, t) => sum + t.total, 0))}</strong>
            <p>
              Across {trips.length} {trips.length === 1 ? 'shop' : 'shops'}
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
            <p>Average shop compared with your {money(perShopBudget)} budget</p>
          </div>
        </div>
      )}
      <AccuracyCard
        trips={trips}
        shopName={trip => shopIdentity(trip.storeId, trip.storeName).name}
      />
      <section className="card history-card">
        <div className="section-top">
          <h3>History</h3>
          <Pill kind="neutral">
            {trips.length} {trips.length === 1 ? 'receipt' : 'receipts'}
          </Pill>
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
                      · {t.receiptId ? 'Receipt photo' : 'Entered by hand'}
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
              <button className="button primary" onClick={onAddReceipt}>
                <Upload size={16} /> Add a receipt
              </button>
            }
          >
            After you shop, add what you paid. Your history and budget tracking start from there.
          </Empty>
        )}
      </section>
      <div className="transparency-note">
        <ShieldCheck size={20} />
        <div>
          <strong>A receipt shows what you paid</strong>
          <p>
            It cannot show what another shop would have charged, so Aisle never claims a saving from
            one.
          </p>
        </div>
      </div>
    </>
  );
}
