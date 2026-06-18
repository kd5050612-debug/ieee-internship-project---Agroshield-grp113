
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  scan_date date DEFAULT current_date,
  scan_type text DEFAULT 'Hyper-Spectral 3D',
  scanner_id text DEFAULT 'AL-09-X',
  sector text DEFAULT 'Sector A-1',
  health_score integer DEFAULT 94,
  chlorophyll numeric DEFAULT 84.2,
  hydration numeric DEFAULT 67.9,
  nitrogen_level text DEFAULT 'Low',
  disease_detected boolean DEFAULT false,
  disease_name text,
  confidence numeric,
  humidity integer DEFAULT 82,
  temperature numeric DEFAULT 24.0,
  ai_insight text,
  soil_resistance integer DEFAULT 68,
  uv_exposure text DEFAULT 'MODERATE'
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all_scans" ON scans FOR SELECT TO anon USING (true);
CREATE POLICY "insert_scans" ON scans FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_scans" ON scans FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_scans" ON scans FOR DELETE TO anon USING (true);

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  severity text NOT NULL DEFAULT 'warning',
  message text NOT NULL,
  sector text,
  resolved boolean DEFAULT false
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all_alerts" ON alerts FOR SELECT TO anon USING (true);
CREATE POLICY "insert_alerts" ON alerts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_alerts" ON alerts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_alerts" ON alerts FOR DELETE TO anon USING (true);

INSERT INTO scans (scan_date, scan_type, scanner_id, sector, health_score, chlorophyll, hydration, nitrogen_level, disease_detected, disease_name, confidence, humidity, temperature, ai_insight, soil_resistance, uv_exposure)
VALUES
  ('2024-10-24', 'Hyper-Spectral 3D', 'AL-09-X', 'Sector A-1', 94, 84.2, 67.9, 'Optimal', false, null, null, 78, 24.2, 'Leaf tissue shows optimal chlorophyll levels. No pathogens detected. Hydration levels consistent with seasonal targets.', 68, 'MODERATE'),
  ('2024-10-23', 'Hyper-Spectral 3D', 'AL-07-B', 'Sector B-3', 61, 52.1, 43.5, 'Low', true, 'Leaf Rust', 96.3, 82, 24.0, 'Puccinia triticina fungus clusters detected on dorsal surface of 3 leaves. High humidity conditions (82%) have accelerated spore propagation.', 42, 'HIGH'),
  ('2024-10-22', 'Bio-Optical 2D', 'AL-05-C', 'Sector C-7', 87, 79.3, 71.2, 'Moderate', false, null, null, 65, 22.5, 'Minor nitrogen deficiency detected in outer leaf margins. Irrigation schedule on track.', 75, 'LOW');

INSERT INTO alerts (severity, message, sector, resolved)
VALUES
  ('warning', 'Low moisture in Sector 7B', 'Sector 7B', false),
  ('info', 'Drone inspection scheduled', null, false),
  ('warning', 'Nitrogen deficiency detected in Sector C-7', 'Sector C-7', false);
