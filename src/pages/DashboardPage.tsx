import { useEffect, useState } from 'react';
import { AlertTriangle, Info, Brain, ScanLine } from 'lucide-react';

import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import { supabase, Alert } from '../lib/supabase';

import { Language, useTranslation } from '../lib/i18n';

interface Props {
  onNavigate: (page: string) => void;
  language?: Language;
  setLanguage?: (lang: Language) => void;
}

export default function DashboardPage({ onNavigate }: Props) {
  const { t } = useTranslation('dashboard');
  useTranslation('common');



  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healthScore] = useState(92);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('alerts')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setAlerts(data);
      })
      .then(() => undefined, () => undefined);
  }, []);


  return (
    <div className="flex flex-col h-screen bg-forest-950 overflow-hidden">
      <AppHeader activePage="dashboard" onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage="dashboard" onNavigate={onNavigate} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">

            {/* Top-left: Health + Alerts */}
            <div className="flex flex-col gap-4">
              {/* Overall Farm Health */}
              <div className="card-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-white/60 font-medium">{t('overallFarmHealth', 'Overall Farm Health')}</p>

                  <span className="text-[9px] font-mono bg-neon-green/15 text-neon-green border border-neon-green/25 rounded px-1.5 py-0.5 uppercase tracking-widest">eco</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">{healthScore}</span>
                  <span className="text-2xl text-white/40 mb-1">%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${healthScore}%` }} />
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="card-dark rounded-xl p-4 flex-1">
                <p className="text-xs text-white/60 font-medium mb-3">{t('recentAlerts', 'Recent Alerts')}</p>

                <div className="flex flex-col gap-2">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-white/30 font-mono">Loading alerts...</p>
                  ) : alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-2.5 rounded-lg p-2.5 ${alert.severity === 'warning' ? 'bg-amber-500/8 border border-amber-500/20' : 'bg-blue-500/8 border border-blue-400/20'}`}
                    >
                      {alert.severity === 'warning'
                        ? <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        : <Info size={13} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      }
                      <p className="text-xs text-white/80">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center: Farm 3D map */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="card-dark rounded-xl flex-1 relative overflow-hidden" style={{ minHeight: '280px' }}>
                {/* Grid map */}
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Farm grid visualization */}
                  <div className="relative w-full h-full p-6">
                    <div className="absolute inset-6 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(57,211,83,0.05) 0%, rgba(57,211,83,0.02) 100%)', border: '1px solid rgba(57,211,83,0.15)' }}>
                      {/* Grid lines */}
                      <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: 'linear-gradient(rgba(57,211,83,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(57,211,83,0.3) 1px, transparent 1px)',
                        backgroundSize: '20% 20%',
                        transform: 'perspective(400px) rotateX(20deg)',
                        transformOrigin: 'bottom center',
                      }} />
                      {/* Sector labels */}
                      {[['A-1', '12%', '18%'], ['B-3', '42%', '28%'], ['C-7', '72%', '52%'], ['D-2', '25%', '68%']].map(([label, l, t]) => (
                        <div key={label} className="absolute flex items-center gap-1" style={{ left: l, top: t }}>
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-green/60" />
                          <span className="text-[8px] font-mono text-neon-green/50">{label}</span>
                        </div>
                      ))}
                      {/* Center marker */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-3 h-3 rounded-full border border-neon-green/60 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-neon-green" />
                        </div>
                        <div className="text-[8px] font-mono text-neon-green/50 text-center mt-1">MAIN</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights panel */}
              <div className="card-dark rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={14} className="text-neon-green" />
                      <span className="text-[10px] font-mono text-neon-green uppercase tracking-widest">psychology</span>
                      <span className="text-xs text-white font-medium">{t('aiInsights', 'AI Insights')}</span>

                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Predicted yield increase of 12% if Sector 4 receives nitrogen treatment by Wednesday.
                    </p>
                    <button
                      onClick={() => onNavigate('insights')}
                      className="mt-3 text-[10px] font-mono text-neon-green/70 border border-neon-green/25 rounded px-3 py-1.5 hover:bg-neon-green/10 transition-colors uppercase tracking-widest"
                    >
                      {t('viewFullReport', 'View Full Report')}

                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NEW 3D SCAN FAB */}
          <button
            onClick={() => onNavigate('scanner')}
            className="fixed bottom-6 right-6 neon-btn rounded-xl px-5 py-3 flex items-center gap-2 text-sm shadow-lg"
            style={{ boxShadow: '0 0 30px rgba(57,211,83,0.25)' }}
          >
            <ScanLine size={16} />
            {t('new3dScan', 'New 3D Scan')}

          </button>
        </main>
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-neon-green/10 px-6 py-2 flex items-center justify-between">
        <p className="text-[9px] font-mono text-white/20">© 2024 Agri-Futurism Systems. All rights reserved.</p>
        <div className="flex items-center gap-5">
          {['Farm Management', 'Global Health Map', 'Satellite Data', 'Privacy Policy'].map(link => (
            <button key={link} className="text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors">{link}</button>
          ))}
        </div>
      </footer>
    </div>
  );
}
