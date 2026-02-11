import { vi } from 'vitest';
import type { Seat, SeatStatus, Section, Venue } from '../types/venue';

function seat(sectionId: string, row: number, col: number, y: number, priceTier: number, status: SeatStatus = 'available'): Seat {
  return { id: `${sectionId}-${row}-${col}`, col, x: 20 + col * 30, y, priceTier, status };
}

/**
 * 15 seats, 12 of them available (more than the 8-seat cap):
 * S-1-1..4 available $50, S-1-5 sold, S-1-6 reserved,
 * S-2-1..6 available $75, B-1-1 available $100, B-1-2 held, B-1-3 available
 * with an unknown price tier.
 */
export function testVenue(): Venue {
  const stalls: Section = {
    id: 'S',
    label: 'Stalls',
    transform: { x: 0, y: 0, scale: 1 },
    rows: [
      {
        index: 1,
        seats: [1, 2, 3, 4].map((c) => seat('S', 1, c, 40, 1)).concat(seat('S', 1, 5, 40, 1, 'sold'), seat('S', 1, 6, 40, 1, 'reserved')),
      },
      { index: 2, seats: [1, 2, 3, 4, 5, 6].map((c) => seat('S', 2, c, 70, 2)) },
    ],
  };
  const balcony: Section = {
    id: 'B',
    label: 'Balcony',
    transform: { x: 260, y: 0, scale: 1 },
    rows: [{ index: 1, seats: [seat('B', 1, 1, 40, 3), seat('B', 1, 2, 40, 4, 'held'), seat('B', 1, 3, 40, 9)] }],
  };
  return { venueId: 'test-hall', name: 'Test Hall', map: { width: 600, height: 200 }, sections: [stalls, balcony] };
}

export function largeVenue(rows: number, perRow: number): Venue {
  const section: Section = {
    id: 'L',
    label: 'Arena floor',
    transform: { x: 0, y: 0, scale: 1 },
    rows: Array.from({ length: rows }, (_, r) => ({
      index: r + 1,
      seats: Array.from({ length: perRow }, (_, c) => seat('L', r + 1, c + 1, 40 + r * 30, 1 + ((r + c) % 4))),
    })),
  };
  return { venueId: 'large', name: 'Large Arena', map: { width: perRow * 30, height: rows * 30 }, sections: [section] };
}

export function stubVenueFetch(venue: unknown) {
  const fetchMock = vi.fn(async () => ({ ok: true, status: 200, json: async () => venue }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
