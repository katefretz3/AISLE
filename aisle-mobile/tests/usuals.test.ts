// "Your usuals" only ever shows things the household itself gave a reason for.
import test from 'node:test';
import assert from 'node:assert/strict';
import {quickAdds, usualsNotOnList} from '@/lib/usuals';
import {fixtureState} from './fixtures';

test('a staple that is on the list is not offered again', () => {
  const state = fixtureState();
  const onList = state.items.map(i => i.productId).filter(Boolean) as string[];
  const withStaples = {...state, prefs: {...state.prefs, favouriteProducts: onList}};
  assert.deepEqual(usualsNotOnList(withStaples).usuals, []);
  assert.equal(usualsNotOnList(withStaples).alreadyOnList, onList.length);
});

test('a staple taken off the list comes back as a usual, with its reason', () => {
  const state = fixtureState();
  const [first, ...rest] = state.items;
  const staples = state.items.map(i => i.productId).filter(Boolean) as string[];
  const removed = {
    ...state,
    items: rest,
    prefs: {...state.prefs, favouriteProducts: staples},
  };
  const tiles = quickAdds(removed);
  assert.equal(tiles[0].productId, first.productId);
  assert.equal(tiles[0].why, 'A staple you picked');
});

test('with no staples and no history there is nothing to suggest', () => {
  const state = fixtureState();
  const fresh = {
    ...state,
    trips: [],
    events: [],
    prefs: {...state.prefs, favouriteProducts: []},
  };
  assert.deepEqual(quickAdds(fresh), []);
});
