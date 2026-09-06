
//App.js
import AppRoutes from './src/routes/Approutes/AppRoutes';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { TrackerServiceProvider } from './src/contexts/TrackerServiceContext';
import { RealTimeProvider } from './src/contexts/RealTimeContext';
import { TrackerSelectionProvider } from './src/contexts/TrackerSelectionContext';

export default function App() {
  return (
    <ThemeProvider>
      <TrackerServiceProvider>
        <RealTimeProvider>
          <TrackerSelectionProvider>
            <AppRoutes />
          </TrackerSelectionProvider>
        </RealTimeProvider>
      </TrackerServiceProvider>
    </ThemeProvider>
  );
}