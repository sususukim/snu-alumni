# SNU Alumni Attendance

정적 웹페이지 + Supabase 기반 참석 신청 서비스입니다.

## 보안 변경 사항 (2026-03-08)
- `config.js` 제거
- Supabase 키는 코드에 하드코딩하지 않고 Vercel 환경변수에서 주입
- 관리자 페이지는 `/api/admin/login` 비밀번호 인증 후 접근
- 관리자 데이터 조회/수정은 서버 API(`service_role` 사용) 경유

## Vercel 환경변수
아래 값을 Vercel Project Settings > Environment Variables 에 등록하세요.

- `SUPABASE_URL`: 예) `https://xxxxx.supabase.co`
- `SUPABASE_ANON_KEY`: Supabase publishable/anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service_role key (절대 공개 금지)
- `ADMIN_PASSWORD`: 관리자 로그인 비밀번호
- `ADMIN_SESSION_SECRET`: 세션 서명용 랜덤 긴 문자열

권장: 값 등록 후 기존 노출된 비밀키가 있었다면 Supabase에서 즉시 Rotate 하세요.

## DB 초기화
`supabase/schema.sql` 파일은 "설명서"가 아니라 실제 DB 생성 SQL입니다.
반드시 Supabase Dashboard > SQL Editor 에서 실행해야 테이블이 생성됩니다.

실행 대상:
- `event_settings`
- `attendees`
- RLS 및 정책

## 로컬 파일 구조 핵심
- `index.html`, `app.js`: 사용자 신청 페이지
- `admin.html`, `admin.js`: 관리자 페이지 UI
- `api/public-config.js`: 브라우저용 공개 설정 제공
- `api/admin/login.js`: 관리자 로그인
- `api/admin/location.js`: 장소 조회/수정 (인증 필요)
- `api/admin/attendees.js`: 참석자 목록 조회 (인증 필요)

## 배포
1. 변경 커밋
2. `git push origin <branch>`
3. Vercel 자동 배포 확인

## 주의
- 프론트에 `service_role`를 넣으면 안 됩니다.
- `anon/publishable` 키는 클라이언트에 노출돼도 되지만, RLS 정책은 반드시 최소권한으로 유지하세요.
