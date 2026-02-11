import React from 'react';
import { useSeatSelection } from '../hooks/useSeatSelection';
import './SeatSummary.css';

const priceTiers: Record<number, number> = {
  1: 50,
  2: 75,
  3: 100,
  4: 150,
};

export function SeatSummary() {
  const { selectedSeats, clearSelection, venue } = useSeatSelection();

  const subtotal = selectedSeats.reduce((sum, seat) => {
    return sum + (priceTiers[seat.priceTier] || 0);
  }, 0);

  if (selectedSeats.length === 0) {
    return (
      <div className="seat-summary">
        <h3 className="seat-summary-title">Selection Summary</h3>
        <div className="seat-summary-empty">
          <p>No seats selected</p>
          <p className="seat-summary-hint">
            Select up to 8 seats by clicking on available seats
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="seat-summary" role="region" aria-label="Selection summary">
      <div className="seat-summary-header">
        <h3 className="seat-summary-title">
          Selection Summary ({selectedSeats.length}/8)
        </h3>
        <button
          className="seat-summary-clear"
          onClick={clearSelection}
          aria-label="Clear all selected seats"
        >
          Clear
        </button>
      </div>
      <ul className="seat-summary-list" aria-label="Selected seats">
        {selectedSeats.map((seat) => {
          const section = venue?.sections.find((s) => s.id === seat.sectionId);
          return (
            <li key={seat.seatId} className="seat-summary-item">
              <span className="seat-summary-seat-id">{seat.seatId}</span>
              {section && (
                <span className="seat-summary-section">
                  {section.label} Row {seat.rowIndex}
                </span>
              )}
              <span className="seat-summary-price">
                ${priceTiers[seat.priceTier] || 0}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="seat-summary-footer">
        <div className="seat-summary-subtotal">
          <span className="seat-summary-subtotal-label">Subtotal:</span>
          <span className="seat-summary-subtotal-amount">${subtotal}</span>
        </div>
      </div>
    </div>
  );
}
