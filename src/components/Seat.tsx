import { memo } from 'react';
import type { SeatStatus } from '../types/venue';
import { SEAT_SIZE, type IndexedSeat } from '../lib/venue';
import { seatLabel } from '../lib/selection';
import { formatTierPrice } from '../lib/pricing';
import './Seat.css';

interface SeatProps {
  entry: IndexedSeat;
  isSelected: boolean;
}

const statusColors: Record<SeatStatus, string> = {
  available: '#4CAF50',
  reserved: '#FF9800',
  sold: '#F44336',
  held: '#9E9E9E',
};

// Event handlers live on the parent <svg>; props here are only data, so
// React.memo skips every seat whose selection state did not change.
function SeatComponent({ entry, isSelected }: SeatProps) {
  const { seat } = entry;
  const isInteractive = seat.status === 'available';

  return (
    <g
      className={`seat ${isInteractive ? 'seat-interactive' : ''} ${isSelected ? 'seat-selected' : ''}`}
      data-seat-id={seat.id}
      tabIndex={isInteractive ? 0 : -1}
      role={isInteractive ? 'button' : undefined}
      aria-pressed={isInteractive ? isSelected : undefined}
      aria-label={`${seatLabel(entry)}, ${formatTierPrice(seat.priceTier)}, ${seat.status}`}
    >
      <rect
        x={seat.x - SEAT_SIZE / 2}
        y={seat.y - SEAT_SIZE / 2}
        width={SEAT_SIZE}
        height={SEAT_SIZE}
        rx={3}
        fill={isSelected ? '#2196F3' : statusColors[seat.status]}
        stroke={isSelected ? '#1976D2' : '#333'}
        strokeWidth={isSelected ? 2 : 1}
      />
    </g>
  );
}

export const Seat = memo(SeatComponent);
