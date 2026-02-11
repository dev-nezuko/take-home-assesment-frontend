import { useSeatSelection } from '../hooks/useSeatSelection';
import { formatTierPrice } from '../lib/pricing';
import './SeatDetails.css';

export function SeatDetails() {
  const { index, focusedSeatId, selectedIds } = useSeatSelection();
  const entry = focusedSeatId ? index?.byId.get(focusedSeatId) : undefined;

  if (!entry) {
    return (
      <div className="seat-details">
        <p className="seat-details-placeholder">Hover, click or focus a seat to see its section, row and price.</p>
      </div>
    );
  }

  const { seat, section, rowIndex } = entry;
  return (
    <div className="seat-details" role="region" aria-label="Seat details">
      <h3 className="seat-details-title">Seat details</h3>
      <dl className="seat-details-list">
        <div className="seat-details-item">
          <dt>Seat</dt>
          <dd>{seat.id}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Section</dt>
          <dd>{section.label}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Row</dt>
          <dd>{rowIndex}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Number</dt>
          <dd>{seat.col}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Price</dt>
          <dd>
            {formatTierPrice(seat.priceTier)} (tier {seat.priceTier})
          </dd>
        </div>
        <div className="seat-details-item">
          <dt>Status</dt>
          <dd>
            <span className={`status-badge status-${selectedIds.has(seat.id) ? 'selected' : seat.status}`}>
              {selectedIds.has(seat.id) ? 'selected' : seat.status}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
