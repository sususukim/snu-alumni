# Git + GitHub + Vercel 배포 가이드

Supabase key/URL 넣었고, Vercel 가입·연결까지 했다면 아래 순서대로 하면 됩니다.

---

## 1단계: Git 저장소 만들기

**방법 A: `snu-alumni` 폴더만 GitHub에 올리기 (추천)**

1. **GitHub에서 새 저장소 생성**
   - [github.com](https://github.com) 로그인 → **New repository**
   - Repository name: `snu-alumni` (또는 원하는 이름)
   - **Public** 선택
   - "Add a README file" 등은 **체크하지 말고** **Create repository** 클릭

2. **로컬에서 Git 초기화 및 푸시**
   - 터미널(또는 Cursor 터미널)을 열고 아래를 **순서대로** 실행하세요.

   ```bash
   cd c:\vibecoding\snu-alumni
   git init
   git add .
   git commit -m "서울대 동문회 참석 신청 사이트"
   git branch -M main
   git remote add origin https://github.com/내계정이름/snu-alumni.git
   git push -u origin main
   ```

   - `내계정이름` 부분을 본인 GitHub 사용자명으로 바꾸세요.
   - `git push` 시 GitHub 로그인(또는 토큰) 요청이 나오면 입력합니다.

---

**방법 B: 전체 `vibecoding` 폴더를 GitHub에 올리기**

1. **GitHub에서 새 저장소 생성**
   - Repository name: `vibecoding` 등 원하는 이름
   - **Create repository** (README 추가 안 해도 됨)

2. **로컬에서 Git 초기화 및 푸시**
   ```bash
   cd c:\vibecoding
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/내계정이름/저장소이름.git
   git push -u origin main
   ```

   이렇게 하면 Vercel에서 **Root Directory**를 `snu-alumni`로 지정해야 합니다 (3단계 참고).

---

## 2단계: Vercel에서 GitHub 연결

1. [vercel.com](https://vercel.com) 로그인
2. **Add New…** → **Project**
3. **Import Git Repository**에서 방금 푸시한 저장소 선택 (예: `snu-alumni` 또는 `vibecoding`)
4. **Import** 클릭

---

## 3단계: Vercel 프로젝트 설정

1. **Configure Project** 화면에서:
   - **Framework Preset**: Other (기본값 그대로)
   - **Root Directory**:  
     - **방법 A**로 했으면(저장소가 snu-alumni만 있는 경우): 비워두기  
     - **방법 B**로 했으면(저장소가 vibecoding 전체): `snu-alumni` 입력 후 **Edit** 적용
   - **Build and Output Settings**: 건드리지 않아도 됨

2. **Deploy** 클릭

---

## 4단계: 배포 확인

- 배포가 끝나면 **Visit** 또는 주소(예: `https://snu-alumni-xxx.vercel.app`)로 접속해서 동작 확인하세요.
- Supabase `config.js`에 넣은 key/URL이 이미 코드에 포함돼 있으므로, 별도 환경 변수 없이 동작합니다.

---

## 이후 수정사항 반영하기

코드 수정 후 다시 배포하려면:

```bash
cd c:\vibecoding\snu-alumni   # 방법 A인 경우
# 또는 cd c:\vibecoding       # 방법 B인 경우

git add .
git commit -m "수정 내용 요약"
git push
```

푸시하면 Vercel이 자동으로 다시 배포합니다.

---

## ⚠️ 보안 참고

- `config.js`에 Supabase URL과 anon key가 들어 있습니다.
- **저장소를 Public으로 두었다면** 누구나 키를 볼 수 있으므로, 나중에 Supabase 대시보드에서 **Row Level Security(RLS)** 가 제대로 켜져 있는지 꼭 확인하세요.
- 더 보안이 중요하면, 키를 코드에서 빼고 Vercel **Environment Variables**에 넣고, 빌드 시 `config.js`에 주입하는 방식으로 바꿀 수 있습니다 (필요하면 그때 설정 방법 안내 가능).
