import { useSeatSelection } from './hooks/useSeatSelection';
import { useEffect, useState } from 'react';
import { SeatSelectionProvider } from './context/SeatSelectionContext';
import { SeatMap } from './components/SeatMap';
import { SeatDetails } from './components/SeatDetails';
import { SeatSummary } from './components/SeatSummary';
import { Venue } from './types/venue';
import './App.css';

function AppContent() {
  const { venue, setVenue } = useSeatSelection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadVenue() {
      try {
        const response = await fetch('/venue.json', { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load venue data');
        }
        const data: Venue = await response.json();
        setVenue(data);
        setLoading(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadVenue();
    return () => controller.abort();
  }, [setVenue]);

  if (loading) {
    return (
      <div className="app-loading">
        <p>Loading venue data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-eyebrow">INTERACTIVE SEATING DEMO</p>
        <h1>{venue?.name || 'Event Seating Map'}</h1>
        <p>Choose up to eight seats. This is a local selection preview, not a reservation or purchase.</p>
      </header>
      <main className="app-main">
        <div className="app-seatmap-section">
          <div className="map-guide"><h2>Find your seats</h2><p>Tab to an available seat, then press Enter or Space to toggle it.</p><p className="legend">Green · available &nbsp; Blue · selected &nbsp; Orange · reserved &nbsp; Red · sold &nbsp; Grey · held</p></div>
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
