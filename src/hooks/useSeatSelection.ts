import { useContext } from 'react';
import { SeatSelectionContext } from '../context/selectionState';
export function useSeatSelection() {
  const context = useContext(SeatSelectionContext);
  if (!context) throw new Error('Seat selection requires its provider');
  return { ...context, maxSelection: 8, canSelectMore: context.selectedSeats.length < 8 };
}
