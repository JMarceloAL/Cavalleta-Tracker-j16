// App.js
import AppRoutes from './src/routes/AppRoutes';
import { TrackerServiceProvider } from './src/contexts/TrackerServiceContext';

export default function App() {
  return (
    <TrackerServiceProvider>
      <AppRoutes />
    </TrackerServiceProvider>
  );
}