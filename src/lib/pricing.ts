import type { SelectedSeat } from '../types/venue';

/** Fixed demo prices; the venue file only carries a tier number. */
const PRICE_BY_TIER: Readonly<Record<number, number>> = {
  1: 50,
  2: 75,
  3: 100,
  4: 150,
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function priceForTier(tier: number): number | undefined {
  return PRICE_BY_TIER[tier];
}

export function formatTierPrice(tier: number): string {
  const price = priceForTier(tier);
  return price === undefined ? 'Price unavailable' : currency.format(price);
}

export function formatAmount(amount: number): string {
  return currency.format(amount);
}

/** Seats with an unknown tier are left out rather than counted as free. */
export function selectionSubtotal(seats: readonly SelectedSeat[]): {
  total: number;
  unpriced: number;
} {
  let total = 0;
  let unpriced = 0;
  for (const seat of seats) {
    const price = priceForTier(seat.priceTier);
    if (price === undefined) unpriced += 1;
    else total += price;
  }
  return { total, unpriced };
}
