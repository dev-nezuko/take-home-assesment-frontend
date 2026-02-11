import { describe, expect, it } from 'vitest';
import { indexVenue, mapViewBox, nearestSeat, parseVenue } from './venue';
import { testVenue } from '../test/fixtures';

describe('parseVenue', () => {
  it('accepts the bundled shape', () => {
    const venue = testVenue();
    expect(parseVenue(JSON.parse(JSON.stringify(venue)))).toEqual(venue);
  });

  it.each([
    ['null', null],
    ['no sections', { venueId: 'v', name: 'n' }],
    ['a seat without coordinates', { ...testVenue(), sections: [{ ...testVenue().sections[0], rows: [{ index: 1, seats: [{ id: 'a', col: 1, priceTier: 1, status: 'available' }] }] }] }],
    ['an unknown status', { ...testVenue(), sections: [{ ...testVenue().sections[0], rows: [{ index: 1, seats: [{ id: 'a', col: 1, x: 1, y: 1, priceTier: 1, status: 'gone' }] }] }] }],
  ])('rejects %s', (_, data) => {
    expect(() => parseVenue(data)).toThrow('Venue data is not in the expected format');
  });
});

describe('indexVenue', () => {
  it('applies the section transform to seat positions', () => {
    const venue = testVenue();
    venue.sections[1].transform = { x: 100, y: 10, scale: 2 };
    const entry = indexVenue(venue).byId.get('B-1-1');
    expect(entry).toMatchObject({ mapX: 100 + 50 * 2, mapY: 10 + 40 * 2, rowIndex: 1 });
    expect(entry?.section.label).toBe('Balcony');
  });

  it('keeps the first of duplicated seat IDs', () => {
    const venue = testVenue();
    venue.sections[1].rows[0].seats[0].id = 'S-1-1';
    const index = indexVenue(venue);
    expect(index.byId.get('S-1-1')?.section.id).toBe('S');
    expect(index.ordered).toHaveLength(14);
  });
});

describe('mapViewBox', () => {
  it('falls back to a fixed box for a venue without seats', () => {
    expect(mapViewBox(indexVenue({ ...testVenue(), sections: [] }))).toBe('0 0 100 100');
  });

  it('wraps the seat bounds with padding and label room', () => {
    const [x, y, w, h] = mapViewBox(indexVenue(testVenue())).split(' ').map(Number);
    expect(x).toBe(50 - 10 - 24);
    expect(y).toBe(40 - 10 - 24 - 30);
    expect(x + w).toBe(260 + 110 + 10 + 24);
    expect(y + h).toBe(70 + 10 + 24);
  });
});

describe('nearestSeat', () => {
  const index = indexVenue(testVenue());

  it('moves along a row and down a column', () => {
    expect(nearestSeat(index, 'S-1-1', 'right')).toBe('S-1-2');
    expect(nearestSeat(index, 'S-1-2', 'down')).toBe('S-2-2');
    expect(nearestSeat(index, 'S-2-2', 'up')).toBe('S-1-2');
    expect(nearestSeat(index, 'S-1-2', 'left')).toBe('S-1-1');
  });

  it('crosses the aisle into the next section', () => {
    expect(nearestSeat(index, 'S-1-6', 'right')).toBe('B-1-1');
  });

  it('returns null at the edge', () => {
    expect(nearestSeat(index, 'S-1-1', 'left')).toBeNull();
    expect(nearestSeat(index, 'S-1-1', 'up')).toBeNull();
  });
});
