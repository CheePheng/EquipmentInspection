import { Outlet } from 'react-router-dom';
import BottomNav from '../components/ui/BottomNav';
import OfflineBanner from '../components/ui/OfflineBanner';
import ToastContainer from '../components/ui/ToastContainer';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-obsidian pb-16">
      <OfflineBanner />
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
