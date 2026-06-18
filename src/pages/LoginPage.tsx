import { useState } from 'react';
import { Leaf, Eye, EyeOff, Fingerprint, ArrowRight, Wifi } from 'lucide-react';
import LoginVideoBackground from '../components/LoginVideoBackground';


interface Props {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNavigate('dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-forest-950 relative overflow-hidden flex items-center justify-center grid-bg">
      {/* Background video carousel (login only) */}
      <LoginVideoBackground />

      {/* Background radial glow */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(57,211,83,0.05) 0%, transparent 70%)' }} />


      {/* System status – top left */}
      <div className="absolute top-5 left-5 z-10">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="status-dot" style={{ width: '5px', height: '5px' }} />
          <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest">System Status</span>
        </div>
        <p className="text-[9px] font-mono text-white/40 pl-3">v4.2 Neural Core Online</p>
      </div>

      {/* Global farm sync – bottom right */}
      <div className="absolute bottom-5 right-5 z-10 text-right">
        <div className="flex items-center justify-end gap-1.5 mb-0.5">
          <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest">Global Farm Sync</span>
          <Wifi size={10} className="text-neon-green" />
        </div>
        <p className="text-[9px] font-mono text-white/40">Last ping: 0.4ms ago</p>
      </div>

      {/* Secured banner – bottom center */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
        <p className="text-[8px] font-mono text-white/25 tracking-widest uppercase">Secured by Agri-Futurism Encryption Lattice</p>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[340px] mx-4">
        <div className="card-dark rounded-2xl px-7 py-8 shadow-2xl animate-[slideUp_0.4s_ease-out]" style={{ boxShadow: '0 0 60px rgba(57,211,83,0.06), 0 20px 60px rgba(0,0,0,0.5)' }}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/30 rounded-xl flex items-center justify-center mb-3" style={{ boxShadow: '0 0 20px rgba(57,211,83,0.15)' }}>
              <Leaf size={22} className="text-neon-green" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">AgriLens 3D</h1>
            <p className="text-xs text-white/40 mt-0.5">Identify. Analyze. Cultivate.</p>
          </div>

          {/* Farmer ID */}
          <div className="mb-4">
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              Farmer ID / Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                </div>
              </div>
              <input
                type="email"
                placeholder="e.g. j.applesgate@farm.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-forest-800/60 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-neon-green/40 transition-colors"
              />
            </div>
          </div>

          {/* Security key */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Security Key</label>
              <button className="text-[10px] font-mono text-neon-green/70 hover:text-neon-green transition-colors">Forget?</button>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                defaultValue="securekey"
                className="w-full bg-forest-800/60 border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-neon-green/40 transition-colors tracking-widest"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Biometric + remember device */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/10 hover:border-neon-green/30 transition-colors">
                <Fingerprint size={18} className="text-neon-green/60" />
                <span className="text-[8px] font-mono text-white/40">FaceID</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-white/10 hover:border-neon-green/30 transition-colors">
                <Fingerprint size={18} className="text-neon-green/60" />
                <span className="text-[8px] font-mono text-white/40">TouchID</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-white/40">Remember device</span>
              <button
                onClick={() => setRememberDevice(!rememberDevice)}
                className={`w-9 h-5 rounded-full transition-colors relative ${rememberDevice ? 'bg-neon-green' : 'bg-white/15'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${rememberDevice ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Unlock button */}
          <button
            onClick={handleUnlock}
            disabled={loading}
            className="neon-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-forest-900/40 border-t-forest-900 rounded-full animate-spin" />
                Authenticating...
              </>
            ) : (
              <>Unlock Dashboard <ArrowRight size={15} /></>
            )}
          </button>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-5 mt-4">
            <button className="text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors">Privacy Protocol</button>
            <div className="w-px h-3 bg-white/15" />
            <button className="text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors">Emergency Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
