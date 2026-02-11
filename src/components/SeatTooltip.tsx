import React from 'react';
import { Seat as SeatType } from '../types/venue';
import './SeatTooltip.css';

interface SeatTooltipProps {
  seat: SeatType;
  sectionLabel: string;
  rowIndex: number;
  x: number;
  y: number;
  visible: boolean;
  position?: 'above' | 'below';
}

export function SeatTooltip({
  seat,
  sectionLabel,
  rowIndex,
  x,
  y,
  visible,
  position = 'above',
}: SeatTooltipProps) {
  if (!visible) return null;

  const priceTiers: Record<number, string> = {
    1: '$50',
    2: '$75',
    3: '$100',
    4: '$150',
  };

  return (
    <div
      className={`seat-tooltip seat-tooltip-${position}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      role="tooltip"
    >
      <div className="seat-tooltip-content">
        <div className="seat-tooltip-header">
          <strong>{seat.id}</strong>
        </div>
        <div className="seat-tooltip-body">
          <div className="seat-tooltip-row">
            <span className="seat-tooltip-label">Section:</span>
            <span className="seat-tooltip-value">{sectionLabel}</span>
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
            <span className="seat-tooltip-value">
              {priceTiers[seat.priceTier] || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      <div className="seat-tooltip-arrow"></div>
    </div>
  );
}
