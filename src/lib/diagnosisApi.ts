export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RoadmapPhase {
  phase: 1 | 2 | 3 | 4;
  title: string;
  action: string;
  timing?: string;
}

export interface ExplainableAI {
  heatmap_base64?: string;
  heatmap_url?: string;
  summary?: string;
}

export interface PredictRequest {
  soil_resistance?: number;
  humidity?: number;
  temperature?: number;
  language?: string;
}


export interface PredictResponse {
  disease_detected: boolean;
  disease_name: string;
  confidence: number;
  soil: {
    soil_resistance?: number;
  };
  humidity?: number;
  temperature?: number;
  ai_insight: string;
  explainable_ai?: ExplainableAI;
  roadmap?: {
    risk_level: RiskLevel;
    phases: RoadmapPhase[];
  };
}

const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://127.0.0.1:8000';

function getBackendBaseUrl() {
  // Always resolve to a usable URL for debug.
  return backendBaseUrl.replace(/\/+$/g, '');
}

export async function predictDisease(image: File, payload?: PredictRequest): Promise<PredictResponse> {
  const baseUrl = getBackendBaseUrl();



  const form = new FormData();
  form.append('image', image);

  if (payload) {
    if (typeof payload.soil_resistance === 'number') form.append('soil_resistance', String(payload.soil_resistance));
    if (typeof payload.humidity === 'number') form.append('humidity', String(payload.humidity));
    if (typeof payload.temperature === 'number') form.append('temperature', String(payload.temperature));
    if (payload.language) form.append('language', payload.language);
  }


  const res = await fetch(`${baseUrl}/predict`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as PredictResponse;
}

