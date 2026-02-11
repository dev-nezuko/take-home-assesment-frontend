import { useSeatSelection } from '../hooks/useSeatSelection';
import { MAX_SELECTION } from '../lib/selection';
import { formatAmount, formatTierPrice, selectionSubtotal } from '../lib/pricing';
import './SeatSummary.css';

export function SeatSummary() {
  const { selectedSeats, clearSelection, index, notice } = useSeatSelection();
  const { total, unpriced } = selectionSubtotal(selectedSeats);

  return (
    <div className="seat-summary" role="region" aria-label="Selection summary">
      <p className="visually-hidden" role="status" aria-live="polite">
        {notice}
      </p>
      {selectedSeats.length === 0 ? (
        <>
          <h3 className="seat-summary-title">Selection Summary</h3>
          <div className="seat-summary-empty">
            <p>No seats selected</p>
            <p className="seat-summary-hint">
              Select up to {MAX_SELECTION} seats by clicking on available seats
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="seat-summary-header">
            <h3 className="seat-summary-title">
              Selection Summary ({selectedSeats.length}/{MAX_SELECTION})
            </h3>
            <button type="button" className="seat-summary-clear" onClick={clearSelection}>
              Clear all
            </button>
          </div>
          <ul className="seat-summary-list" aria-label="Selected seats">
            {selectedSeats.map((seat) => {
              const section = index?.byId.get(seat.seatId)?.section;
              return (
                <li key={seat.seatId} className="seat-summary-item">
                  <span className="seat-summary-seat-id">{seat.seatId}</span>
                  {section && (
                    <span className="seat-summary-section">
                      {section.label} Row {seat.rowIndex}
                    </span>
                  )}
                  <span className="seat-summary-price">{formatTierPrice(seat.priceTier)}</span>
                </li>
              );
            })}
          </ul>
          <div className="seat-summary-footer">
            <div className="seat-summary-subtotal">
              <span className="seat-summary-subtotal-label">Subtotal:</span>
              <span className="seat-summary-subtotal-amount">{formatAmount(total)}</span>
            </div>
            {unpriced > 0 && (
              <p className="seat-summary-hint">
                {unpriced} seat{unpriced === 1 ? ' has' : 's have'} no listed price and{' '}
                {unpriced === 1 ? 'is' : 'are'} not included.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
