import { describe, expect, it } from 'vitest';
import { formatAmount, formatTierPrice, priceForTier, selectionSubtotal } from './pricing';
import type { SelectedSeat } from '../types/venue';

const pick = (priceTier: number, seatId = `x-${priceTier}`): SelectedSeat => ({
  seatId,
  sectionId: 'S',
  rowIndex: 1,
  col: 1,
  priceTier,
});

describe('pricing', () => {
  it('maps the four demo tiers', () => {
    expect([1, 2, 3, 4].map(priceForTier)).toEqual([50, 75, 100, 150]);
    expect(priceForTier(0)).toBeUndefined();
  });

  it('formats tier prices and flags unknown tiers', () => {
    expect(formatTierPrice(4)).toBe('$150');
    expect(formatTierPrice(9)).toBe('Price unavailable');
    expect(formatAmount(1200)).toBe('$1,200');
  });

  it('sums a selection and counts seats without a price', () => {
    expect(selectionSubtotal([])).toEqual({ total: 0, unpriced: 0 });
    expect(selectionSubtotal([pick(1), pick(2, 'a'), pick(2, 'b'), pick(4)])).toEqual({
      total: 350,
      unpriced: 0,
    });
    expect(selectionSubtotal([pick(3), pick(7)])).toEqual({ total: 100, unpriced: 1 });
  });
});
