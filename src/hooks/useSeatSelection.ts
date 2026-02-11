import { useContext } from 'react';
import { SeatSelectionContext } from '../context/selectionState';

export function useSeatSelection() {
  const context = useContext(SeatSelectionContext);
  if (!context) throw new Error('useSeatSelection must be used inside SeatSelectionProvider');
  return context;
}
