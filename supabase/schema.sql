-- SNU Alumni event schema (column-based event_settings)

CREATE TABLE IF NOT EXISTS event_settings (
  id INTEGER PRIMARY KEY,
  event_title TEXT,
  event_datetime_text TEXT,
  place_name TEXT,
  naver_map_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO event_settings (id, event_title, event_datetime_text, place_name, naver_map_url)
VALUES (1, '동문회 참석 신청', '2026년 5월 12일', '여의도', '')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  department TEXT NOT NULL,
  name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('참석', '불참', '미정')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_settings_read" ON event_settings FOR SELECT USING (true);
CREATE POLICY "event_settings_update" ON event_settings FOR UPDATE USING (true);
CREATE POLICY "event_settings_insert" ON event_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "attendees_insert" ON attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "attendees_select" ON attendees FOR SELECT USING (true);
