import { Leaf, ArrowRight, Play, Cpu } from 'lucide-react';



interface Props {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-forest-900 relative overflow-hidden">
      {/* Background grid + radial glow */}
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 radial-glow" style={{ background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(57,211,83,0.08) 0%, transparent 70%)' }} />

      {/* Nav */}
      <header className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-neon-green/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon-green/10 rounded-lg border border-neon-green/30 flex items-center justify-center">
            <Leaf size={16} className="text-neon-green" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">AgriLens <span className="text-neon-green">3D</span></span>
        </div>
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: 'Dashboard', id: 'dashboard' },
            { label: 'Scanner', id: 'scanner' },
            { label: 'Map', id: 'map' },
            { label: 'Community', id: 'forum' },
            { label: 'Pricing', id: 'pricing' },
          ].map(({ label, id }, i) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`text-sm transition-colors ${i === 0 ? 'text-neon-green border-b border-neon-green pb-0.5' : 'text-white/60 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('login')} className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
            Login
          </button>
          <button onClick={() => onNavigate('scanner')} className="neon-btn px-4 py-2 rounded-full text-sm">
            Scan Now
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-12 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="animate-[fadeIn_0.6s_ease-out]">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-forest-800/80 border border-neon-green/25 rounded-full px-3 py-1.5 mb-8">
            <span className="status-dot" />
            <span className="text-xs font-mono text-neon-green tracking-widest uppercase">94.9 Live Analysis Active</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Seeing the <span className="neon-text">Invisible</span><br />
            Pulse of Your Crops.
          </h1>
          <p className="text-white/55 text-base leading-relaxed mb-8 max-w-md">
            Deploy AgriLens 3D's hyper-spectral imaging to detect cellular stress
            14 days before it's visible to the human eye. Precise stewardship
            through advanced bio-optics.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('login')}
              className="neon-btn px-6 py-3 rounded-lg flex items-center gap-2 text-sm"
            >
              Enter Experience <ArrowRight size={15} />
            </button>
            <button className="outline-btn px-5 py-3 rounded-lg flex items-center gap-2 text-sm">
              <Play size={14} className="text-neon-green" />
              View Demo
            </button>
          </div>

          {/* Stat cards */}
          <div className="mt-10 flex gap-3">
            <div className="card-dark rounded-lg px-4 py-3 min-w-[110px]">
              <p className="text-[9px] font-mono text-neon-green/70 tracking-widest uppercase mb-1">Chlorophyll</p>
              <p className="text-2xl font-bold text-neon-green">84.2%</p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: '84.2%' }} />
              </div>
            </div>
            <div className="card-dark rounded-lg px-4 py-3 min-w-[110px]">
              <p className="text-[9px] font-mono text-neon-green/70 tracking-widest uppercase mb-1">Hydration</p>
              <p className="text-2xl font-bold text-white">67.9%</p>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{ width: '67.9%' }} />
              </div>
            </div>
            <div className="card-dark rounded-lg px-4 py-3 min-w-[100px]">
              <p className="text-[9px] font-mono text-amber-400/80 tracking-widest uppercase mb-1">Nitrogen</p>
              <p className="text-2xl font-bold text-amber-400">Low</p>
              <div className="progress-bar mt-2" style={{ background: 'rgba(251,191,36,0.15)' }}>
                <div className="progress-fill" style={{ width: '28%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right – Scanning visualization */}
        <div className="relative flex items-center justify-center animate-[fadeIn_0.8s_ease-out]">
          {/* HUD frame */}
          <div className="relative w-full max-w-[420px] aspect-[4/3] card-dark rounded-xl overflow-hidden">
            {/* Corner brackets */}
            <div className="corner-tl" />
            <div className="corner-tr" />
            <div className="corner-bl" />
            <div className="corner-br" />

            {/* Scan status bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-forest-900/80 border border-neon-green/30 rounded-full px-3 py-1">
              <Cpu size={11} className="text-neon-green animate-pulse" />
              <span className="text-[10px] font-mono text-neon-green tracking-widest">SCANNING TISSUE...</span>
            </div>

            {/* Scan line */}
            <div className="scan-line" style={{ top: 0, background: 'linear-gradient(90deg, transparent, rgba(57,211,83,0.6), transparent)', zIndex: 5 }} />

              {/* Looping video (replaces Meshy model) */}
              <div className="relative w-full h-full" style={{ background: 'transparent', zIndex: 1 }}>

                <video
                  className="w-full h-full object-contain bg-transparent"
                  src="/video2/Screen Recording 2026-06-11 131319.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls={false}
                  style={{ background: 'transparent', backgroundColor: 'transparent', display: 'block' }}
                />

              </div>





            {/* Radial glow under */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(57,211,83,0.3) 0%, transparent 70%)', filter: 'blur(8px)' }} />

            {/* HUD overlays */}
            <div className="absolute top-4 right-4 w-20 h-14 card-darker rounded opacity-80">
              {/* mini bar chart */}
              <div className="p-1.5">
                <div className="flex items-end gap-0.5 h-8">
                  {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(57,211,83,${0.4 + i * 0.08})` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Stoma tooltip */}
            <div className="absolute bottom-10 right-3 card-dark rounded-lg px-3 py-2 text-right" style={{ zIndex: 6 }}>

              <p className="text-[9px] font-mono text-neon-green/70 uppercase tracking-widest">Stoma Opening</p>
              <p className="text-sm font-bold text-neon-green">12.4μm</p>
            </div>

            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
          </div>
        </div>
      </main>
    </div>
  );
}
