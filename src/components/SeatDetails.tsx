import React from 'react';
import { useSeatSelection } from '../hooks/useSeatSelection';
import './SeatDetails.css';

export function SeatDetails() {
  const { selectedSeat, venue } = useSeatSelection();

  if (!selectedSeat || !venue) {
    return (
      <div className="seat-details">
        <p className="seat-details-placeholder">
          Click or focus on a seat to view details
        </p>
      </div>
    );
  }

  const section = venue.sections.find((s) =>
    s.rows.some((r) => r.seats.some((seat) => seat.id === selectedSeat.id))
  );
  const row = section?.rows.find((r) =>
    r.seats.some((seat) => seat.id === selectedSeat.id)
  );

  const priceTiers: Record<number, string> = {
    1: '$50',
    2: '$75',
    3: '$100',
    4: '$150',
  };

  return (
    <div className="seat-details" role="region" aria-label="Seat details">
      <h3 className="seat-details-title">Seat Information</h3>
      <dl className="seat-details-list">
        <div className="seat-details-item">
          <dt>Seat ID:</dt>
          <dd>{selectedSeat.id}</dd>
        </div>
        {section && (
          <div className="seat-details-item">
            <dt>Section:</dt>
            <dd>{section.label}</dd>
          </div>
        )}
        {row && (
          <div className="seat-details-item">
            <dt>Row:</dt>
            <dd>{row.index}</dd>
          </div>
        )}
        <div className="seat-details-item">
          <dt>Column:</dt>
          <dd>{selectedSeat.col}</dd>
        </div>
        <div className="seat-details-item">
          <dt>Price Tier:</dt>
          <dd>
            {selectedSeat.priceTier} ({priceTiers[selectedSeat.priceTier] || 'N/A'})
          </dd>
        </div>
        <div className="seat-details-item">
          <dt>Status:</dt>
          <dd>
            <span className={`status-badge status-${selectedSeat.status}`}>
              {selectedSeat.status}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}
