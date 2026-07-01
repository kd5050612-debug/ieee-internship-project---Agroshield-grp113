import { useState } from 'react';
import { Leaf, Eye, EyeOff, Fingerprint, ArrowRight, Wifi } from 'lucide-react';
import LoginVideoBackground from '../components/LoginVideoBackground';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../lib/i18n';

interface Props {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: Props) {
  const { t } = useTranslation('login');
  const { login } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleUnlock = async () => {
    setLoginError(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLoginError('Enter a valid email to continue.');
      return;
    }

    if (!password) {
      setLoginError('Enter any security key to continue.');
      return;
    }

    setLoading(true);
    try {
      await login(email);
      window.setTimeout(() => onNavigate('dashboard'), 350);
    } catch (e: any) {
      setLoginError(e?.message ?? 'Login failed');
    } finally {
      window.setTimeout(() => setLoading(false), 350);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 relative overflow-hidden flex items-center justify-center grid-bg">
      <LoginVideoBackground />

      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(57,211,83,0.05) 0%, transparent 70%)' }} />

      <div className="absolute top-5 left-5 z-10">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="status-dot" style={{ width: '5px', height: '5px' }} />
          <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest">
            {t('systemStatus', 'System Status')}
          </span>
        </div>
        <p className="text-[9px] font-mono text-white/40 pl-3">v4.2 Neural Core Online</p>
      </div>

      <div className="absolute bottom-5 right-5 z-10 text-right">
        <div className="flex items-center justify-end gap-1.5 mb-0.5">
          <span className="text-[9px] font-mono text-neon-green uppercase tracking-widest">
            {t('globalFarmSync', 'Global Farm Sync')}
          </span>
          <Wifi size={10} className="text-neon-green" />
        </div>
        <p className="text-[9px] font-mono text-white/40">Local session</p>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
        <p className="text-[8px] font-mono text-white/25 tracking-widest uppercase">
          {t('encryptionLattice', 'Secured by Agri-Futurism Encryption Lattice')}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-[340px] mx-4">
        <div className="card-dark rounded-2xl px-7 py-8 shadow-2xl animate-[slideUp_0.4s_ease-out]" style={{ boxShadow: '0 0 60px rgba(57,211,83,0.06), 0 20px 60px rgba(0,0,0,0.5)' }}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/30 rounded-xl flex items-center justify-center mb-3" style={{ boxShadow: '0 0 20px rgba(57,211,83,0.15)' }}>
              <Leaf size={22} className="text-neon-green" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">AgriLens 3D</h1>
            <p className="text-xs text-white/40 mt-0.5">
              {t('tagline', 'Identify. Analyze. Cultivate.')}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-mono text-white/50 uppercase tracking-widest mb-1.5">
              {t('farmerIdLabel', 'Farmer ID / Email')}
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

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                {t('securityKeyLabel', 'Security Key')}
              </label>
              <button className="text-[10px] font-mono text-neon-green/70 hover:text-neon-green transition-colors">
                {t('forgetKey', 'Forget?')}
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              <span className="text-[9px] font-mono text-white/40">
                {t('rememberDevice', 'Remember device')}
              </span>
              <button
                onClick={() => setRememberDevice(!rememberDevice)}
                className={`w-9 h-5 rounded-full transition-colors relative ${rememberDevice ? 'bg-neon-green' : 'bg-white/15'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${rememberDevice ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={loading}
            className="neon-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-forest-900/40 border-t-forest-900 rounded-full animate-spin" />
                {t('authenticating', 'Authenticating...')}
              </>
            ) : (
              <>
                {t('unlockDashboard', 'Unlock Dashboard')} <ArrowRight size={15} />
              </>
            )}
          </button>

          {loginError && (
            <div className="mt-3 text-[10px] text-amber-300/90 border border-amber-300/20 bg-amber-500/5 rounded px-2 py-1">
              {loginError}
            </div>
          )}

          <div className="flex items-center justify-center gap-5 mt-4">
            <button className="text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors">
              {t('privacyProtocol', 'Privacy Protocol')}
            </button>
            <div className="w-px h-3 bg-white/15" />
            <button className="text-[9px] font-mono text-white/30 hover:text-white/60 transition-colors">
              {t('emergencySupport', 'Emergency Support')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
