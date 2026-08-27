
//App.js
import AppRoutes from './src/routes/Approutes/AppRoutes';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { TrackerServiceProvider } from './src/contexts/TrackerServiceContext';
import { RealTimeProvider } from './src/contexts/RealTimeContext';

export default function App() {
  return (
    <ThemeProvider>
      <TrackerServiceProvider>
        <RealTimeProvider>
          <AppRoutes />
        </RealTimeProvider>
      </TrackerServiceProvider>
    </ThemeProvider>
  );
}