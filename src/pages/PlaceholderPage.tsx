import { Construction } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';

interface Props {
  title: string;
  description: string;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function PlaceholderPage({ title, description, activePage, onNavigate }: Props) {
  return (
    <div className="flex flex-col h-screen bg-forest-950 overflow-hidden">
      <AppHeader activePage={activePage} onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center card-dark rounded-2xl p-12 max-w-md">
            <div className="w-14 h-14 bg-neon-green/10 border border-neon-green/25 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Construction size={24} className="text-neon-green/60" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-white/45 leading-relaxed mb-6">{description}</p>
            <div className="flex items-center justify-center gap-1.5">
              <span className="status-dot" />
              <span className="text-[9px] font-mono text-neon-green/60 uppercase tracking-widest">Module Coming Online</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
