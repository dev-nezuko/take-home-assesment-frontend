import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { SeatSelectionContext, type SeatSelectionContextValue } from './selectionState';
import {
  initialSelectionState,
  restoreSelection,
  selectionReducer,
  storageKey,
} from '../lib/selection';
import { indexVenue } from '../lib/venue';
import type { SelectedSeat, Venue } from '../types/venue';

// Storage can throw (private mode, blocked cookies); the picker must still work.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, seats: SelectedSeat[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(seats));
  } catch {
    // Quota or access errors only cost persistence, not selection.
  }
}

export function SeatSelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(selectionReducer, initialSelectionState);
  const { venue, index, selected, focusedSeatId, notice } = state;

  const loadVenue = useCallback((next: Venue) => {
    const nextIndex = indexVenue(next);
    const restored = restoreSelection(readStorage(storageKey(next.venueId)), nextIndex);
    dispatch({ type: 'venueLoaded', venue: next, index: nextIndex, restored });
  }, []);

  useEffect(() => {
    if (venue) writeStorage(storageKey(venue.venueId), selected);
  }, [venue, selected]);

  const toggleSeat = useCallback((seatId: string) => dispatch({ type: 'toggle', seatId }), []);
  const removeSeat = useCallback((seatId: string) => dispatch({ type: 'remove', seatId }), []);
  const clearSelection = useCallback(() => dispatch({ type: 'clear' }), []);
  const focusSeat = useCallback(
    (seatId: string | null) => dispatch({ type: 'focus', seatId }),
    []
  );

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.seatId)), [selected]);

  const value = useMemo<SeatSelectionContextValue>(
    () => ({
      venue,
      index,
      selectedSeats: selected,
      selectedIds,
      focusedSeatId,
      notice,
      loadVenue,
      toggleSeat,
      removeSeat,
      clearSelection,
      focusSeat,
    }),
    [venue, index, selected, selectedIds, focusedSeatId, notice, loadVenue, toggleSeat, removeSeat, clearSelection, focusSeat]
  );

  return <SeatSelectionContext.Provider value={value}>{children}</SeatSelectionContext.Provider>;
}
