import { useEffect, useState } from 'react';
import { SeatSelectionProvider, useSeatSelection } from './context/SeatSelectionContext';
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
    async function loadVenue() {
      try {
        const response = await fetch('/venue.json');
        if (!response.ok) {
          throw new Error('Failed to load venue data');
        }
        const data: Venue = await response.json();
        setVenue(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadVenue();
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
        <h1>{venue?.name || 'Event Seating Map'}</h1>
      </header>
      <main className="app-main">
        <div className="app-seatmap-section">
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
