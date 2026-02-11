import { memo } from 'react';
import { SEAT_SIZE, type IndexedSeat } from '../lib/venue';
import { seatLabel } from '../lib/selection';
import { formatTierPrice } from '../lib/pricing';
import { StatusMark } from './StatusMark';
import './Seat.css';

interface SeatProps {
  entry: IndexedSeat;
  isSelected: boolean;
  isTabStop: boolean;
}

const HALF = SEAT_SIZE / 2;
// Event handlers live on the parent <svg>; props here are only data, so
// React.memo skips every seat whose selection or tab-stop state is unchanged.
function SeatComponent({ entry, isSelected, isTabStop }: SeatProps) {
  const { seat } = entry;
  const isAvailable = seat.status === 'available';
  const label = `${seatLabel(entry)}, ${formatTierPrice(seat.priceTier)}, ${isSelected ? 'selected' : seat.status}`;

  return (
    <g
      className={`seat seat-${seat.status}${isSelected ? ' seat-selected' : ''}`}
      transform={`translate(${seat.x} ${seat.y})`}
      data-seat-id={seat.id}
      role="button"
      tabIndex={isTabStop ? 0 : -1}
      aria-label={label}
      aria-pressed={isAvailable ? isSelected : undefined}
      aria-disabled={isAvailable ? undefined : true}
    >
      <rect className="seat-focus-ring" x={-HALF - 4} y={-HALF - 4} width={SEAT_SIZE + 8} height={SEAT_SIZE + 8} rx={6} />
      <rect className="seat-shape" x={-HALF} y={-HALF} width={SEAT_SIZE} height={SEAT_SIZE} rx={4} />
      <StatusMark status={seat.status} isSelected={isSelected} />
    </g>
  );
}

export const Seat = memo(SeatComponent);
