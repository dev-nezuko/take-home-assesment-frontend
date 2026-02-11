import { StatusMark } from './StatusMark';
import './Legend.css';

const ENTRIES = [
  { key: 'available', label: 'Available' },
  { key: 'selected', label: 'Your pick' },
  { key: 'reserved', label: 'Reserved' },
  { key: 'sold', label: 'Sold' },
  { key: 'held', label: 'Held' },
] as const;

export function Legend() {
  return (
    <ul className="legend" aria-label="Seat status key">
      {ENTRIES.map(({ key, label }) => (
        <li key={key}>
          <svg viewBox="-12 -12 24 24" aria-hidden="true" className={key === 'selected' ? 'seat seat-selected' : `seat seat-${key}`}>
            <rect className="seat-shape" x={-10} y={-10} width={20} height={20} rx={4} />
            <StatusMark status={key} isSelected={key === 'selected'} />
          </svg>
          {label}
        </li>
      ))}
    </ul>
  );
}
