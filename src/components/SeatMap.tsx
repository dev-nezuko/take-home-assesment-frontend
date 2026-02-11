import { useMemo, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useSeatSelection } from '../hooks/useSeatSelection';
import { mapViewBox, type IndexedSeat } from '../lib/venue';
import { Seat } from './Seat';
import { SeatTooltip } from './SeatTooltip';
import './SeatMap.css';

interface TooltipState {
  entry: IndexedSeat;
  x: number;
  y: number;
  position: 'above' | 'below';
}

const TOOLTIP_WIDTH = 200;
const TOOLTIP_HEIGHT = 180;
const TOOLTIP_OFFSET = 12;
const EDGE = 10;

function seatIdFromEvent(event: { target: EventTarget }): string | null {
  const target = event.target as Element | null;
  return target?.closest?.('[data-seat-id]')?.getAttribute('data-seat-id') ?? null;
}

function tooltipPlacement(entry: IndexedSeat, seatRect: DOMRect): TooltipState {
  const x = Math.min(
    Math.max(seatRect.left + seatRect.width / 2, TOOLTIP_WIDTH / 2 + EDGE),
    window.innerWidth - TOOLTIP_WIDTH / 2 - EDGE
  );
  const fitsAbove = seatRect.top - TOOLTIP_OFFSET - TOOLTIP_HEIGHT >= EDGE;
  return fitsAbove
    ? { entry, x, y: seatRect.top - TOOLTIP_OFFSET, position: 'above' }
    : { entry, x, y: seatRect.bottom + TOOLTIP_OFFSET, position: 'below' };
}

export function SeatMap() {
  const { venue, index, selectedIds, toggleSeat, focusSeat } = useSeatSelection();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const viewBox = useMemo(() => (index ? mapViewBox(index) : '0 0 100 100'), [index]);

  if (!venue || !index) return null;

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    if (seatId) toggleSeat(seatId);
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    if (seatId && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggleSeat(seatId);
    }
  };

  const handleFocus = (event: FocusEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    if (seatId) focusSeat(seatId);
  };

  const handleMouseOver = (event: MouseEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    const entry = seatId ? index.byId.get(seatId) : undefined;
    if (!entry) return;
    const element = (event.target as Element).closest('[data-seat-id]');
    if (element) setTooltip(tooltipPlacement(entry, element.getBoundingClientRect()));
  };

  const handleMouseOut = (event: MouseEvent<SVGSVGElement>) => {
    if (seatIdFromEvent(event)) setTooltip(null);
  };

  return (
    <>
      <div className="seatmap-container">
        <svg
          viewBox={viewBox}
          className="seatmap-svg"
          role="group"
          aria-label={`Seating map for ${venue.name}`}
          preserveAspectRatio="xMidYMid meet"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          {venue.sections.map((section) => {
            const firstSeat = section.rows[0]?.seats[0];
            return (
              <g
                key={section.id}
                transform={`translate(${section.transform.x}, ${section.transform.y}) scale(${section.transform.scale})`}
              >
                <text
                  x={(firstSeat?.x ?? 0) - 10}
                  y={(firstSeat?.y ?? 40) - 25}
                  fontSize="14"
                  fill="#425c66"
                  aria-hidden="true"
                >
                  {section.label}
                </text>
                {section.rows.map((row) =>
                  row.seats.map((seat) => {
                    const entry = index.byId.get(seat.id);
                    if (!entry || entry.seat !== seat) return null;
                    return (
                      <Seat key={seat.id} entry={entry} isSelected={selectedIds.has(seat.id)} />
                    );
                  })
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {tooltip && createPortal(<SeatTooltip {...tooltip} />, document.body)}
    </>
  );
}
