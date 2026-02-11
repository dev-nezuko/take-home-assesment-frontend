import React, { createContext, useContext, useState, useCallback } from 'react';
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
  restoreSelection: (seats: SelectedSeat[]) => void;
}

const SeatSelectionContext = createContext<
  SeatSelectionContextType | undefined
>(undefined);

export function SeatSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const selectSeat = useCallback(
    (seat: Seat, sectionId: string, rowIndex: number) => {
      if (seat.status !== 'available') {
        return;
      }

      setSelectedSeats((prev) => {
        if (prev.some((s) => s.seatId === seat.id)) {
          return prev;
        }

        if (prev.length >= 8) {
          return prev;
        }

        const newSelection: SelectedSeat = {
          seatId: seat.id,
          sectionId,
          rowIndex,
          col: seat.col,
          priceTier: seat.priceTier,
        };

        return [...prev, newSelection];
      });
    },
    []
  );

  const deselectSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seatId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const restoreSelection = useCallback((seats: SelectedSeat[]) => {
    setSelectedSeats(seats);
  }, []);

  return (
    <SeatSelectionContext.Provider
      value={{
        venue,
        selectedSeats,
        selectedSeat,
        setVenue,
        selectSeat,
        deselectSeat,
        clearSelection,
        setSelectedSeat,
        restoreSelection,
      }}
    >
      {children}
    </SeatSelectionContext.Provider>
  );
}

export function useSeatSelection() {
  const context = useContext(SeatSelectionContext);
  if (context === undefined) {
    throw new Error(
      'useSeatSelection must be used within a SeatSelectionProvider'
    );
  }
  return context;
}
