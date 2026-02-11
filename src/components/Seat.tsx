import { memo } from 'react';
import { SEAT_SIZE, type IndexedSeat } from '../lib/venue';
import { seatLabel } from '../lib/selection';
import { formatTierPrice } from '../lib/pricing';
import './Seat.css';

interface SeatProps {
  entry: IndexedSeat;
  isSelected: boolean;
  isTabStop: boolean;
}

const HALF = SEAT_SIZE / 2;
const MARK = 5;

/** Non-colour cue for each state, so status does not rely on hue alone. */
function StatusMark({ status, isSelected }: { status: string; isSelected: boolean }) {
  if (isSelected) {
    return <path className="seat-mark" d={`M${-MARK} 0 L${-1.5} ${MARK - 1.5} L${MARK} ${-MARK + 1}`} />;
  }
  if (status === 'sold') {
    return <path className="seat-mark" d={`M${-MARK} ${-MARK} L${MARK} ${MARK} M${MARK} ${-MARK} L${-MARK} ${MARK}`} />;
  }
  if (status === 'reserved') {
    return <path className="seat-mark" d={`M${-MARK} 0 L${MARK} 0`} />;
  }
  if (status === 'held') {
    return <circle className="seat-mark" r={MARK - 1.5} />;
  }
  return null;
}

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
