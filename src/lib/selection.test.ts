import { describe, expect, it } from 'vitest';
import {
  MAX_SELECTION,
  initialSelectionState,
  restoreSelection,
  selectionReducer,
  type SelectionState,
} from './selection';
import { indexVenue } from './venue';
import { largeVenue, testVenue } from '../test/fixtures';

function loaded(venue = testVenue()): SelectionState {
  return selectionReducer(initialSelectionState, {
    type: 'venueLoaded',
    venue,
    index: indexVenue(venue),
    restored: [],
  });
}

function toggleAll(state: SelectionState, ids: string[]): SelectionState {
  return ids.reduce((s, seatId) => selectionReducer(s, { type: 'toggle', seatId }), state);
}

describe('selectionReducer', () => {
  it('adds a seat with section, row and tier taken from the venue', () => {
    const state = toggleAll(loaded(), ['S-2-3']);
    expect(state.selected).toEqual([
      { seatId: 'S-2-3', sectionId: 'S', rowIndex: 2, col: 3, priceTier: 2 },
    ]);
    expect(state.notice).toBe('Added Stalls, row 2, seat 3. 1 of 8 seats selected.');
  });

  it('toggles a selected seat back off', () => {
    const state = toggleAll(loaded(), ['S-1-1', 'S-1-1']);
    expect(state.selected).toEqual([]);
    expect(state.notice).toMatch(/^Removed Stalls, row 1, seat 1\. 0 of 8/);
  });

  it(`stops at ${MAX_SELECTION} seats and explains why`, () => {
    const nine = ['S-1-1', 'S-1-2', 'S-1-3', 'S-1-4', 'S-2-1', 'S-2-2', 'S-2-3', 'S-2-4', 'S-2-5'];
    const state = toggleAll(loaded(), nine);
    expect(state.selected.map((s) => s.seatId)).toEqual(nine.slice(0, 8));
    expect(state.notice).toBe('You can hold up to 8 seats. Remove one before adding Stalls, row 2, seat 5.');
  });

  it('still allows deselecting at the cap', () => {
    const eight = ['S-1-1', 'S-1-2', 'S-1-3', 'S-1-4', 'S-2-1', 'S-2-2', 'S-2-3', 'S-2-4'];
    const state = toggleAll(loaded(), [...eight, 'S-1-1', 'S-2-5']);
    expect(state.selected).toHaveLength(8);
    expect(state.selected.map((s) => s.seatId)).toContain('S-2-5');
  });

  it.each(['S-1-5', 'S-1-6', 'B-1-2'])('refuses unavailable seat %s', (seatId) => {
    const state = toggleAll(loaded(), [seatId]);
    expect(state.selected).toEqual([]);
    expect(state.notice).toMatch(/is (sold|reserved|held) and cannot be selected\.$/);
  });

  it('ignores unknown seat IDs without changing state', () => {
    const before = loaded();
    expect(selectionReducer(before, { type: 'toggle', seatId: 'nope' })).toBe(before);
  });

  it('removes one seat and clears all', () => {
    let state = toggleAll(loaded(), ['S-1-1', 'S-1-2']);
    state = selectionReducer(state, { type: 'remove', seatId: 'S-1-1' });
    expect(state.selected.map((s) => s.seatId)).toEqual(['S-1-2']);
    state = selectionReducer(state, { type: 'clear' });
    expect(state.selected).toEqual([]);
    expect(state.notice).toBe('Selection cleared.');
  });
});

describe('restoreSelection', () => {
  const index = indexVenue(testVenue());

  it.each([
    ['missing', null],
    ['not JSON', '{oops'],
    ['an object', '{"seatId":"S-1-1"}'],
    ['a string', '"S-1-1"'],
    ['null', 'null'],
  ])('returns nothing for %s storage', (_, raw) => {
    expect(restoreSelection(raw, index)).toEqual([]);
  });

  it('drops unknown, unavailable, duplicate and malformed entries', () => {
    const raw = JSON.stringify([
      { seatId: 'S-1-1' },
      { seatId: 'S-1-1' },
      { seatId: 'S-1-5' },
      { seatId: 'ghost' },
      { seatId: 42 },
      null,
      'S-1-2',
      { seatId: 'B-1-1' },
    ]);
    expect(restoreSelection(raw, index).map((s) => s.seatId)).toEqual(['S-1-1', 'B-1-1']);
  });

  it('rebuilds price tier and position from the venue, not storage', () => {
    const raw = JSON.stringify([{ seatId: 'B-1-1', priceTier: 1, sectionId: 'S', rowIndex: 9, col: 9 }]);
    expect(restoreSelection(raw, index)).toEqual([
      { seatId: 'B-1-1', sectionId: 'B', rowIndex: 1, col: 1, priceTier: 3 },
    ]);
  });

  it('caps a tampered list at the selection limit', () => {
    const big = indexVenue(largeVenue(2, 10));
    const raw = JSON.stringify(big.ordered.map((e) => ({ seatId: e.seat.id })));
    expect(restoreSelection(raw, big)).toHaveLength(MAX_SELECTION);
  });
});
