-- 서울대 동문회 참석 신청 DB 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 이벤트 설정 (장소 등 - admin이 수정)
CREATE TABLE IF NOT EXISTS event_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 장소 설정 (여의도)
INSERT INTO event_settings (key, value) VALUES 
  ('location', '서울특별시 영등포구 여의도동')
ON CONFLICT (key) DO NOTHING;

-- 참석자 테이블
CREATE TABLE IF NOT EXISTS attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  department TEXT NOT NULL,
  name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('참석', '불참', '미정')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- event_settings: 모든 사용자 읽기 가능, admin 페이지에서 수정 가능 (추후 인증 추가 권장)
CREATE POLICY "event_settings_read" ON event_settings FOR SELECT USING (true);
CREATE POLICY "event_settings_update" ON event_settings FOR UPDATE USING (true);
CREATE POLICY "event_settings_insert" ON event_settings FOR INSERT WITH CHECK (true);

-- attendees: 모든 사용자 삽입 가능, 읽기는 제한 (관리자만)
CREATE POLICY "attendees_insert" ON attendees FOR INSERT WITH CHECK (true);
CREATE POLICY "attendees_select" ON attendees FOR SELECT USING (true);
