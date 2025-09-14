# 🆓 **무료 배포 완벽 가이드**

## 🏆 **추천 순위**

### 🥇 **1. Render.com** (가장 추천!)
- ✅ **완전 무료** 웹 서비스
- ✅ **750시간/월** 사용량 (충분!)
- ✅ **자동 SSL** 인증서
- ✅ **GitHub 자동 배포**
- ✅ **PostgreSQL DB** 무료 제공
- ✅ **커스텀 도메인** 지원

### 🥈 **2. Railway**
- ✅ **$5 크레딧** 매월 무료
- ✅ **빠른 배포** (1분 내)
- ✅ **자동 도메인** 제공
- ✅ **데이터베이스** 지원

### 🥉 **3. Fly.io**
- ✅ **무료 플랜** 제공
- ✅ **Docker 지원**
- ✅ **글로벌 CDN**

---

## 🚀 **Render.com 배포 (추천)**

### **1단계: GitHub 준비**
```bash
# Git 초기화
git init
git add .
git commit -m "feat: 재무제표 시각화 서비스 초기 버전"

# GitHub 저장소 생성 후
git remote add origin https://github.com/username/financial-dashboard.git
git push -u origin main
```

### **2단계: Render.com 배포**
1. **[render.com](https://render.com)** 접속
2. **GitHub으로 로그인**
3. **"New +" → "Web Service"** 클릭
4. **GitHub 저장소 연결**
5. **설정값 입력:**

```yaml
Name: financial-dashboard
Environment: Node
Build Command: npm install && npm run download
Start Command: npm start
```

### **3단계: 환경변수 설정**
Environment 탭에서:
- `OPENDART_API_KEY`: [발급받은 API 키]
- `NODE_ENV`: `production`

### **4단계: 배포 완료!**
- 🌐 **URL**: `https://financial-dashboard.onrender.com`
- 📊 **헬스체크**: `/api/health`

---

## 🚂 **Railway 배포**

### **1단계: 배포**
1. **[railway.app](https://railway.app)** 접속
2. **GitHub으로 로그인**
3. **"Deploy from GitHub repo"** 선택
4. **저장소 선택 후 배포**

### **2단계: 환경변수**
Variables 탭에서:
- `OPENDART_API_KEY`: [API 키]
- `NODE_ENV`: `production`

### **3단계: 완료!**
- 🌐 자동 도메인 생성
- 💰 **$5 크레딧**으로 충분히 사용 가능

---

## ✈️ **Fly.io 배포**

### **1단계: CLI 설치**
```bash
# Windows
curl -L https://fly.io/install.ps1 | iex

# 또는 npm으로
npm install -g @flydotio/flyctl
```

### **2단계: 로그인 & 배포**
```bash
fly auth login
fly launch

# 환경변수 설정
fly secrets set OPENDART_API_KEY=your_api_key_here
fly secrets set NODE_ENV=production

# 배포
fly deploy
```

---

## 🎯 **어떤 서비스를 선택할까?**

### **Render.com을 선택하세요! 이유:**
- ✅ **가장 관대한 무료 플랜**
- ✅ **설정이 가장 간단**
- ✅ **750시간/월** (24시간 가동 가능)
- ✅ **안정적인 서비스**

### **Railway는 이런 경우:**
- 🚀 **빠른 배포**가 중요한 경우
- 💰 **$5 크레딧**으로 충분한 경우

### **Fly.io는 이런 경우:**
- 🐳 **Docker**를 사용하고 싶은 경우
- 🌍 **글로벌 배포**가 필요한 경우

---

## 📊 **배포 후 테스트**

### **1. 헬스체크**
```
GET https://your-app.onrender.com/api/health
```

### **2. 회사 검색**
```
GET https://your-app.onrender.com/api/companies/search?q=삼성전자
```

### **3. 재무데이터**
```
GET https://your-app.onrender.com/api/companies/00126380/financials?year=2024
```

### **4. 메인 페이지**
```
https://your-app.onrender.com
```

---

## 💡 **무료 플랜 최적화 팁**

### **1. 메모리 사용량 줄이기**
- 회사 데이터를 필요할 때만 로드
- API 응답 캐싱 활용

### **2. 빌드 시간 단축**
- `npm ci` 대신 `npm install` 사용
- 불필요한 devDependencies 제거

### **3. 트래픽 관리**
- API 호출 제한 설정
- 에러 핸들링 강화

---

## 🔧 **트러블슈팅**

### **빌드 실패**
```bash
# 로컬에서 테스트
npm install
npm run download
npm start
```

### **환경변수 오류**
- Render.com Environment 탭에서 재확인
- API 키 유효성 검증

### **메모리 부족**
- 무료 플랜: 512MB RAM
- corpCode.json 로딩 최적화 필요

---

## 🎉 **배포 완료 체크리스트**

- ✅ GitHub 저장소 생성
- ✅ Render.com 계정 생성
- ✅ 저장소 연결
- ✅ 환경변수 설정
- ✅ 배포 성공
- ✅ 헬스체크 통과
- ✅ API 테스트 완료
- ✅ 프론트엔드 정상 작동

**🚀 축하합니다! 무료로 배포 완료!**

