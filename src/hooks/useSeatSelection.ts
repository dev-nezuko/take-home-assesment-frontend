import { useEffect } from 'react';
import { useSeatSelection as useContext } from '../context/SeatSelectionContext';
import { SelectedSeat } from '../types/venue';

const STORAGE_KEY = 'selectedSeats';
const MAX_SELECTION = 8;

export function useSeatSelection() {
  const context = useContext();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SelectedSeat[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length <= MAX_SELECTION) {
          context.restoreSelection(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load selection from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (context.selectedSeats.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(context.selectedSeats));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save selection to localStorage:', error);
    }
  }, [context.selectedSeats]);

  return {
    ...context,
    maxSelection: MAX_SELECTION,
    canSelectMore: context.selectedSeats.length < MAX_SELECTION,
  };
}
