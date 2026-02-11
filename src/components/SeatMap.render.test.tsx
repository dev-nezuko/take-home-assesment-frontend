import { createElement, memo, type FC } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { largeVenue, stubVenueFetch } from '../test/fixtures';

const renders = vi.hoisted(() => new Map<string, number>());

// Count real renders of the memoised seat; the wrapper keeps React.memo's
// default comparison so the test measures what the map passes down.
vi.mock('./Seat', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./Seat')>();
  const Inner = (actual.Seat as unknown as { type: FC<{ entry: { seat: { id: string } } }> }).type;
  const Counted: FC<{ entry: { seat: { id: string } } }> = (props) => {
    renders.set(props.entry.seat.id, (renders.get(props.entry.seat.id) ?? 0) + 1);
    return createElement(Inner, props);
  };
  return { Seat: memo(Counted) };
});

describe('large venue rendering', () => {
  it('re-renders only the seats whose state changed', async () => {
    stubVenueFetch(largeVenue(40, 50));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole('group', { name: 'Seating map for Large Arena' });
    expect(screen.getAllByRole('button', { name: /^Arena floor/ })).toHaveLength(2000);

    renders.clear();
    await user.click(screen.getByRole('button', { name: /^Arena floor, row 20, seat 25,/ }));
    // The clicked seat changes selection and becomes the tab stop; the old
    // tab stop (row 1, seat 1) loses it. Nothing else should render.
    expect([...renders.keys()].sort()).toEqual(['L-1-1', 'L-20-25']);

    renders.clear();
    await user.keyboard('{ArrowRight}');
    expect([...renders.keys()].sort()).toEqual(['L-20-25', 'L-20-26']);
  });
});
