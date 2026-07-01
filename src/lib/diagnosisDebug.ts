import type { PredictRequest, PredictResponse } from './diagnosisApi';

export async function debugPredictDisease(
  image: File,
  payload?: PredictRequest
): Promise<{ ok: boolean; status?: number; body?: string; response?: PredictResponse; urlTried?: string }> {
  // Scanning backend only; independent from Supabase.
  const baseUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();
  if (!baseUrl) {
    return {
      ok: false,
      status: 503,
      body: 'VITE_BACKEND_URL is not configured. Set it to your deployed FastAPI backend URL in Vercel.',
      urlTried: '<VITE_BACKEND_URL not set>',
    };
  }
  const trimmed = baseUrl.replace(/\/+$/g, '');
  const urlTried = `${trimmed}/predict`;


  const form = new FormData();
  form.append('image', image);

  if (payload) {
    if (typeof payload.soil_resistance === 'number') form.append('soil_resistance', String(payload.soil_resistance));
    if (typeof payload.humidity === 'number') form.append('humidity', String(payload.humidity));
    if (typeof payload.temperature === 'number') form.append('temperature', String(payload.temperature));
    if (payload.language) form.append('language', payload.language);
  }




  const res = await fetch(urlTried!, { method: 'POST', body: form });
  const bodyText = await res.text().catch(() => '');

  if (!res.ok) {
    return { ok: false, status: res.status, body: bodyText, urlTried };
  }

  // Try JSON first, but keep the text for debugging.
  try {
    return { ok: true, status: res.status, body: bodyText, response: JSON.parse(bodyText) as PredictResponse, urlTried };
  } catch {
    return { ok: true, status: res.status, body: bodyText, urlTried };
  }
}

