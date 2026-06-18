import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// IMPORTANT: If env vars are missing, createClient() throws and can blank the entire UI.
// Make Supabase optional so the app can still render.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;


export interface Scan {
  id: string;
  created_at: string;
  scan_date: string;
  scan_type: string;
  scanner_id: string;
  sector: string;
  health_score: number;
  chlorophyll: number;
  hydration: number;
  nitrogen_level: string;
  disease_detected: boolean;
  disease_name: string | null;
  confidence: number | null;
  humidity: number;
  temperature: number;
  ai_insight: string;
  soil_resistance: number;
  uv_exposure: string;
}

export interface Alert {
  id: string;
  created_at: string;
  severity: string;
  message: string;
  sector: string | null;
  resolved: boolean;
}
