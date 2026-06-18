import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Download,
  Lightbulb,
  RotateCw,
  ScanLine,
  Upload,
  Thermometer,
} from 'lucide-react';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import { RiskLevel, RoadmapPhase, PredictResponse } from '../lib/diagnosisApi';

import { debugPredictDisease } from '../lib/diagnosisDebug';
import { predictDiseaseDevFallback } from '../lib/diagnosisApi-devfallback';


interface Props {
  onNavigate: (page: string) => void;
}

function riskToUi(risk?: RiskLevel) {
  if (risk === 'CRITICAL') {
    return {
      badge: 'rgba(239,68,68,0.10)',
      border: 'rgba(239,68,68,0.35)',
      color: 'rgb(248,113,113)',
      text: 'CRITICAL RISK',
    };
  }
  if (risk === 'HIGH') {
    return {
      badge: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.28)',
      color: 'rgb(251,113,133)',
      text: 'HIGH RISK',
    };
  }
  if (risk === 'MODERATE') {
    return {
      badge: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.28)',
      color: 'rgb(251,191,36)',
      text: 'MODERATE RISK',
    };
  }
  return {
    badge: 'rgba(57,211,83,0.06)',
    border: 'rgba(57,211,83,0.22)',
    color: 'rgb(74,222,128)',
    text: 'LOW RISK',
  };
}

function phaseDefault(idx: 1 | 2 | 3 | 4): RoadmapPhase {
  const titles: Record<1 | 2 | 3 | 4, string> = {
    1: 'Immediate Containment',
    2: 'Targeted Eradication',
    3: 'Recovery',
    4: 'Future Prevention',
  };

  const actions: Record<1 | 2 | 3 | 4, string> = {
    1: 'Step-wise: (1) Isolate the affected plant/area. (2) Remove heavily diseased leaves. (3) Clean tools and reduce plant-to-plant contact to limit spread.',
    2: 'Step-wise: (1) Identify symptom progression zones (hotspots). (2) Apply treatment targeted to the likely disease stage. (3) Re-check after 48–72 hours and adjust based on response.',
    3: 'Step-wise: (1) Stabilize irrigation and soil conditions. (2) Support regrowth with balanced nutrition. (3) Monitor new leaf emergence and remove any regrowth that shows recurrence.',
    4: 'Step-wise: (1) Establish a monitoring schedule (weekly photos + notes). (2) Improve preventative hygiene + resistant cultivar strategy. (3) Use weather/humidity-driven alerts to intervene early.',
  };

  return {
    phase: idx,
    title: titles[idx],
    action: actions[idx],
  };
}


