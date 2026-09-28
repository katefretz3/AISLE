// Small presentational pieces shared by the app shell and its views.
//
// These used to be declared inside AisleApp. A component declared inside
// another component's body is a new type on every render, so React threw away
// and rebuilt it each time: focus moved off a button after one press, and
// every row redrew on every keystroke anywhere in the app.
import type {ReactNode} from 'react';
import {ShoppingBasket} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {productImagePath, type Product} from '@/lib/catalog';

export const cx = (...v: (string | false | null | undefined)[]) => v.filter(Boolean).join(' ');

export function newId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}

export function ProductIcon({product, small = false}: {product?: Product | null; small?: boolean}) {
  return (
    <span className={cx('product-art', small && 'small', !product && 'unknown')}>
      <img src={productImagePath(product?.id)} alt="" loading="lazy" decoding="async" />
    </span>
  );
}

export function Pill({children, kind = 'green'}: {children: ReactNode; kind?: string}) {
  return <span className={`pill pill-${kind}`}>{children}</span>;
}

export function Choice({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: {value: string; label: string}[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(o => (
          <SelectItem value={o.value} key={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function Empty({
  icon: Icon = ShoppingBasket,
  title,
  children,
  action,
}: {
  icon?: typeof ShoppingBasket;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
