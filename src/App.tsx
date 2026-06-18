import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import DiagnosticPage from './pages/DiagnosticPage';
import SettingsPage from './pages/SettingsPage';
import ForumPage from './pages/ForumPage';
import PricingPage from './pages/PricingPage';
import PlaceholderPage from './pages/PlaceholderPage';

type Page =
  | 'landing' | 'login'
  | 'dashboard' | 'scanner' | 'diagnostic' | 'insights'
  | 'treatment' | 'soil' | 'map' | 'history'
  | 'settings' | 'forum' | 'pricing';

export default function App() {
  const [page, setPage] = useState<Page>('landing');

  const navigate = (target: string) => {
    const map: Record<string, Page> = {
      landing: 'landing',
      login: 'login',
      dashboard: 'dashboard',
      scanner: 'scanner',
      biotech: 'scanner',
      diagnostic: 'diagnostic',
      insights: 'insights',
      treatment: 'treatment',
      soil: 'soil',
      map: 'map',
      history: 'history',
      settings: 'settings',
      forum: 'forum',
      pricing: 'pricing',
    };
    const dest = map[target.toLowerCase()];
    if (dest) setPage(dest);
  };

  switch (page) {
    case 'landing':    return <LandingPage onNavigate={navigate} />;
    case 'login':      return <LoginPage onNavigate={navigate} />;
    case 'dashboard':  return <DashboardPage onNavigate={navigate} />;
    case 'scanner':    return <ScannerPage onNavigate={navigate} />;
    case 'diagnostic':
    case 'insights':
    case 'history':    return <DiagnosticPage onNavigate={navigate} />;
    case 'settings':   return <SettingsPage onNavigate={navigate} />;
    case 'forum':      return <ForumPage onNavigate={navigate} />;
    case 'pricing':    return <PricingPage onNavigate={navigate} />;
    case 'treatment':
      return <PlaceholderPage title="Treatment Hub" description="Manage crop treatment protocols and fungicide schedules." onNavigate={navigate} activePage="treatment" />;
    case 'soil':
      return <PlaceholderPage title="Soil Health" description="Monitor soil composition, pH levels and nutrient density across all sectors." onNavigate={navigate} activePage="soil" />;
    case 'map':
      return <PlaceholderPage title="Global Health Map" description="Satellite view of all monitored sectors with real-time overlays." onNavigate={navigate} activePage="dashboard" />;
    default:
      return <LandingPage onNavigate={navigate} />;
  }
}
