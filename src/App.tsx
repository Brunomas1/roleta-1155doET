import BackgroundManager from './components/BackgroundManager';
import MainDashboard from './components/MainDashboard';
import XPDesktopIcons from './components/XPDesktopIcons';

function App() {
  return (
    <BackgroundManager>
      <XPDesktopIcons />
      <MainDashboard />
    </BackgroundManager>
  );
}

export default App;
