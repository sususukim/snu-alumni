# DEPLOY GUIDE

## 1) Supabase schema apply
- Supabase SQL Editor에서 `supabase/schema.sql` 실행

## 2) Vercel env vars
Vercel Project > Settings > Environment Variables

필수:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

선택:
- `SUPABASE_ANON_KEY` (현재 미사용)

모든 변수는 `Production`, `Preview`, `Development`에 적용 권장.

## 3) Deploy
```bash
git add .
git commit -m "production ready hardening"
git push origin main
```

## 4) Verify after deploy
- `/` 접속
- 참석 신청 저장
- 동일 학번 재신청 시 중복 차단
- `/admin` 로그인 및 목록/설정 확인

## 5) If something breaks
- Vercel Deployment Logs 확인
- `/api/event-settings` 직접 접속해서 JSON 응답 확인
- `/api/admin/login`은 POST만 허용됨(브라우저 GET 테스트 X)
