import { createContext } from 'react';
import type { SelectedSeat, Venue } from '../types/venue';
import type { VenueIndex } from '../lib/venue';

export interface SeatSelectionContextValue {
  venue: Venue | null;
  index: VenueIndex | null;
  selectedSeats: SelectedSeat[];
  selectedIds: ReadonlySet<string>;
  focusedSeatId: string | null;
  notice: string;
  loadVenue: (venue: Venue) => void;
  toggleSeat: (seatId: string) => void;
  removeSeat: (seatId: string) => void;
  clearSelection: () => void;
  focusSeat: (seatId: string | null) => void;
}

export const SeatSelectionContext = createContext<SeatSelectionContextValue | undefined>(
  undefined
);
