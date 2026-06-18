import type { PredictRequest, PredictResponse } from './diagnosisApi';

// Dev-only fallback: returns a deterministic stub response.
// This avoids "failed to fetch" when the FastAPI backend isn't running.
export async function predictDiseaseDevFallback(
  _image: File,
  payload?: PredictRequest
): Promise<PredictResponse> {
  const humidity = payload?.humidity;
  const soil_resistance = payload?.soil_resistance;
  const temperature = payload?.temperature;
  // language affects farmer-friendly copy only in the real backend.
  // dev fallback intentionally keeps static English so the app works.

  let riskLevel: NonNullable<PredictResponse['roadmap']>['risk_level'] = 'LOW';

  const h = humidity ?? 0;

  if (h > 80) riskLevel = 'CRITICAL';
  else if (h > 65) riskLevel = 'HIGH';
  else if (h > 40) riskLevel = 'MODERATE';

  const phases: NonNullable<PredictResponse['roadmap']>['phases'] = [
    {
      phase: 1,
      title: 'Immediate Containment',
      action: 'Dev fallback: isolate affected leaves and apply appropriate early-stage treatment.',
    },
    {
      phase: 2,
      title: 'Targeted Eradication',
      action: 'Dev fallback: remove hotspots and apply targeted measures based on observed symptoms.',
    },
    {
      phase: 3,
      title: 'Recovery',
      action: 'Dev fallback: improve soil health and follow a recovery protocol.',
    },
    {
      phase: 4,
      title: 'Future Prevention',
      action: 'Dev fallback: schedule preventive steps for next cycle.',
    },
  ];

  return {
    disease_detected: true,
    disease_name: 'Dev fallback disease (backend not reachable)',
    confidence: 0.5,
    soil: { soil_resistance },
    humidity,
    temperature,
    ai_insight: 'Dev fallback response: backend /predict endpoint is not reachable. Replace with real FastAPI output.',
    explainable_ai: {
      summary: 'Dev fallback heatmap unavailable.',
    },
    roadmap: {
      risk_level: riskLevel,
      phases,
    },
  };
}


