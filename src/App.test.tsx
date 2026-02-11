import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { stubVenueFetch, testVenue } from './test/fixtures';

const STORAGE_KEY = 'selectedSeats:test-hall';

async function renderApp(venue: unknown = testVenue()) {
  stubVenueFetch(venue);
  const user = userEvent.setup();
  const view = render(<App />);
  await screen.findByRole('group', { name: 'Seating map for Test Hall' });
  return { user, ...view };
}

const seat = (name: RegExp | string) =>
  screen.getByRole('button', { name: typeof name === 'string' ? new RegExp(`^${name},`) : name });

const pressedSeats = () =>
  screen
    .getAllByRole('button', { pressed: true })
    .map((el) => el.getAttribute('data-seat-id'));

const summary = () => screen.getByRole('region', { name: 'Selection summary' });

const subtotal = () => within(summary()).getByText('Subtotal:').nextElementSibling?.textContent;

describe('seat map', () => {
  it('renders every seat as a labelled button inside its section', async () => {
    await renderApp();
    expect(screen.getByRole('heading', { level: 1, name: 'Test Hall' })).toBeInTheDocument();
    const stalls = screen.getByRole('group', { name: 'Stalls' });
    expect(within(stalls).getAllByRole('button')).toHaveLength(12);
    expect(seat('Stalls, row 1, seat 1')).toHaveAccessibleName('Stalls, row 1, seat 1, $50, available');
    expect(seat('Balcony, row 1, seat 3')).toHaveAccessibleName(
      'Balcony, row 1, seat 3, Price unavailable, available'
    );
  });

  it('caps the selection at eight seats and announces the limit', async () => {
    const { user } = await renderApp();
    const ids = ['1, seat 1', '1, seat 2', '1, seat 3', '1, seat 4', '2, seat 1', '2, seat 2', '2, seat 3', '2, seat 4', '2, seat 5'];
    for (const id of ids) await user.click(seat(`Stalls, row ${id}`));

    expect(pressedSeats()).toHaveLength(8);
    expect(seat('Stalls, row 2, seat 5')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('You can hold up to 8 seats.');
    expect(within(summary()).getByRole('heading')).toHaveTextContent('(8/8)');
  });

  it('keeps sold, reserved and held seats out of the selection', async () => {
    const { user } = await renderApp();
    const sold = seat('Stalls, row 1, seat 5');
    expect(sold).toHaveAttribute('aria-disabled', 'true');
    expect(sold).not.toHaveAttribute('aria-pressed');

    await user.click(sold);
    await user.click(seat('Stalls, row 1, seat 6'));
    await user.click(seat('Balcony, row 1, seat 2'));

    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
    expect(within(summary()).getByText('No seats selected')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Balcony, row 1, seat 2 is held and cannot be selected.');
  });

  it('shows details for the seat last clicked or focused', async () => {
    const { user } = await renderApp();
    await user.click(seat('Balcony, row 1, seat 1'));
    const details = screen.getByRole('region', { name: 'Seat details' });
    expect(details).toHaveTextContent('B-1-1');
    expect(details).toHaveTextContent('$100');
    expect(within(details).getByText('selected')).toHaveClass('status-selected');
  });
});

describe('price totals', () => {
  it('adds tier prices and updates when seats are removed', async () => {
    const { user } = await renderApp();
    await user.click(seat('Stalls, row 1, seat 1'));
    await user.click(seat('Stalls, row 2, seat 1'));
    await user.click(seat('Balcony, row 1, seat 1'));
    expect(subtotal()).toBe('$225');

    await user.click(screen.getByRole('button', { name: 'Remove seat S-2-1' }));
    expect(subtotal()).toBe('$150');

    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(within(summary()).getByText('No seats selected')).toBeInTheDocument();
  });

  it('leaves seats without a listed price out of the subtotal', async () => {
    const { user } = await renderApp();
    await user.click(seat('Stalls, row 1, seat 1'));
    await user.click(seat('Balcony, row 1, seat 3'));
    expect(subtotal()).toBe('$50');
    expect(summary()).toHaveTextContent('1 seat has no listed price and is not included.');
  });
});

describe('keyboard selection', () => {
  it('uses one tab stop and moves between seats with the arrow keys', async () => {
    const { user } = await renderApp();
    const tabStops = screen
      .getAllByRole('button')
      .filter((el) => el.getAttribute('tabindex') === '0' && el.hasAttribute('data-seat-id'));
    expect(tabStops).toHaveLength(1);

    await user.tab();
    expect(seat('Stalls, row 1, seat 1')).toHaveFocus();

    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(seat('Stalls, row 1, seat 3')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(seat('Stalls, row 1, seat 3')).toHaveAttribute('aria-pressed', 'true');

    await user.keyboard('{ArrowDown} ');
    expect(seat('Stalls, row 2, seat 3')).toHaveFocus();
    expect(pressedSeats()).toEqual(['S-1-3', 'S-2-3']);

    await user.keyboard(' ');
    expect(pressedSeats()).toEqual(['S-1-3']);

    await user.keyboard('{End}');
    expect(seat('Balcony, row 1, seat 3')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(seat('Stalls, row 1, seat 1')).toHaveFocus();
  });

  it('keeps the tab stop on the seat the user last focused', async () => {
    const { user } = await renderApp();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(seat('Stalls, row 2, seat 1')).toHaveAttribute('tabindex', '0');
    expect(seat('Stalls, row 1, seat 1')).toHaveAttribute('tabindex', '-1');
  });

  it('can focus an unavailable seat and explains why it is not selectable', async () => {
    const { user } = await renderApp();
    await user.tab();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}');
    expect(seat('Stalls, row 1, seat 5')).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Stalls, row 1, seat 5 is sold and cannot be selected.');
  });
});

describe('persistence', () => {
  it('saves the selection per venue and restores it on the next visit', async () => {
    const { user, unmount } = await renderApp();
    await user.click(seat('Stalls, row 2, seat 2'));
    await user.click(seat('Balcony, row 1, seat 1'));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      { seatId: 'S-2-2', sectionId: 'S', rowIndex: 2, col: 2, priceTier: 2 },
      { seatId: 'B-1-1', sectionId: 'B', rowIndex: 1, col: 1, priceTier: 3 },
    ]);
    unmount();

    await renderApp();
    expect(pressedSeats()).toEqual(['S-2-2', 'B-1-1']);
    expect(subtotal()).toBe('$175');
  });

  it('restores only seats that are still available, at venue prices', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ seatId: 'S-1-5' }, { seatId: 'B-1-1', priceTier: 1 }, { seatId: 'B-1-1' }, { seatId: 'gone' }])
    );
    await renderApp();
    expect(pressedSeats()).toEqual(['B-1-1']);
    expect(subtotal()).toBe('$100');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toHaveLength(1);
  });

  it('ignores the selection saved for another venue', async () => {
    localStorage.setItem('selectedSeats:other', JSON.stringify([{ seatId: 'S-1-1' }]));
    localStorage.setItem('selectedSeats', JSON.stringify([{ seatId: 'S-1-1' }]));
    await renderApp();
    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
  });
});

describe('corrupt or unavailable localStorage', () => {
  it.each(['{not json', '"S-1-1"', '{"seatId":"S-1-1"}', '[1,2,3]'])(
    'starts empty with %s stored and overwrites it on the next change',
    async (stored) => {
      localStorage.setItem(STORAGE_KEY, stored);
      const { user } = await renderApp();
      expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0);
      await user.click(seat('Stalls, row 1, seat 2'));
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual([
        expect.objectContaining({ seatId: 'S-1-2' }),
      ]);
    }
  );

  it('keeps working when storage access throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const { user } = await renderApp();
    await user.click(seat('Stalls, row 1, seat 1'));
    expect(pressedSeats()).toEqual(['S-1-1']);
  });
});

describe('loading errors', () => {
  it('shows an alert when the venue request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404, json: async () => ({}) })));
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Venue data request failed (404)');
  });

  it('shows an alert for malformed venue data', async () => {
    stubVenueFetch({ venueId: 'x', name: 'Broken', sections: [{ id: 'A' }] });
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Venue data is not in the expected format');
  });
});
