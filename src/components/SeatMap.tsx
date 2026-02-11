import React, { memo, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSeatSelection } from '../hooks/useSeatSelection';
import { Seat } from './Seat';
import { SeatTooltip } from './SeatTooltip';
import { Seat as SeatType } from '../types/venue';
import './SeatMap.css';

function SeatMapComponent() {
  const {
    venue,
    selectedSeats,
    selectSeat,
    deselectSeat,
    setSelectedSeat,
    canSelectMore,
  } = useSeatSelection();

  const [tooltip, setTooltip] = useState<{
    seat: SeatType;
    sectionLabel: string;
    rowIndex: number;
    x: number;
    y: number;
    position: 'above' | 'below';
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!venue) {
    return <div className="seatmap-loading">Loading venue data...</div>;
  }

  const handleSeatClick = useCallback(
    (seatId: string, sectionId: string, rowIndex: number) => {
      const section = venue.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const row = section.rows.find((r) => r.index === rowIndex);
      if (!row) return;

      const seat = row.seats.find((s) => s.id === seatId);
      if (!seat || seat.status !== 'available') return;

      const isSelected = selectedSeats.some((s) => s.seatId === seatId);

      if (isSelected) {
        deselectSeat(seatId);
        setSelectedSeat(null);
      } else {
        if (canSelectMore) {
          selectSeat(seat, sectionId, rowIndex);
          setSelectedSeat(seat);
        }
      }
    },
    [venue, selectedSeats, selectSeat, deselectSeat, setSelectedSeat, canSelectMore]
  );

  const handleSeatKeyDown = useCallback(
    (e: React.KeyboardEvent, seatId: string, sectionId: string, rowIndex: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSeatClick(seatId, sectionId, rowIndex);
      }
    },
    [handleSeatClick]
  );

  const handleSeatFocus = useCallback(
    (seatId: string) => {
      const section = venue.sections.find((s) =>
        s.rows.some((r) => r.seats.some((seat) => seat.id === seatId))
      );
      if (!section) return;

      const row = section.rows.find((r) =>
        r.seats.some((seat) => seat.id === seatId)
      );
      if (!row) return;

      const seat = row.seats.find((s) => s.id === seatId);
      if (seat) {
        setSelectedSeat(seat);
      }
    },
    [venue, setSelectedSeat]
  );

  const handleSeatMouseEnter = useCallback(
    (e: React.MouseEvent<SVGRectElement>, seat: SeatType, sectionId: string, rowIndex: number) => {
      if (!containerRef.current) return;

      const section = venue.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const svgRect = e.currentTarget.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const tooltipWidth = 200;
      const tooltipHeight = 180;
      const offset = 12;
      
      let x = svgRect.left + svgRect.width / 2;
      let y = svgRect.top - offset;
      
      if (x - tooltipWidth / 2 < 10) {
        x = tooltipWidth / 2 + 10;
      } else if (x + tooltipWidth / 2 > viewportWidth - 10) {
        x = viewportWidth - tooltipWidth / 2 - 10;
      }
      
      let tooltipPosition: 'above' | 'below' = 'above';
      
      if (y - tooltipHeight < 10) {
        y = svgRect.bottom + offset;
        tooltipPosition = 'below';
      }
      
      if (y + tooltipHeight > viewportHeight - 10) {
        y = viewportHeight - tooltipHeight - 10;
        if (svgRect.top - tooltipHeight > 10) {
          y = svgRect.top - offset;
          tooltipPosition = 'above';
        }
      }
      
      setTooltip({
        seat,
        sectionLabel: section.label,
        rowIndex,
        x,
        y,
        position: tooltipPosition,
      });
    },
    [venue]
  );

  const handleSeatMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <>
      <div className="seatmap-container" ref={containerRef}>
        <svg
          viewBox={`0 0 ${venue.map.width} ${venue.map.height}`}
          className="seatmap-svg"
          aria-label={`Seating map for ${venue.name}`}
          role="img"
          preserveAspectRatio="xMidYMid meet"
        >
          {venue.sections.map((section) =>
            section.rows.map((row) =>
              row.seats.map((seat) => {
                const isSelected = selectedSeats.some(
                  (s) => s.seatId === seat.id
                );
                return (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    sectionId={section.id}
                    rowIndex={row.index}
                    isSelected={isSelected}
                    onClick={() => handleSeatClick(seat.id, section.id, row.index)}
                    onFocus={() => handleSeatFocus(seat.id)}
                    onKeyDown={(e) =>
                      handleSeatKeyDown(e, seat.id, section.id, row.index)
                    }
                    onMouseEnter={(e) => handleSeatMouseEnter(e, seat, section.id, row.index)}
                    onMouseLeave={handleSeatMouseLeave}
                  />
                );
              })
            )
          )}
        </svg>
      </div>
      {tooltip &&
        createPortal(
          <SeatTooltip
            seat={tooltip.seat}
            sectionLabel={tooltip.sectionLabel}
            rowIndex={tooltip.rowIndex}
            x={tooltip.x}
            y={tooltip.y}
            visible={true}
            position={tooltip.position}
          />,
          document.body
        )}
    </>
  );
}

export const SeatMap = memo(SeatMapComponent);
