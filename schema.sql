-- =============================================================
-- SNU Alumni Attendance schema (production-ready)
-- =============================================================

-- 1) Utility trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) event_settings: single-row config table (id = 1)
CREATE TABLE IF NOT EXISTS event_settings (
  id INTEGER PRIMARY KEY,
  event_title TEXT NOT NULL DEFAULT '동문회 참석 신청',
  event_datetime_text TEXT NOT NULL DEFAULT '2026년 5월 12일',
  place_name TEXT NOT NULL DEFAULT '여의도',
  naver_map_url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_settings_single_row CHECK (id = 1)
);

-- Backfill/normalize columns for existing tables
ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS event_datetime_text TEXT;
ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS place_name TEXT;
ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS naver_map_url TEXT;
ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE event_settings
SET
  event_title = COALESCE(NULLIF(event_title, ''), '동문회 참석 신청'),
  event_datetime_text = COALESCE(NULLIF(event_datetime_text, ''), '2026년 5월 12일'),
  place_name = COALESCE(NULLIF(place_name, ''), '여의도'),
  naver_map_url = COALESCE(naver_map_url, ''),
  updated_at = COALESCE(updated_at, NOW())
WHERE id = 1;

INSERT INTO event_settings (id, event_title, event_datetime_text, place_name, naver_map_url)
VALUES (1, '동문회 참석 신청', '2026년 5월 12일', '여의도', '')
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS trg_event_settings_updated_at ON event_settings;
CREATE TRIGGER trg_event_settings_updated_at
BEFORE UPDATE ON event_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 3) attendees: submission records
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  department TEXT NOT NULL,
  name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('참석', '불참', '미정')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE attendees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Duplicate prevention at DB level
-- Reason: student_id is the most stable unique identifier in this workflow.
CREATE UNIQUE INDEX IF NOT EXISTS attendees_student_id_uidx ON attendees (student_id);

DROP TRIGGER IF EXISTS trg_attendees_updated_at ON attendees;
CREATE TRIGGER trg_attendees_updated_at
BEFORE UPDATE ON attendees
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 4) RLS: least privilege (server-side service_role only)
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_settings_service_role_select ON event_settings;
DROP POLICY IF EXISTS event_settings_service_role_insert ON event_settings;
DROP POLICY IF EXISTS event_settings_service_role_update ON event_settings;
DROP POLICY IF EXISTS attendees_service_role_select ON attendees;
DROP POLICY IF EXISTS attendees_service_role_insert ON attendees;
DROP POLICY IF EXISTS attendees_service_role_update ON attendees;

CREATE POLICY event_settings_service_role_select
ON event_settings
FOR SELECT
TO service_role
USING (true);

CREATE POLICY event_settings_service_role_insert
ON event_settings
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY event_settings_service_role_update
ON event_settings
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY attendees_service_role_select
ON attendees
FOR SELECT
TO service_role
USING (true);

CREATE POLICY attendees_service_role_insert
ON attendees
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY attendees_service_role_update
ON attendees
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
