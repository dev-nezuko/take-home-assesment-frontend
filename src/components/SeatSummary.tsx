import { useSeatSelection } from '../hooks/useSeatSelection';
import { MAX_SELECTION } from '../lib/selection';
import { formatAmount, formatTierPrice, selectionSubtotal } from '../lib/pricing';
import './SeatSummary.css';

export function SeatSummary() {
  const { selectedSeats, clearSelection, removeSeat, index, notice } = useSeatSelection();
  const { total, unpriced } = selectionSubtotal(selectedSeats);

  return (
    <div className="seat-summary" role="region" aria-label="Selection summary">
      <p className="visually-hidden" role="status" aria-live="polite">
        {notice}
      </p>
      <div className="seat-summary-header">
        <h3 className="seat-summary-title">
          Your seats{' '}
          <span className="seat-summary-count">
            ({selectedSeats.length}/{MAX_SELECTION})
          </span>
        </h3>
      </div>
      {selectedSeats.length === 0 ? (
        <div className="seat-summary-empty">
          <p>No seats selected</p>
          <p className="seat-summary-hint">
            Pick up to {MAX_SELECTION} available seats. Your choice is kept in this browser
            only; nothing is reserved.
          </p>
        </div>
      ) : (
        <>
          <ul className="seat-summary-list" aria-label="Selected seats">
            {selectedSeats.map((seat) => {
              const section = index?.byId.get(seat.seatId)?.section;
              return (
                <li key={seat.seatId} className="seat-summary-item">
                  <span className="seat-summary-seat-id">{seat.seatId}</span>
                  <span className="seat-summary-section">
                    {section ? `${section.label}, row ${seat.rowIndex}` : `Row ${seat.rowIndex}`}
                  </span>
                  <span className="seat-summary-price">{formatTierPrice(seat.priceTier)}</span>
                  <button
                    type="button"
                    className="seat-summary-remove"
                    onClick={() => removeSeat(seat.seatId)}
                    aria-label={`Remove seat ${seat.seatId}`}
                  >
                    Remove
                  </button>
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
            <button type="button" className="seat-summary-clear" onClick={clearSelection}>
              Clear all
            </button>
          </div>
        </>
      )}
    </div>
  );
}
