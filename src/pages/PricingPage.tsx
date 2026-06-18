import { useEffect, useState } from 'react';
import { CheckCircle2, Search, Bell, Settings, Leaf } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  sort_order: number;
  name: string;
  tier_id: string;
  sub_label: string;
  price_monthly: number | null;
  price_yearly: number | null;
  price_label: string | null;
  popular: boolean;
  cta_label: string;
  cta_variant: string;
  features: string[];
}

interface Props {
  onNavigate: (page: string) => void;
}

export default function PricingPage({ onNavigate }: Props) {
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Keep UI responsive even if Supabase env vars are missing.
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from('plans')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data) setPlans(data);
      })
      .then(() => undefined, () => undefined)
      .then(() => setLoading(false));

  }, []);



  const getPrice = (plan: Plan) => {
    if (plan.price_label) return plan.price_label;
    const p = yearly ? plan.price_yearly : plan.price_monthly;
    return p !== null ? `$${p}` : null;
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-3 border-b border-neon-green/10 bg-forest-950/95 backdrop-blur sticky top-0 z-20">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
          <Leaf size={18} className="text-neon-green" />
          <span className="text-xl font-bold text-neon-green tracking-tight">AeroField 3D</span>
        </button>

        <nav className="hidden md:flex items-center gap-7">
          {['Dashboard', 'Field View', 'Analytics', 'Fleet'].map(item => (
            <button
              key={item}
              onClick={() => onNavigate(item === 'Dashboard' ? 'dashboard' : item.toLowerCase().replace(' ', '-'))}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              placeholder="Search parameters..."
              className="bg-forest-800/60 border border-white/10 rounded-lg pl-8 pr-4 py-1.5 text-xs text-white/50 placeholder:text-white/25 outline-none focus:border-neon-green/30 transition-colors w-44"
            />
          </div>
          <button className="w-8 h-8 rounded-lg bg-forest-800/60 border border-white/10 flex items-center justify-center hover:border-neon-green/25 transition-colors">
            <Bell size={14} className="text-white/40" />
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="w-8 h-8 rounded-lg bg-forest-800/60 border border-white/10 flex items-center justify-center hover:border-neon-green/25 transition-colors"
          >
            <Settings size={14} className="text-white/40" />
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="w-8 h-8 rounded-full overflow-hidden border border-neon-green/25"
          >
            <img
              src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60"
              alt="User"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-6 py-16 relative overflow-y-auto">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(57,211,83,0.07) 0%, transparent 60%)' }}
        />

        {/* Hero */}
        <div className="relative z-10 text-center max-w-2xl mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-1">
            Precision Stewardship,
          </h1>
          <h1 className="text-4xl md:text-5xl font-bold text-neon-green leading-tight mb-5">
            Quantified Growth.
          </h1>
          <p className="text-sm text-white/45 leading-relaxed">
            Select the operational scale that fits your yield goals. Our 3D telemetry and AI<br className="hidden md:block" />
            diagnostic suite scale with your ambition.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-white' : 'text-white/40'}`}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(v => !v)}
              className={`w-12 h-6 rounded-full relative transition-colors ${yearly ? 'bg-neon-green' : 'bg-white/15'}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${yearly ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${yearly ? 'text-neon-green' : 'text-white/40'}`}>
              Yearly{' '}
              <span className="text-[10px] font-mono text-neon-green/60">(20% OFF)</span>
            </span>
          </div>
        </div>

        {/* Plan cards */}
        {loading ? (
          <div className="relative z-10 flex items-center gap-2 text-white/30">
            <div className="w-4 h-4 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
            <span className="text-sm font-mono">Loading plans...</span>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
            {plans.map(plan => {
              const price = getPrice(plan);
              const isMonthlyPriced = !plan.price_label && plan.price_monthly !== null;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl flex flex-col transition-all ${plan.popular
                    ? 'border-2 border-neon-green bg-forest-800/50'
                    : 'card-dark hover:border-neon-green/30'}`}
                  style={plan.popular ? { boxShadow: '0 0 40px rgba(57,211,83,0.12)' } : {}}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-neon-green text-forest-950 text-[9px] font-bold uppercase tracking-widest rounded-full px-4 py-1">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Name */}
                    <div className="mb-5">
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      <p className="text-[10px] font-mono text-white/35 uppercase tracking-widest mt-0.5">{plan.sub_label}</p>
                      {plan.price_label && (
                        <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mt-0.5">Volume Pricing</p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {price ? (
                        <div className="flex items-end gap-1">
                          <span className="text-4xl font-bold text-white">{price}</span>
                          {isMonthlyPriced && (
                            <span className="text-sm text-white/35 mb-1.5">/mo</span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Features */}
                    <ul className="flex flex-col gap-2.5 flex-1 mb-7">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-neon-green mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-white/65 leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => onNavigate('login')}
                      className={`w-full py-3 rounded-xl font-semibold text-sm uppercase tracking-wide transition-all ${plan.cta_variant === 'filled'
                        ? 'neon-btn'
                        : 'outline-btn border border-white/20 hover:border-neon-green/40'}`}
                    >
                      {plan.cta_label}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
