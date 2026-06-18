import { useEffect, useState } from 'react';
import { Download, FileText, Cpu, Thermometer } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import { supabase, Scan } from '../lib/supabase';

interface Props {
  onNavigate: (page: string) => void;
}

function DonutChart({ score }: { score: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="donut" width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="rgba(57,211,83,0.1)" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={radius} fill="none"
          stroke="#39d353"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(57,211,83,0.5))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-neon-green">{score}%</span>
        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Optimal</span>
      </div>
    </div>
  );
}

export default function DiagnosticPage({ onNavigate }: Props) {
  const [scan, setScan] = useState<Scan | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('scans')
      .select('*')
      .eq('disease_detected', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setScan(data);
      })
      .then(() => undefined, () => undefined);
  }, []);


  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col h-screen bg-forest-950 overflow-hidden">
      <AppHeader activePage="dashboard" onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage="dashboard" onNavigate={onNavigate} />

        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left: Active Diagnostic */}
            <div className="card-dark rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-neon-green/10">
                <p className="text-[9px] font-mono text-neon-green/70 uppercase tracking-widest mb-0.5">Active Diagnostic</p>
                <p className="text-xs text-white/50">Latest Scan Summary</p>
              </div>

              {/* Leaf image */}
              <div className="relative" style={{ height: '200px' }}>
                <div className="absolute inset-0 grid-bg opacity-20" />
                <img
                  src="https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=700"
                  alt="Healthy leaf scan"
                  className="w-full h-full object-cover opacity-75"
                  style={{ filter: 'hue-rotate(95deg) saturate(1.5) brightness(0.85)' }}
                />
                {/* HUD corners */}
                <div className="corner-tl" />
                <div className="corner-tr" />
                <div className="corner-bl" />
                <div className="corner-br" />
                {/* System status overlay */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full px-3 py-1">
                  <span className="status-dot" style={{ width: '5px', height: '5px' }} />
                  <span className="text-[8px] font-mono text-neon-green uppercase tracking-widest">System: Optimal</span>
                </div>
                {/* Scan line */}
                <div className="scan-line" />
              </div>

              {/* Score + Metadata */}
              <div className="p-4 flex items-start gap-5">
                <div className="flex flex-col items-center">
                  <DonutChart score={scan?.health_score ?? 94} />
                  <p className="text-[9px] font-mono text-white/40 mt-1 text-center">Overall Health Score</p>
                </div>

                <div className="flex-1 grid grid-cols-1 gap-2.5">
                  {[
                    { label: 'Scan Date', value: scan ? formatDate(scan.scan_date) : 'Oct 24, 2024' },
                    { label: 'Scan Type', value: scan?.scan_type ?? 'Hyper-Spectral 3D' },
                    { label: 'Scanner ID', value: scan?.scanner_id ?? 'AL-09-X' },
                  ].map(({ label, value }) => (
                    <div key={label} className="card-darker rounded-lg px-3 py-2">
                      <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-0.5">{label}</p>
                      <p className="text-xs text-white/80 font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-4 pb-4 flex gap-3">
                <button className="outline-btn flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs">
                  <FileText size={13} className="text-neon-green" />
                  View Full Report
                </button>
                <button className="outline-btn flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs">
                  <Download size={13} className="text-neon-green" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4">
              {/* Quick AI Insight */}
              <div className="card-dark rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="status-dot" />
                  <p className="text-xs font-semibold text-white">Quick AI Insight</p>
                </div>
                <p className="text-xs text-white/55 leading-relaxed">
                  {scan?.ai_insight ?? 'Leaf tissue shows optimal chlorophyll levels. No pathogens detected. Hydration levels consistent with seasonal targets.'}
                </p>
              </div>

              {/* Environmental Metrics */}
              <div className="card-dark rounded-xl p-4 flex-1">
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-4">Environmental Metrics</p>

                <div className="flex flex-col gap-4">
                  {/* Soil resistance */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Soil Resistance</p>
                      <span className="text-[9px] font-mono text-neon-green">{scan?.soil_resistance ?? 68}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${scan?.soil_resistance ?? 68}%` }} />
                    </div>
                  </div>

                  {/* UV Exposure */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">UV Exposure</p>
                      <span className={`text-[9px] font-mono uppercase ${scan?.uv_exposure === 'HIGH' ? 'text-red-400' : scan?.uv_exposure === 'LOW' ? 'text-neon-green' : 'text-amber-400'}`}>
                        {scan?.uv_exposure ?? 'Moderate'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: scan?.uv_exposure === 'HIGH' ? '80%' : scan?.uv_exposure === 'LOW' ? '25%' : '50%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                    </div>
                  </div>

                  {/* External temp */}
                  <div className="card-darker rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-neon-green/10 border border-neon-green/20 rounded-lg flex items-center justify-center">
                      <Thermometer size={14} className="text-neon-green" />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">External Temp</p>
                      <p className="text-sm font-bold text-white">{scan?.temperature ?? 24.2}°C</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sector map mini */}
              <div className="card-dark rounded-xl p-4 relative overflow-hidden" style={{ height: '120px' }}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative flex items-center justify-between h-full">
                  <p className="text-[8px] font-mono text-neon-green/50 uppercase tracking-widest">Sector {scan?.sector ?? 'A-1'}</p>
                  <div className="flex items-center gap-1">
                    <Cpu size={10} className="text-neon-green/40 animate-pulse" />
                    <span className="text-[8px] font-mono text-neon-green/40">Scanning...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
