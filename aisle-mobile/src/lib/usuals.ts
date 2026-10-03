// What this household usually buys that is not on the list right now.
//
// Every entry has a reason that comes from the household itself: a staple
// they picked, an item their own trips say is due again, or something they
// have bought or added before (when learning is on). Nothing is suggested
// without one.
import {buildShopperModel} from './agent/memory';
import {personalSuggestions, productById, type UserState} from './catalog';

export type Usual = {productId: string; name: string; why: string};

export function usualsNotOnList(state: UserState, now = Date.now()) {
  const model = buildShopperModel(state, now);
  const onList = new Set(state.items.map(i => i.productId).filter(Boolean));
  const usuals: Usual[] = [];
  let alreadyOnList = 0;
  for (const id of state.prefs.favouriteProducts) {
    const product = productById[id];
    if (!product) continue;
    if (onList.has(id)) {
      alreadyOnList += 1;
      continue;
    }
    usuals.push({productId: id, name: product.name, why: 'A staple you picked'});
  }
  for (const due of model.replenishment) {
    if (!due.due || usuals.some(u => u.productId === due.productId)) continue;
    if (onList.has(due.productId)) {
      alreadyOnList += 1;
      continue;
    }
    const product = productById[due.productId];
    if (product)
      usuals.push({
        productId: due.productId,
        name: product.name,
        why: `Usually every ${due.intervalDays} days · ${due.daysSince} since`,
      });
  }
  return {usuals: usuals.slice(0, 24), alreadyOnList};
}

/** Usuals, then things the household has bought or added before. */
export function quickAdds(state: UserState, limit = 12, now = Date.now()): Usual[] {
  const rows = usualsNotOnList(state, now).usuals;
  for (const s of personalSuggestions(state, now))
    if (!rows.some(r => r.productId === s.product.id))
      rows.push({productId: s.product.id, name: s.product.name, why: s.why});
  return rows.slice(0, limit);
}
