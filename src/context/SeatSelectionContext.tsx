import { SeatSelectionContext } from './selectionState';
import React, { useState, useCallback, useEffect } from 'react';
import { Venue, Seat, SelectedSeat } from '../types/venue';

export function SeatSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [restoredVenue, setRestoredVenue] = useState<string | null>(null);
  useEffect(() => {
    if (!venue) return;
    const restored: SelectedSeat[] = [];
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(`selectedSeats:${venue.venueId}`) || '[]');
      if (Array.isArray(raw)) {
        const ids = new Set(raw.filter((item): item is { seatId: string } => !!item && typeof item === 'object' && typeof item.seatId === 'string').map(item => item.seatId));
        for (const section of venue.sections) for (const row of section.rows) for (const seat of row.seats) {
          if (restored.length < 8 && ids.has(seat.id) && seat.status === 'available') restored.push({ seatId: seat.id, sectionId: section.id, rowIndex: row.index, col: seat.col, priceTier: seat.priceTier });
        }
      }
    } catch { /* Selection still works if storage is unavailable or malformed. */ }
    setSelectedSeats(restored);
    setRestoredVenue(venue.venueId);
  }, [venue]);
  useEffect(() => {
    if (!venue || restoredVenue !== venue.venueId) return;
    try { localStorage.setItem(`selectedSeats:${venue.venueId}`, JSON.stringify(selectedSeats)); } catch { /* Browsing is usable without persistent storage. */ }
  }, [venue, restoredVenue, selectedSeats]);

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
      }}
    >
      {children}
    </SeatSelectionContext.Provider>
  );
}
