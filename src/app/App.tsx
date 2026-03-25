import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { useNetworkStatus } from '../stores/app.store';

export default function App() {
  useNetworkStatus();
  return <RouterProvider router={router} />;
}
