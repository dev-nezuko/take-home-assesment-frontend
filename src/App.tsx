import { useSeatSelection } from './hooks/useSeatSelection';
import { useEffect, useState } from 'react';
import { SeatSelectionProvider } from './context/SeatSelectionContext';
import { SeatMap } from './components/SeatMap';
import { SeatDetails } from './components/SeatDetails';
import { SeatSummary } from './components/SeatSummary';
import { Legend } from './components/Legend';
import { parseVenue } from './lib/venue';
import './App.css';

function AppContent() {
  const { venue, loadVenue } = useSeatSelection();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/venue.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Venue data request failed (${response.status})`);
        return response.json();
      })
      .then((data: unknown) => loadVenue(parseVenue(data)))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Venue data could not be loaded');
      });
    return () => controller.abort();
  }, [loadVenue]);

  const loading = !venue && !error;

  if (loading) {
    return (
      <div className="app-status" aria-busy="true">
        <div className="app-status-spinner" aria-hidden="true" />
        <p>Loading the venue map…</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="app-status app-status-error">
        <p role="alert">Error: {error}</p>
        <button type="button" className="app-retry" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-eyebrow">Seat picker · demo venue</p>
        <h1>{venue.name}</h1>
        <p>
          Choose up to eight seats. This is a local selection preview: nothing is held,
          reserved or charged.
        </p>
      </header>
      <main className="app-main">
        <section className="app-seatmap-section" aria-labelledby="map-heading">
          <div className="map-guide">
            <h2 id="map-heading">Find your seats</h2>
            <p id="seatmap-instructions">
              Click a seat, or Tab into the map and use the arrow keys to move between seats.
              Enter or Space toggles a seat; Home and End jump to the first and last seat.
            </p>
          </div>
          <Legend />
          <SeatMap />
        </section>
        <aside className="app-sidebar" aria-label="Your selection">
          <SeatSummary />
          <SeatDetails />
        </aside>
      </main>
    </div>
  );
}

function App() {
  return (
    <SeatSelectionProvider>
      <AppContent />
    </SeatSelectionProvider>
  );
}

export default App;
