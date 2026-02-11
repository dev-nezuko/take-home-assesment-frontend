import type { SelectedSeat, Venue } from '../types/venue';
import type { IndexedSeat, VenueIndex } from './venue';

export const MAX_SELECTION = 8;

export function storageKey(venueId: string): string {
  return `selectedSeats:${venueId}`;
}

export function seatLabel({ seat, section, rowIndex }: IndexedSeat): string {
  return `${section.label}, row ${rowIndex}, seat ${seat.col}`;
}

function toSelectedSeat({ seat, section, rowIndex }: IndexedSeat): SelectedSeat {
  return {
    seatId: seat.id,
    sectionId: section.id,
    rowIndex,
    col: seat.col,
    priceTier: seat.priceTier,
  };
}

/**
 * Rebuild a saved selection from the venue, keeping only IDs that still exist
 * and are available. Prices and positions always come from the venue, never
 * from storage, so an edited localStorage entry cannot change a price.
 */
export function restoreSelection(raw: string | null, index: VenueIndex): SelectedSeat[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const restored: SelectedSeat[] = [];
  const seen = new Set<string>();
  for (const item of parsed) {
    if (restored.length >= MAX_SELECTION) break;
    const seatId =
      typeof item === 'object' && item !== null && 'seatId' in item ? item.seatId : undefined;
    if (typeof seatId !== 'string' || seen.has(seatId)) continue;
    seen.add(seatId);
    const entry = index.byId.get(seatId);
    if (entry && entry.seat.status === 'available') restored.push(toSelectedSeat(entry));
  }
  return restored;
}

export interface SelectionState {
  venue: Venue | null;
  index: VenueIndex | null;
  selected: SelectedSeat[];
  focusedSeatId: string | null;
  /** Last outcome, announced through a polite live region. */
  notice: string;
}

export type SelectionAction =
  | { type: 'venueLoaded'; venue: Venue; index: VenueIndex; restored: SelectedSeat[] }
  | { type: 'toggle'; seatId: string }
  | { type: 'remove'; seatId: string }
  | { type: 'clear' }
  | { type: 'focus'; seatId: string | null };

export const initialSelectionState: SelectionState = {
  venue: null,
  index: null,
  selected: [],
  focusedSeatId: null,
  notice: '',
};

function countText(count: number): string {
  return `${count} of ${MAX_SELECTION} seats selected.`;
}

export function selectionReducer(
  state: SelectionState,
  action: SelectionAction
): SelectionState {
  switch (action.type) {
    case 'venueLoaded':
      return {
        ...initialSelectionState,
        venue: action.venue,
        index: action.index,
        selected: action.restored,
      };

    case 'toggle': {
      const entry = state.index?.byId.get(action.seatId);
      if (!entry) return state;
      const label = seatLabel(entry);
      const base = { ...state, focusedSeatId: action.seatId };

      if (state.selected.some((s) => s.seatId === action.seatId)) {
        const selected = state.selected.filter((s) => s.seatId !== action.seatId);
        return { ...base, selected, notice: `Removed ${label}. ${countText(selected.length)}` };
      }
      if (entry.seat.status !== 'available') {
        return { ...base, notice: `${label} is ${entry.seat.status} and cannot be selected.` };
      }
      if (state.selected.length >= MAX_SELECTION) {
        return {
          ...base,
          notice: `You can hold up to ${MAX_SELECTION} seats. Remove one before adding ${label}.`,
        };
      }
      const selected = [...state.selected, toSelectedSeat(entry)];
      return { ...base, selected, notice: `Added ${label}. ${countText(selected.length)}` };
    }

    case 'remove': {
      if (!state.selected.some((s) => s.seatId === action.seatId)) return state;
      const selected = state.selected.filter((s) => s.seatId !== action.seatId);
      const entry = state.index?.byId.get(action.seatId);
      const label = entry ? seatLabel(entry) : action.seatId;
      return { ...state, selected, notice: `Removed ${label}. ${countText(selected.length)}` };
    }

    case 'clear':
      if (state.selected.length === 0) return state;
      return { ...state, selected: [], notice: 'Selection cleared.' };

    case 'focus':
      if (state.focusedSeatId === action.seatId) return state;
      return { ...state, focusedSeatId: action.seatId };
  }
}
