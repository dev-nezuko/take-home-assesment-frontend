import { createContext } from 'react';
import { Venue, Seat, SelectedSeat } from '../types/venue';
interface SeatSelectionContextType {
  venue: Venue | null;
  selectedSeats: SelectedSeat[];
  selectedSeat: Seat | null;
  setVenue: (venue: Venue) => void;
  selectSeat: (seat: Seat, sectionId: string, rowIndex: number) => void;
  deselectSeat: (seatId: string) => void;
  clearSelection: () => void;
  setSelectedSeat: (seat: Seat | null) => void;
}

export const SeatSelectionContext = createContext<
  SeatSelectionContextType | undefined
>(undefined);

