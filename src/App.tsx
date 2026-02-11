import { useSeatSelection } from './hooks/useSeatSelection';
import { useEffect, useState } from 'react';
import { SeatSelectionProvider } from './context/SeatSelectionContext';
import { SeatMap } from './components/SeatMap';
import { SeatDetails } from './components/SeatDetails';
import { SeatSummary } from './components/SeatSummary';
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
      <div className="app-loading">
        <p>Loading venue data...</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="app-error">
        <p role="alert">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-eyebrow">INTERACTIVE SEATING DEMO</p>
        <h1>{venue.name}</h1>
        <p>Choose up to eight seats. This is a local selection preview, not a reservation or purchase.</p>
      </header>
      <main className="app-main">
        <div className="app-seatmap-section">
          <div className="map-guide">
            <h2>Find your seats</h2>
            <p id="seatmap-instructions">
              Click a seat, or Tab into the map and use the arrow keys to move between seats.
              Enter or Space toggles a seat; Home and End jump to the first and last seat.
            </p>
            <p className="legend">Green · available &nbsp; Blue with tick · selected &nbsp; Orange with bar · reserved &nbsp; Red with cross · sold &nbsp; Grey with ring · held</p>
          </div>
          <SeatMap />
        </div>
        <aside className="app-sidebar">
          <SeatDetails />
          <SeatSummary />
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
