/**
 * Supabase 설정
 * 배포 전에 Supabase 프로젝트에서 URL과 anon key를 입력해주세요.
 * https://supabase.com/dashboard 에서 프로젝트 생성 후
 * Settings > API 에서 확인할 수 있습니다.
 */
const SUPABASE_CONFIG = {
  url: 'https://cyliqqlceeotrhjjnebf.supabase.co',      // 예: https://xxxxx.supabase.co
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5bGlxcWxjZWVvdHJoampuZWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNjI5MDQsImV4cCI6MjA4NzkzODkwNH0.c_IMVxqrBYlb_KfwyOfCVni0OM_qpkjYqNrkJjoACNo'
};

// Supabase 클라이언트 초기화 (supabase-js CDN 로드 후 실행)
if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL') {
  window.supabase = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
} else {
  window.supabase = null;
}
