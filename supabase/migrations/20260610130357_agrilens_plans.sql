
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order integer NOT NULL DEFAULT 0,
  name text NOT NULL,
  tier_id text NOT NULL UNIQUE,
  sub_label text NOT NULL,
  price_monthly integer,
  price_yearly integer,
  price_label text,
  popular boolean DEFAULT false,
  cta_label text NOT NULL,
  cta_variant text NOT NULL DEFAULT 'outline',
  features text[] DEFAULT '{}'
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all_plans" ON plans FOR SELECT TO anon USING (true);
CREATE POLICY "insert_plans"     ON plans FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_plans"     ON plans FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_plans"     ON plans FOR DELETE TO anon USING (true);

INSERT INTO plans (sort_order, name, tier_id, sub_label, price_monthly, price_yearly, price_label, popular, cta_label, cta_variant, features) VALUES
(1, 'Basic',      'basic',      'For Individual Farmers', 49,  39,  null,     false, 'Start Seeding',    'outline', ARRAY[
  'Single Sector Telemetry',
  '5 AI Diagnostics / Week',
  'Standard 3D Mapping',
  'Email Growth Support'
]),
(2, 'Pro',        'pro',        'Medium Operations',      149, 119, null,     true,  'Optimize Now',     'filled',  ARRAY[
  'Unlimited Sector Telemetry',
  '50 AI Diagnostics / Week',
  'Real-time Drone Sync',
  'Predictive Yield Modeling',
  '24/7 Priority Comms'
]),
(3, 'Enterprise', 'enterprise', 'Global Networks',        null, null, 'Custom', false, 'Contact Logistics','outline', ARRAY[
  'Unlimited Satellite Scans',
  'Fleet-wide AI Deployment',
  'Global Market Integration',
  'Dedicated System Architect'
]);