function RoadmapSteps({ phases }: { phases: RoadmapPhase[] }) {
  const normalized = useMemo(() => {
    const byPhase = new Map(phases.map((p) => [p.phase, p] as const));
    return [1, 2, 3, 4].map((n) => byPhase.get(n as 1 | 2 | 3 | 4) ?? phaseDefault(n as 1 | 2 | 3 | 4));
  }, [phases]);

  return (
    <div className="card-dark rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Roadmap to Recovery</h3>
          <p className="text-[10px] text-white/40 mt-0.5">Generated from your image + soil/humidity/temperature</p>
        </div>
        <button className="text-[10px] font-mono text-neon-green border border-neon-green/30 rounded px-3 py-1.5 hover:bg-neon-green/10 transition-colors uppercase tracking-widest">
          Export Protocol
        </button>
      </div>

      <div className="flex items-center gap-0">
        {normalized.map((step, i) => {
          const done = i < 1; // UI: mark phase 1 complete
          const active = i === 1;
          return (
            <div key={step.phase} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${done
                    ? 'border-neon-green bg-neon-green/20'
                    : active
                      ? 'border-neon-green bg-neon-green/10'
                      : 'border-white/15 bg-transparent'}`}
                >
                  {done ? (
                    <CheckCircle2 size={13} className="text-neon-green" />
                  ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  ) : (
                    <Circle size={13} className="text-white/20" />
                  )}
                </div>
                <p className="text-[9px] font-mono text-white/60 mt-1.5 text-center">Phase {step.phase}</p>
                <p className="text-[9px] font-semibold text-white mt-0.5 text-center">{step.title}</p>
              </div>
              {i < normalized.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? 'bg-neon-green/50' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded text (simple) */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {normalized.map((p) => (
          <div key={p.phase} className="card-darker rounded-lg px-3 py-2">
            <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Action for Phase {p.phase}</p>
            <p className="text-[11px] text-white/75 mt-1 leading-relaxed">{p.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScannerPage({ onNavigate }: Props) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [soilResistance, setSoilResistance] = useState<number>(68);
  const [humidity, setHumidity] = useState<number>(82);
  const [temperature, setTemperature] = useState<number>(24);
  const [language] = useState<'en' | 'hi'>('en');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);


  const riskUi = useMemo(() => riskToUi(result?.roadmap?.risk_level), [result]);

  const phases = useMemo(() => {
    return result?.roadmap?.phases ?? [phaseDefault(1), phaseDefault(2), phaseDefault(3), phaseDefault(4)];
  }, [result]);

  const onPick = (file: File | null) => {
    setError(null);
    setResult(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!file) {
      setSelectedImage(null);
      setPreviewUrl(null);
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onDiagnose = async () => {
    if (!selectedImage) {
      setError('Please upload a leaf/photo first.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
        // Debug helper: shows the exact backend URL attempted and the raw response.
        try {
          const debug = await debugPredictDisease(selectedImage, {
            soil_resistance: soilResistance,
            humidity,
            temperature,
            language,
          });


          if (debug.ok && debug.response) {
            setResult(debug.response);
            return;
          }

          // Backend not reachable or invalid response -> fallback
          const fallback = await predictDiseaseDevFallback(selectedImage, {
            soil_resistance: soilResistance,
            humidity,
            temperature,
            language,
          });




          setResult(fallback);

          const statusPart = typeof debug.status === 'number' ? `status=${debug.status}` : 'status=unknown';
          const urlPart = debug.urlTried ? `url=${debug.urlTried}` : 'url=unknown';
          const bodyPart = debug.body ? `body=${debug.body.slice(0, 300)}` : 'body=<empty>';
          const joined = [statusPart, urlPart, bodyPart].filter(Boolean).join(' | ');

          setError(
            `Backend returned an error/unreachable -> using dev fallback. ${joined}`
          );
        } catch (e) {
          const fallback = await predictDiseaseDevFallback(selectedImage, {
            soil_resistance: soilResistance,
            humidity,
            temperature,
          });
          setResult(fallback);

          const msg = e instanceof Error ? e.message : 'Unknown error';
          const envUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '<not set>';

          setError(`Network failure contacting backend -> using dev fallback. message="${msg}" VITE_BACKEND_URL=${envUrl}`);
        }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to run diagnosis.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-forest-950 overflow-hidden">
      <AppHeader activePage="scanner" onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage="scanner" onNavigate={onNavigate} showScanBtn={true} />

        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            {/* Left: Upload + Roadmap */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="card-dark rounded-xl overflow-hidden relative" style={{ minHeight: '320px' }}>
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-neon-green/10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-neon-green/10 rounded flex items-center justify-center">
                      <div className="w-2 h-2 rounded-sm bg-neon-green/60" />
                    </div>
                    <span className="text-[10px] font-mono text-neon-green/80 uppercase tracking-widest">Upload & Diagnose</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/30">{loading ? 'Running AI...' : 'Ready'}</span>
                </div>

                {/* Image area */}
                <div className="relative" style={{ height: '260px' }}>
                  <div className="absolute inset-0 grid-bg opacity-20" />

                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Uploaded leaf"
                      className="w-full h-full object-cover opacity-90"
                      style={{ filter: 'saturate(1.2) brightness(0.95)' }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                      <div>
                        <div className="w-14 h-14 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto">
                          <Upload size={22} className="text-neon-green" />
                        </div>
                        <p className="mt-3 text-sm font-semibold">Upload a leaf photo</p>
                        <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                          Your backend will detect disease / health status and generate an explainable heatmap + roadmap.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* HUD corners */}
                  <div className="corner-tl" />
                  <div className="corner-tr" />
                  <div className="corner-bl" />
                  <div className="corner-br" />

                  <div className="scan-line" />
                </div>

                {/* Upload controls */}
                <div className="px-4 py-3 border-t border-neon-green/10">
                  <label className="outline-btn w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs cursor-pointer">
                    <Upload size={14} className="text-neon-green" />
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                    />
                  </label>

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={onDiagnose}
                      className="neon-btn flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-60"
                      disabled={loading}
                    >
                      <ScanLine size={14} />
                      {loading ? 'Diagnosing...' : 'Diagnose'}
                    </button>
                    <button
                      className="outline-btn w-28 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs"
                      onClick={() => {
                        setError(null);
                        setResult(null);
                        onPick(null);
                      }}
                      disabled={loading}
                    >
                      <RotateCw size={14} className="text-neon-green" />
                      Reset
                    </button>
                  </div>

                  {error && <p className="text-[11px] text-red-300 mt-2">{error}</p>}
                </div>
              </div>

              {/* Roadmap */}
              <RoadmapSteps phases={phases} />
            </div>

            {/* Right: Diagnosis + XAI + Environment */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${riskUi.border}`, background: 'rgba(10,5,5,0.8)' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: riskUi.badge, borderBottom: '1px solid rgba(0,0,0,0.2)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest">Diagnosis</span>
                    {result && (
                      <span className="text-[8px] font-mono text-white/30">{Math.round(result.confidence * 100)}% Confidence</span>
                    )}
                  </div>
                  <div className="text-[9px] font-mono" style={{ color: riskUi.color }}>
                    {result?.roadmap?.risk_level ? riskUi.text : 'PENDING'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-white mb-1">
                    {result ? result.disease_name : '—'}
                  </h3>

                  <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                    {result?.ai_insight ?? 'Upload a leaf photo. We will combine your image with soil, humidity and temperature to generate an explainable AI insight + cure roadmap.'}
                  </p>

                  {/* Immediate Risk */}
                  <div className="rounded-lg p-3 mb-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-red-400 mb-0.5">AI Risk Summary (step-wise)</p>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                          {result?.roadmap?.risk_level ? (
                            <>
                              <b className="text-white/70">Risk level:</b> {result.roadmap.risk_level}.<br />
                              <b className="text-white/70">What the app uses:</b> humidity, temperature, and soil resistance (plus image evidence, if your backend enables it).<br />
                              <b className="text-white/70">Why it matters:</b> higher humidity generally increases leaf-wetness time → faster pathogen growth; soil stress can weaken the plant’s defenses; temperature shifts incubation speed.
                            </>
                          ) : (
                            '—'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>


                  {/* AI Recommendation */}
                  <div className="rounded-lg p-3" style={{ background: 'rgba(57,211,83,0.05)', border: '1px solid rgba(57,211,83,0.2)' }}>
                    <div className="flex items-start gap-2">
                      <Lightbulb size={13} className="text-neon-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-neon-green mb-0.5">Explainable AI (XAI) + Grad-CAM</p>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                          <b className="text-white/70">What it is:</b> Grad-CAM produces a heatmap of pixels/regions that most influenced the disease prediction in the CNN.
                          <br />
                          <b className="text-white/70">How to read it:</b> brighter/redder regions suggest stronger contribution to the chosen class.
                          <br />
                          <b className="text-white/70">What it does NOT guarantee:</b> XAI can highlight correlated patterns (lighting, background texture) and should be used as decision support, not proof.
                          <br />
                          <b className="text-white/70">Next best action:</b> if the heatmap highlights non-lesion areas, treat the prediction as lower confidence and cross-check symptoms.
                        </p>
                      </div>
                    </div>
                  </div>


                  {/* Heatmap */}
                  {result?.explainable_ai?.heatmap_base64 && (
                    <div className="mt-3">
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">Grad-CAM Heatmap</p>
                      <div className="card-dark rounded-xl overflow-hidden">
                        <img
                          src={`data:image/png;base64,${result.explainable_ai.heatmap_base64}`}
                          alt="Grad-CAM heatmap"
                          className="w-full h-auto opacity-95"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = 'none';
                          }}
                        />
                      </div>
                      {!result?.explainable_ai?.heatmap_url && (
                        <p className="text-[10px] text-white/40 mt-2">If the heatmap fails to render, the backend may still be generating it.</p>
                      )}
                    </div>
                  )}

                  {result?.explainable_ai?.heatmap_url && (
                    <div className="mt-3">
                      <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2">Grad-CAM Heatmap</p>
                      <div className="card-dark rounded-xl overflow-hidden">
                        <img
                          src={result.explainable_ai.heatmap_url}
                          alt="Grad-CAM heatmap"
                          className="w-full h-auto opacity-95"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Field Environment */}
              <div className="card-dark rounded-xl p-4">
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest mb-3">Soil / Humidity / Temperature</p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="card-darker rounded-lg p-3">
                    <p className="text-[8px] font-mono text-white/35 uppercase tracking-widest mb-1">Soil Resistance</p>
                    <input
                      type="number"
                      value={soilResistance}
                      onChange={(e) => setSoilResistance(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-white font-semibold"
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-[10px] text-white/50 mt-1">{soilResistance}%</p>
                  </div>

                  <div className="card-darker rounded-lg p-3">
                    <p className="text-[8px] font-mono text-white/35 uppercase tracking-widest mb-1">Humidity</p>
                    <input
                      type="number"
                      value={humidity}
                      onChange={(e) => setHumidity(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-white font-semibold"
                      min={0}
                      max={100}
                      step={1}
                    />
                    <p className="text-[10px] text-white/50 mt-1">{humidity}%</p>
                  </div>

                  <div className="card-darker rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] font-mono text-white/35 uppercase tracking-widest">Temperature</p>
                      <Thermometer size={14} className="text-neon-green" />
                    </div>
                    <input
                      type="number"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full bg-transparent outline-none text-white font-semibold mt-2"
                      min={-10}
                      max={60}
                      step={0.1}
                    />
                    <p className="text-[10px] text-white/50 mt-1">{temperature}°C</p>
                  </div>
                </div>
              </div>

              {/* Quick download button */}
              <button
                className="outline-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                disabled={!result}
                onClick={() => {
                  // Optional: later we can export from backend. For now just download current info.
                  if (!result) return;
                  const payload = JSON.stringify(result, null, 2);
                  const blob = new Blob([payload], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `scan-report-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={15} className="text-neon-green" />
                Download Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

