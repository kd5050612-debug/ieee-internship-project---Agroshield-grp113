
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  author_name text NOT NULL,
  author_role text NOT NULL,
  author_avatar text,
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  tags text[] DEFAULT '{}',
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  posted_ago text DEFAULT 'just now'
);

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_all_posts" ON forum_posts FOR SELECT TO anon USING (true);
CREATE POLICY "insert_posts" ON forum_posts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_posts" ON forum_posts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_posts" ON forum_posts FOR DELETE TO anon USING (true);

INSERT INTO forum_posts (author_name, author_role, author_avatar, title, body, image_url, tags, likes, comments, posted_ago) VALUES
(
  'Erik Gustafson',
  'Sector 4 Specialist',
  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80',
  'Success with Precision Nitrogen in Sector 4',
  'After applying the AI-recommended dosage, I''ve seen a 12% increase in chlorophyll levels within 72 hours. The multispectral drone imagery confirms the normalization of nitrogen across the entire plot. If anyone is hesitant about the auto-modulating fertilizer rigs, now is the time to switch...',
  'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['PRECISION DATA', 'SECTOR 4'],
  1300,
  84,
  '2 hours ago'
),
(
  'Elena Vance',
  'Hydroponic Specialist',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
  'Unexpected PH fluctuations in Vertical Block B',
  'Started noticing a rhythmic dip in PH levels every 6 hours. Sensors are calibrated but the trend persists. It seems to correlate with the new nutrient infusion pump cycle. Anyone else experiencing sensor drift or pump calibration errors with the v4.2 update?',
  null,
  ARRAY['HYDROPONICS', 'PH MONITORING'],
  847,
  62,
  '5 hours ago'
),
(
  'James Okoro',
  'Drone Fleet Manager',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80',
  'Fleet Sync Protocol Update — v4.3 Changelog',
  'The new v4.3 drone firmware dramatically improved path optimization. Field coverage increased by 23% on our largest sectors. Rolling it out to all 48 units this week. Happy to share the deployment config if anyone wants it.',
  'https://images.pexels.com/photos/442587/pexels-photo-442587.jpeg?auto=compress&cs=tinysrgb&w=800',
  ARRAY['DRONES', 'FIRMWARE', 'FLEET'],
  2100,
  137,
  '1 day ago'
);
