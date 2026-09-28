import {productById, type ListItem, type UserState} from '../catalog';
import {parsePack} from './collector';
import type {Offer} from './types';
const DAY = 86400000;
export const words = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9% ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => (w.length > 4 ? w.replace(/s$/, '') : w));
const genericBrand = (s: string) => /^(fresh|store brand)/i.test(s);
const hasBrand = (o: Offer, b: string) =>
  words(b).every(w => words(`${o.brand} ${o.title}`).includes(w));
export function requiredPacks(item: ListItem, offer: Offer): number | null {
  const product = item.productId ? productById[item.productId] : undefined;
  if (!product) return item.qty; // Custom items explicitly count the selected retailer pack.
  const wanted = parsePack(product.size);
  if (!wanted || !offer.pack || wanted.unit !== offer.pack.unit || offer.pack.amount <= 0)
    return null;
  return Math.ceil((wanted.amount * item.qty - 0.0001) / offer.pack.amount);
}
export function matchOffer(item: ListItem, offer: Offer, state: UserState, now = Date.now()) {
  const p = item.productId ? productById[item.productId] : undefined;
  const terms = words(p?.name ?? item.name).filter(
    w => !['fresh', 'large', 'original', 'crown', 'boneles'].includes(w),
  );
  const actual = words(offer.title);
  const hit = terms.filter(w => actual.includes(w)).length / Math.max(1, terms.length);
  if (hit < 0.6) return null;
  if (
    p?.category === 'Produce' &&
    /\b(juice|lemonade|oil|mayonnaise|crisp|crisps|spread|jam|yogurt|pierogies|sprout|sprouts|powder|seed|seeds|herbs|plant|plants|superbelly)\b/i.test(
      offer.title,
    )
  )
    return null;
  if (p && state.prefs.excludedProducts.includes(p.id)) return null;
  const brandMatches = !!p && (genericBrand(p.brand) || hasBrand(offer, p.brand));
  if (
    p &&
    (item.locked ||
      state.prefs.preferredBrands.includes(p.brand) ||
      state.prefs.categoryLocks.includes(p.category) ||
      !state.prefs.substitutions) &&
    !brandMatches
  )
    return null;
  const wanted = parsePack(p?.size ?? item.name);
  const sameSize =
    !!wanted &&
    !!offer.pack &&
    wanted.unit === offer.pack.unit &&
    Math.abs(wanted.amount - offer.pack.amount) < 0.01;
  if (item.locked && (!brandMatches || !sameSize || hit < 1)) return null;
  // Names can be ambiguous (apple juice vs apples). Even high scores require an
  // explicit pack confirmation. Never turn semantic similarity into an exact SKU.
  const reason = [
    brandMatches ? 'Brand fits your list' : 'Different brand',
    sameSize ? 'Same listed pack size' : 'Review pack size',
  ];
  let affinity = 0;
  if (state.prefs.learning) {
    const relevant = state.events.filter(
      e =>
        e.category === p?.category &&
        e.brand === offer.brand &&
        ['offer_accepted', 'offer_rejected'].includes(e.action) &&
        Number.isFinite(Date.parse(e.date)) &&
        Date.parse(e.date) <= now,
    );
    let a = 1,
      b = 1;
    for (const e of relevant) {
      const d = Math.exp(-Math.max(0, (now - Date.parse(e.date)) / DAY) / 60);
      if (e.action === 'offer_accepted') a += d;
      else b += d;
    }
    affinity = a / (a + b) - 0.5;
  }
  return {
    offer,
    packs: requiredPacks(item, offer),
    score: hit * 5 + Number(brandMatches) + Number(sameSize) + affinity,
    reason: reason.join(' · '),
    sameSize,
    brandMatches,
  };
}
