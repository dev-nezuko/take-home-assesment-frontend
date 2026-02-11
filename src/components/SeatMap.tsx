import { useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useSeatSelection } from '../hooks/useSeatSelection';
import { mapViewBox, nearestSeat, type Direction, type IndexedSeat } from '../lib/venue';
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

const ARROW_DIRECTIONS: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

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
  const [tabStopId, setTabStopId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const viewBox = useMemo(() => (index ? mapViewBox(index) : '0 0 100 100'), [index]);

  if (!venue || !index) return null;

  // One tab stop for the whole map (roving tabindex); arrows move within it.
  const defaultTabStop =
    index.ordered.find((e) => e.seat.status === 'available') ?? index.ordered[0];
  const activeTabStop =
    tabStopId && index.byId.has(tabStopId) ? tabStopId : (defaultTabStop?.seat.id ?? null);

  const moveFocusTo = (seatId: string) => {
    const element = Array.from(
      svgRef.current?.querySelectorAll<SVGGElement>('[data-seat-id]') ?? []
    ).find((el) => el.dataset.seatId === seatId);
    element?.focus();
  };

  const handleClick = (event: MouseEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    if (seatId) toggleSeat(seatId);
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    if (!seatId) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSeat(seatId);
      return;
    }
    let target: string | null = null;
    if (event.key in ARROW_DIRECTIONS) target = nearestSeat(index, seatId, ARROW_DIRECTIONS[event.key]);
    else if (event.key === 'Home') target = index.ordered[0]?.seat.id ?? null;
    else if (event.key === 'End') target = index.ordered[index.ordered.length - 1]?.seat.id ?? null;
    else return;
    event.preventDefault();
    if (target) moveFocusTo(target);
  };

  const handleFocus = (event: FocusEvent<SVGSVGElement>) => {
    const seatId = seatIdFromEvent(event);
    if (!seatId) return;
    setTabStopId(seatId);
    focusSeat(seatId);
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
          ref={svgRef}
          viewBox={viewBox}
          className="seatmap-svg"
          role="group"
          aria-label={`Seating map for ${venue.name}`}
          aria-describedby="seatmap-instructions"
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
                role="group"
                aria-label={section.label}
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
                      <Seat
                        key={seat.id}
                        entry={entry}
                        isSelected={selectedIds.has(seat.id)}
                        isTabStop={seat.id === activeTabStop}
                      />
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
