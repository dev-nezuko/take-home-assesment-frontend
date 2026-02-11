import React, { memo } from 'react';
import { Seat as SeatType, SeatStatus } from '../types/venue';
import './Seat.css';

interface SeatProps {
  seat: SeatType;
  sectionId: string;
  rowIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMouseEnter?: (e: React.MouseEvent<SVGRectElement>) => void;
  onMouseLeave?: () => void;
}

const SEAT_SIZE = 20;
const SEAT_RADIUS = 3;

const statusColors: Record<SeatStatus, string> = {
  available: '#4CAF50',
  reserved: '#FF9800',
  sold: '#F44336',
  held: '#9E9E9E',
};

function SeatComponent({
  seat,
  isSelected,
  onClick,
  onFocus,
  onKeyDown,
  onMouseEnter,
  onMouseLeave,
}: SeatProps) {
  const isInteractive = seat.status === 'available';
  const fillColor = isSelected
    ? '#2196F3'
    : statusColors[seat.status] || '#CCCCCC';

  return (
    <g
      className={`seat ${isInteractive ? 'seat-interactive' : ''} ${
        isSelected ? 'seat-selected' : ''
      }`}
    >
      <rect
        x={seat.x - SEAT_SIZE / 2}
        y={seat.y - SEAT_SIZE / 2}
        width={SEAT_SIZE}
        height={SEAT_SIZE}
        rx={SEAT_RADIUS}
        fill={fillColor}
        stroke={isSelected ? '#1976D2' : '#333'}
        strokeWidth={isSelected ? 2 : 1}
        tabIndex={isInteractive ? 0 : -1}
        onClick={isInteractive ? onClick : undefined}
        onFocus={isInteractive ? onFocus : undefined}
        onKeyDown={isInteractive ? onKeyDown : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={`Seat ${seat.id}, ${seat.status}, Price tier ${seat.priceTier}`}
        role={isInteractive ? 'button' : undefined}
        style={{ cursor: isInteractive ? 'pointer' : 'not-allowed' }}
      />
    </g>
  );
}

export const Seat = memo(SeatComponent);
