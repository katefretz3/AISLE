// How prices work: where Aisle's prices come from, and what it never does.
// Every sentence here is a claim about the app, so it has to stay true as the
// app changes; tests/pages.test.ts has nothing to check it against.
import {Check, CircleSlash, Globe, Info, Smartphone} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';

const POINTS = [
  {
    icon: Globe,
    t: 'Read from each shop’s website',
    d: 'Aisle reads the prices shops publish online, only where it is allowed to. Every price links to the page it came from and expires after a day.',
  },
  {
    icon: CircleSlash,
    t: 'Never estimated',
    d: 'An item without a price stays unpriced, and a basket with gaps is never called the cheapest.',
  },
  {
    icon: Smartphone,
    t: 'Kept on your device',
    d: 'Your lists, preferences and receipts stay on this device. There is no account and no cloud copy.',
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
        <DialogTitle>How prices work</DialogTitle>
        <DialogDescription>
          Where Aisle’s prices come from, and what it never does.
        </DialogDescription>
        <div className="how-steps">
          {POINTS.map(({icon: Icon, t, d}) => (
            <div key={t}>
              <span aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <strong>{t}</strong>
                <p>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="help-data">
          <strong>
            <Info size={15} /> What is not connected
          </strong>
          <p>
            Branch prices, branch stock, live routes and automatic receipt reading are not
            connected. If whoever runs this copy of Aisle has set up a reasoning service, it helps
            match products to your list; otherwise built-in rules do it, and the prices are the same
            either way.{' '}
            {onDevice
              ? 'Everything you save works offline.'
              : 'In a browser, your data is kept in this browser.'}{' '}
            Personalisation uses the preferences you set and, only if you turn learning on, the
            choices you confirm.
          </p>
        </div>
        <button className="button primary full" onClick={() => onOpenChange(false)}>
          Done <Check size={17} />
        </button>
        <p className="help-legal-links">
          <button onClick={legal('privacy')}>Privacy Policy</button>
          <span aria-hidden="true"> · </span>
          <button onClick={legal('terms')}>Terms of Use</button>
          <span aria-hidden="true"> · </span>
          <button onClick={legal('sources')}>Data sources</button>
          <span aria-hidden="true"> · </span>
          <button onClick={legal('accessibility')}>Accessibility</button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
