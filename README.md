# 서울대학교 동문회 참석 신청

2026년 5월 12일 동문회 참석 여부를 신청하는 모바일 최적화 웹사이트입니다.

## 기능

- **SNU 로고** 및 이벤트 정보 표시
- **날짜**: 2026년 5월 12일
- **장소**: admin이 네이버 주소로 설정 시 자동 표시 + 지도 링크
- **참석 여부**: 참석 / 불참 선택
- **입력 항목**: 학번, 학과, 성함
- **DB 저장**: Supabase PostgreSQL
- **관리자 페이지**: 장소 설정, 참석자 목록 조회

## 배포 방법

### 1. Supabase 설정

1. [Supabase](https://supabase.com) 가입 후 새 프로젝트 생성
2. **SQL Editor**에서 `supabase/schema.sql` 내용 전체 복사 후 실행
3. **Settings > API**에서 다음 값 확인:
   - Project URL
   - anon public key

### 2. config.js 수정

`config.js` 파일에서 Supabase 정보를 입력하세요:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://xxxxx.supabase.co',   // Project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // anon public key
};
```

### 3. Vercel로 배포 (처음 쓰는 경우)

가입만 했다면, 아래 중 **한 가지 방법**만 하면 됩니다.

#### 방법 A: Vercel 웹에서 배포 (GitHub 연동)

1. **GitHub에 코드 올리기**
   - GitHub에서 새 저장소(Repository) 만든 뒤, `snu-alumni` 폴더 내용을 푸시합니다.
   - 또는 전체 프로젝트 루트를 푸시한 경우, 2단계에서 "Root Directory"를 `snu-alumni`로 지정하면 됩니다.

2. **Vercel 로그인**  
   - [vercel.com](https://vercel.com) 접속 → **Login** → **Continue with GitHub** 로 로그인.

3. **프로젝트 가져오기**
   - **Add New…** → **Project** 클릭.
   - GitHub 저장소 목록에서 방금 올린 저장소 선택 후 **Import**.

4. **설정**
   - **Framework Preset**: Other (또는 그대로 두기).
   - **Root Directory**: 프로젝트가 `snu-alumni` 폴더 안에만 있다면 비워두고, 상위 폴더를 올렸다면 `snu-alumni` 입력.
   - **Environment Variables**는 이 프로젝트는 사용 안 해도 됨 (Supabase는 `config.js`에 넣음).

5. **Deploy** 클릭 후 1~2분 기다리면 배포 완료.  
   - 나오는 주소(예: `https://xxx.vercel.app`)로 접속해 보면 됩니다.

#### 방법 B: Vercel CLI로 배포 (Git 없이)

1. **터미널에서 프로젝트 폴더로 이동**
   ```bash
   cd c:\vibecoding\snu-alumni
   ```

2. **Vercel CLI 실행**
   ```bash
   npx vercel
   ```

3. **질문에 답하기**
   - "Set up and deploy?" → **Y**
   - "Which scope?" → 본인 계정 선택
   - "Link to existing project?" → **N**
   - "What's your project's name?" → `snu-alumni` 또는 원하는 이름
   - "In which directory is your code located?" → **./** (그냥 Enter)

4. 배포가 끝나면 터미널에 **Production URL**이 나옵니다. 그 주소로 접속하면 됩니다.

5. **이후 수정 후 재배포**
   ```bash
   npx vercel --prod
   ```

배포 후 `config.js`의 Supabase URL/Key를 수정했다면, 다시 한 번 배포해야 반영됩니다.

### 4. 로컬에서 테스트

```bash
cd snu-alumni
npx serve .
```

또는 Live Server 확장으로 `index.html`을 열어보세요.

## 파일 구조

```
snu-alumni/
├── index.html      # 메인 참석 신청 페이지
├── admin.html      # 관리자 페이지 (장소 설정, 참석자 목록)
├── styles.css      # 스타일
├── app.js          # 메인 앱 로직
├── admin.js        # 관리자 페이지 로직
├── config.js       # Supabase 설정 (수정 필요)
├── vercel.json     # Vercel 배포 설정
├── supabase/
│   └── schema.sql  # DB 스키마
└── README.md
```

## 관리자 페이지

- **URL**: `https://your-domain.com/admin.html` 또는 `/admin`
- **장소 설정**: 네이버에서 검색 가능한 주소 입력 (예: 서울 영등포구 여의대로 108)
- **참석자 목록**: 등록된 참석자 확인

> ⚠️ 현재 admin 페이지는 별도 인증 없이 접근 가능합니다. 보안이 필요하면 Supabase Auth를 추가하거나 admin 링크를 숨기세요.

## SNU 로고

- **이미지 파일로 사용**: `snu-alumni/images/` 폴더에 로고 파일을 넣고 이름을 `snu-logo.png`로 하면 됩니다. (jpg면 `index.html`에서 `snu-logo.png`를 `snu-logo.jpg`로 바꾸면 됨.)
- **웹 주소로 사용**: 로고 URL이 있으면 `index.html` 안의 `<img src="images/snu-logo.png" ...>` 에서 `images/snu-logo.png` 부분만 그 URL로 바꾸면 됩니다.
- 이미지가 없거나 로드 실패 시 "서울대학교" 텍스트가 대신 표시됩니다.
