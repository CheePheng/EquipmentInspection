import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useNetworkStatus } from '../stores/app.store';
import { seedDatabase } from '../db/seed';

export default function App() {
  useNetworkStatus();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Loading CCT FieldOps...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
