# HEXACO 성격 해석기 — Netlify 배포 버전

## 📁 구조
```
hexaco/
├── public/
│   └── index.html          ← 프론트엔드 (브라우저에서 보이는 화면)
├── netlify/
│   └── functions/
│       └── analyze.js      ← 서버 함수 (API 키가 여기서만 사용됨)
├── netlify.toml            ← Netlify 설정
├── package.json
└── .gitignore
```

---

## 🚀 Netlify 배포 방법

### 1단계 — GitHub에 올리기
```bash
git init
git add .
git commit -m "첫 배포"
git remote add origin https://github.com/내계정/hexaco.git
git push -u origin main
```

### 2단계 — Netlify 연결
1. https://netlify.com 접속 → 로그인
2. **"Add new site"** → **"Import an existing project"**
3. GitHub 선택 → 저장소 선택
4. Build settings는 그대로 두기 (자동 감지)
5. **"Deploy site"** 클릭

### 3단계 — API 키 등록 ⚠️ 가장 중요!
배포 완료 후:
1. Netlify 대시보드 → 해당 사이트 선택
2. **Site configuration** → **Environment variables**
3. **"Add a variable"** 클릭
4. Key: `ANTHROPIC_API_KEY`
5. Value: `sk-ant-실제키입력`
6. **Save** 클릭
7. **Deploys** 탭 → **"Trigger deploy"** → **"Deploy site"** 로 재배포

> API 키 발급: https://console.anthropic.com → API Keys → Create Key

---

## ✅ 확인 사항
- `.gitignore`에 `.env`가 포함되어 있어서 실수로 키가 GitHub에 올라가지 않아요
- API 키는 `netlify/functions/analyze.js` 서버에서만 사용 → 사용자 브라우저에 노출 안 됨
- 누구나 URL만 알면 사이트 접속 가능, 요금은 본인 Anthropic 계정에 청구
