import type { Seat, SeatStatus, Section, Venue } from '../types/venue';

export const SEAT_SIZE = 20;

export interface IndexedSeat {
  seat: Seat;
  section: Section;
  rowIndex: number;
  /** Seat centre in map coordinates, after the section transform. */
  mapX: number;
  mapY: number;
}

export interface VenueIndex {
  byId: Map<string, IndexedSeat>;
  /** Seats in document order, used for Home/End and the initial tab stop. */
  ordered: IndexedSeat[];
}

const STATUSES: readonly SeatStatus[] = ['available', 'reserved', 'sold', 'held'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSeat(value: unknown): value is Seat {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isFiniteNumber(value.col) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.priceTier) &&
    STATUSES.includes(value.status as SeatStatus)
  );
}

function isSection(value: unknown): value is Section {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') {
    return false;
  }
  const { transform, rows } = value;
  return (
    isRecord(transform) &&
    isFiniteNumber(transform.x) &&
    isFiniteNumber(transform.y) &&
    isFiniteNumber(transform.scale) &&
    Array.isArray(rows) &&
    rows.every(
      (row) =>
        isRecord(row) &&
        isFiniteNumber(row.index) &&
        Array.isArray(row.seats) &&
        row.seats.every(isSeat)
    )
  );
}

/**
 * The venue file is replaceable, so check its shape once at the boundary
 * instead of letting a typo surface later as NaN coordinates.
 */
export function parseVenue(data: unknown): Venue {
  if (
    !isRecord(data) ||
    typeof data.venueId !== 'string' ||
    typeof data.name !== 'string' ||
    !Array.isArray(data.sections) ||
    !data.sections.every(isSection)
  ) {
    throw new Error('Venue data is not in the expected format');
  }
  return data as unknown as Venue;
}

export function indexVenue(venue: Venue): VenueIndex {
  const byId = new Map<string, IndexedSeat>();
  const ordered: IndexedSeat[] = [];
  for (const section of venue.sections) {
    const { x, y, scale } = section.transform;
    for (const row of section.rows) {
      for (const seat of row.seats) {
        if (byId.has(seat.id)) continue;
        const entry: IndexedSeat = {
          seat,
          section,
          rowIndex: row.index,
          mapX: x + seat.x * scale,
          mapY: y + seat.y * scale,
        };
        byId.set(seat.id, entry);
        ordered.push(entry);
      }
    }
  }
  return { byId, ordered };
}

/** Bounding box of all seats plus room for section labels. */
export function mapViewBox(index: VenueIndex): string {
  if (index.ordered.length === 0) return '0 0 100 100';
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { mapX, mapY, section } of index.ordered) {
    const half = (SEAT_SIZE / 2) * section.transform.scale;
    minX = Math.min(minX, mapX - half);
    maxX = Math.max(maxX, mapX + half);
    minY = Math.min(minY, mapY - half);
    maxY = Math.max(maxY, mapY + half);
  }
  const pad = 24;
  const labelRoom = 30;
  return [
    minX - pad,
    minY - pad - labelRoom,
    maxX - minX + pad * 2,
    maxY - minY + pad * 2 + labelRoom,
  ].join(' ');
}
