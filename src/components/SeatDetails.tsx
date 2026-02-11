import { useSeatSelection } from '../hooks/useSeatSelection';
import { formatTierPrice } from '../lib/pricing';
import './SeatDetails.css';

export function SeatDetails() {
  const { index, focusedSeatId, selectedIds } = useSeatSelection();
  const entry = focusedSeatId ? index?.byId.get(focusedSeatId) : undefined;

  if (!entry) {
    return (
      <div className="seat-details">
        <p className="seat-details-placeholder">Click or focus on a seat to view details</p>
      </div>
    );
  }

  const { seat, section, rowIndex } = entry;
  return (
    <div className="seat-details" role="region" aria-label="Seat details">
      <h3 className="seat-details-title">Seat Information</h3>
      <dl className="seat-details-list">
        <div className="seat-details-item">
          <dt>Seat ID:</dt>
          <dd>{seat.id}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Section:</dt>
          <dd>{section.label}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Row:</dt>
          <dd>{rowIndex}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Column:</dt>
          <dd>{seat.col}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Price Tier:</dt>
          <dd>
            {seat.priceTier} ({formatTierPrice(seat.priceTier)})
          </dd>
        </div>
        <div className="seat-details-item">
          <dt>Status:</dt>
          <dd>
            <span className={`status-badge status-${seat.status}`}>
              {selectedIds.has(seat.id) ? 'in your selection' : seat.status}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
