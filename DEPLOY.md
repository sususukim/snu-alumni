# Deploy Guide (Vercel + Supabase)

## 1) Supabase DB 생성
Supabase Dashboard > SQL Editor 에서 `supabase/schema.sql` 전체 실행

## 2) Vercel 환경변수 등록
Project Settings > Environment Variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

## 3) Git Push
```bash
git add .
git commit -m "secure env config + admin auth api"
git push origin main
```

## 4) 배포 확인
- 사용자 페이지: `/`
- 관리자 페이지: `/admin` (진입 시 비밀번호 프롬프트)

## 5) 보안 체크
- `service_role` 키는 절대 클라이언트 코드/공개 repo에 올리지 않기
- 기존에 노출한 비밀키가 있으면 Supabase에서 Rotate
