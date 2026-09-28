// "The Aisle approach": what the app does, and what it does not connect to.
// Every sentence here is a claim about the app, so it has to stay true as the
// app changes; tests/pages.test.ts has nothing to check it against.
import {Check, ShoppingBasket} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';

const STEPS = [
  {
    n: '01',
    t: 'Make your list',
    d: 'Add products, choose sizes, and lock the favourites you don’t want to change.',
  },
  {
    n: '02',
    t: 'Compare complete baskets',
    d: 'See what each retailer’s published prices add up to. An item without a price stays marked as unpriced, and a basket with gaps is never called the cheapest.',
  },
  {
    n: '03',
    t: 'Shop, then reflect',
    d: 'Check off your list and save what you paid. Your spending stays separate from any estimate.',
  },
];

export default function HelpDialog({
  open,
  onOpenChange,
  onLegal,
  onDevice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLegal: (docId: string) => void;
  /** Running in the native app rather than a browser. */
  onDevice: boolean;
}) {
  const legal = (docId: string) => () => {
    onOpenChange(false);
    onLegal(docId);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="help-modal">
        <div className="modal-icon">
          <ShoppingBasket size={26} />
        </div>
        <DialogTitle>A clearer way to shop.</DialogTitle>
        <DialogDescription>
          Aisle helps you compare your whole grocery list and keep control of every choice.
        </DialogDescription>
        <div className="how-steps">
          {STEPS.map(x => (
            <div key={x.n}>
              <span>{x.n}</span>
              <div>
                <strong>{x.t}</strong>
                <p>{x.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="help-data">
          <strong>What Aisle does and does not connect to.</strong>
          <p>
            Aisle reads the public online catalogues it is allowed to read, and every price it shows
            links to the page it came from and expires after a day. Branch prices, branch stock,
            live routes and automatic receipt reading are not connected. If whoever runs this copy
            of Aisle has set up a reasoning service, it helps match products to your list; otherwise
            Aisle matches with built-in rules, and the prices are the same either way.{' '}
            {onDevice
              ? 'Your lists, preferences and receipts are stored on this device and work offline.'
              : 'Your lists, preferences and receipts are stored in this browser.'}{' '}
            There is no account and no cloud copy. Personalisation uses the preferences you set and,
            only if you turn learning on, the choices you confirm.
          </p>
        </div>
        <button className="button primary full" onClick={() => onOpenChange(false)}>
          Got it <Check size={17} />
        </button>
        <p className="help-legal-links">
          <button onClick={legal('privacy')}>Privacy Policy</button>
          <span aria-hidden="true"> · </span>
          <button onClick={legal('terms')}>Terms of Use</button>
          <span aria-hidden="true"> · </span>
          <button onClick={legal('sources')}>Data sources</button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
