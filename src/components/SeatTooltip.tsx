import type { IndexedSeat } from '../lib/venue';
import { formatTierPrice } from '../lib/pricing';
import './SeatTooltip.css';

interface SeatTooltipProps {
  entry: IndexedSeat;
  x: number;
  y: number;
  position: 'above' | 'below';
}

export function SeatTooltip({ entry, x, y, position }: SeatTooltipProps) {
  const { seat, section, rowIndex } = entry;
  return (
    <div
      className={`seat-tooltip seat-tooltip-${position}`}
      style={{ left: `${x}px`, top: `${y}px` }}
      aria-hidden="true"
    >
      <div className="seat-tooltip-content">
        <div className="seat-tooltip-header">
          <strong>{seat.id}</strong>
        </div>
        <div className="seat-tooltip-body">
          <div className="seat-tooltip-row">
            <span className="seat-tooltip-label">Section:</span>
            <span className="seat-tooltip-value">{section.label}</span>
          </div>
          <div className="seat-tooltip-row">
            <span className="seat-tooltip-label">Row:</span>
            <span className="seat-tooltip-value">{rowIndex}</span>
          </div>
          <div className="seat-tooltip-row">
            <span className="seat-tooltip-label">Column:</span>
            <span className="seat-tooltip-value">{seat.col}</span>
          </div>
          <div className="seat-tooltip-row">
            <span className="seat-tooltip-label">Status:</span>
            <span className={`seat-tooltip-status seat-tooltip-status-${seat.status}`}>
              {seat.status}
            </span>
          </div>
          <div className="seat-tooltip-row">
            <span className="seat-tooltip-label">Price:</span>
            <span className="seat-tooltip-value">{formatTierPrice(seat.priceTier)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
