import { Leaf, LayoutDashboard, Dna, HeartPulse, Wheat, Brain, Settings, HelpCircle, ScanLine } from 'lucide-react';

interface Props {
  activePage: string;
  onNavigate: (page: string) => void;
  showScanBtn?: boolean;
}

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'dashboard', sub: 'Overview' },
  { id: 'scanner', icon: Dna, label: 'biotech', sub: 'Live Scans' },
  { id: 'treatment', icon: HeartPulse, label: 'healing', sub: 'Treatment Hub' },
  { id: 'soil', icon: Wheat, label: 'grass', sub: 'Soil Health' },
  { id: 'insights', icon: Brain, label: 'psychology', sub: 'AI Insights' },
  { id: 'forum', icon: Brain, label: 'community', sub: 'Farmer Posts / Blogs' },
];

export default function Sidebar({ activePage, onNavigate, showScanBtn }: Props) {
  return (
    <aside className="w-52 flex-shrink-0 flex flex-col bg-forest-900 border-r border-neon-green/10 min-h-full">
      {/* AI status */}
      <div className="p-4 border-b border-neon-green/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-neon-green/10 border border-neon-green/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={14} className="text-neon-green" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">AgriLens AI</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="status-dot" style={{ width: '5px', height: '5px' }} />
              <span className="text-[9px] font-mono text-neon-green/70 uppercase tracking-wider">Ready for Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map(({ id, icon: Icon, label, sub }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`sidebar-item text-left ${activePage === id ? 'active' : ''}`}
          >
            <Icon size={15} className="flex-shrink-0" />
            <div>
              <span className="font-mono text-[11px]">{label}</span>
              <span className="text-[9px] text-white/30 ml-1.5">{sub}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="p-3 border-t border-neon-green/10 flex flex-col gap-0.5">
        <button
          onClick={() => onNavigate('settings')}
          className={`sidebar-item ${activePage === 'settings' ? 'active' : ''}`}
        >
          <Settings size={14} />
          <span className="text-[11px] font-mono">settings</span>
          <span className="text-[9px] text-white/30 ml-0.5">Settings</span>
        </button>
        <button className="sidebar-item">
          <HelpCircle size={14} />
          <span className="text-[11px] font-mono">help_center</span>
          <span className="text-[9px] text-white/30 ml-0.5">Support</span>
        </button>
      </div>

      {/* Start New Scan button */}
      {showScanBtn && (
        <div className="p-3 pt-0">
          <button
            onClick={() => onNavigate('scanner')}
            className="neon-btn w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <ScanLine size={13} />
            Start New Scan
          </button>
        </div>
      )}
    </aside>
  );
}
