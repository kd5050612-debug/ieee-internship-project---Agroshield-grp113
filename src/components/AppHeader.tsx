import { Leaf, ScanLine } from 'lucide-react';
import { useTranslation } from '../lib/i18n';


interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', key: 'dashboard' },
  { id: 'scanner', key: 'scanner' },
  { id: 'map', key: 'map' },
  { id: 'history', key: 'history' },
  { id: 'pricing', key: 'pricing' },
] as const;

const dashboardGroup = new Set(['dashboard', 'insights', 'treatment', 'soil', 'diagnostic']);

export default function AppHeader({ activePage, onNavigate }: Props) {
  // Use the 'nav' namespace for the primary navigation keys
  const { t } = useTranslation('nav');


  return (
    <header className="flex items-center justify-between px-6 py-3 bg-forest-900 border-b border-neon-green/10 flex-shrink-0 z-20">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-neon-green/10 rounded-lg border border-neon-green/30 flex items-center justify-center">
          <Leaf size={14} className="text-neon-green" />
        </div>
        <span className="font-bold text-white text-base tracking-tight">
          AgriLens <span className="text-neon-green">3D</span>
        </span>
      </div>

      <nav className="flex items-center gap-6">
        {navItems.map(({ key, id }) => {
          const isActive =
            activePage === id || (id === 'dashboard' && dashboardGroup.has(activePage));
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`text-sm transition-colors ${
                isActive ? 'text-neon-green border-b border-neon-green pb-0.5' : 'text-white/60 hover:text-white'
              }`}
            >
              {t(key)}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('scanner')}
          className="neon-btn px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5"
        >
          <ScanLine size={14} />
          {/* Grabs scanNow matching key configuration */}
          {t('scanNow')} 
        </button>

        
        <button 
          onClick={() => onNavigate('settings')} 
          className="w-8 h-8 rounded-full bg-forest-700 border border-neon-green/20 flex items-center justify-center overflow-hidden"
        >
          <img 
            src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60" 
            alt="User" 
            className="w-full h-full object-cover" 
          />
        </button>
      </div>
    </header>
  );
}