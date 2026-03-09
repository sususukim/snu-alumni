# SNU Alumni Attendance Web App

서울대 동문회 참석 여부를 수집하는 웹앱입니다.

- 사용자 페이지: `/`
- 관리자 페이지: `/admin`
- 배포: Vercel
- DB: Supabase (서버 API에서 service_role 사용)

## Architecture

### Frontend
- `index.html` + `app.js`: 참석 신청, 행사 정보 표시
- `admin.html` + `admin.js`: 관리자 로그인, 행사 정보 수정, 참석자 목록 조회

### Serverless API (CommonJS)
- `POST /api/attendees-submit`
- `GET /api/event-settings`
- `POST /api/admin/login`
- `GET|PUT /api/admin/location`
- `GET /api/admin/attendees`
- `GET /api/public-config` (deprecated, 410 반환)

### Security model
- 브라우저에서 Supabase 직접 호출하지 않음
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 함수에서만 사용
- 관리자 인증은 `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` 기반 토큰 검증

## Required Environment Variables (Vercel)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Optional:
- `SUPABASE_ANON_KEY` (현재 사용하지 않음)

## Database setup

1. Supabase Dashboard > SQL Editor 열기
2. `supabase/schema.sql` 실행
3. 필요하면 루트 `schema.sql`도 같은 내용(백업용)

### DB design notes
- `event_settings`: 단일 row(`id = 1`) 설정 테이블
- `attendees`: `student_id` 유니크 인덱스로 중복 신청 DB 레벨 차단
- RLS는 `service_role`만 허용하는 최소권한 정책

## Local development

```bash
npm install
npm run dev
```

`vercel dev`로 API + 정적 페이지를 함께 테스트합니다.

## Production deploy

```bash
git add .
git commit -m "production hardening"
git push origin main
```

Vercel Git 연동이면 자동 배포됩니다.

## Test checklist

1. 메인 페이지 접속
2. 행사 정보 로드
3. 참석 신청 저장
4. 같은 학번 재신청 시 409 처리(중복 안내)
5. 관리자 로그인
6. 행사 정보 조회/수정
7. 참석자 목록 조회
8. 토큰 만료/비정상 토큰일 때 401 처리 및 재로그인 유도

## Troubleshooting

### `SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing`
- Vercel 환경변수 이름 오타 여부 확인
- Production 환경 체크 여부 확인
- 저장 후 Redeploy 했는지 확인

### 관리자 로그인은 되는데 데이터가 안 보임
- `supabase/schema.sql`이 실제 실행되었는지 확인
- `attendees`, `event_settings` 테이블/컬럼 확인
