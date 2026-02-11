const MARK = 5;

/** Non-colour cue for each state, so status does not rely on hue alone. */
export function StatusMark({ status, isSelected }: { status: string; isSelected?: boolean }) {
  if (isSelected) {
    return <path className="seat-mark" d={`M${-MARK} 0 L${-1.5} ${MARK - 1.5} L${MARK} ${-MARK + 1}`} />;
  }
  if (status === 'sold') {
    return <path className="seat-mark" d={`M${-MARK} ${-MARK} L${MARK} ${MARK} M${MARK} ${-MARK} L${-MARK} ${MARK}`} />;
  }
  if (status === 'reserved') {
    return <path className="seat-mark" d={`M${-MARK} 0 L${MARK} 0`} />;
  }
  if (status === 'held') {
    return <circle className="seat-mark" r={MARK - 1.5} />;
  }
  return null;
}
