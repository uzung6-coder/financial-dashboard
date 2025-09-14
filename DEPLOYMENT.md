# 🚀 재무제표 시각화 서비스 배포 가이드

## 📋 배포 전 체크리스트

- ✅ OpenDart API 키 발급 완료
- ✅ 로컬에서 정상 동작 확인
- ✅ 환경변수 설정 준비
- ✅ Git 저장소 준비

---

## 🌐 배포 옵션

### 1. Vercel 배포 (추천 - 가장 간단) ⭐

#### 준비사항:
- GitHub 계정
- Vercel 계정 (GitHub으로 가입 가능)

#### 배포 단계:
1. **GitHub 저장소 생성**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/financial-dashboard.git
   git push -u origin main
   ```

2. **Vercel 배포**
   - [vercel.com](https://vercel.com) 접속
   - GitHub 연동 후 저장소 선택
   - 환경변수 설정:
     - `OPENDART_API_KEY`: 발급받은 OpenDart API 키
     - `NODE_ENV`: `production`

3. **자동 배포**
   - GitHub push 시 자동으로 재배포
   - 도메인: `https://your-project-name.vercel.app`

---

### 2. Railway 배포 (간단함) 🚂

#### 준비사항:
- GitHub 계정
- Railway 계정

#### 배포 단계:
1. **Railway 접속**
   - [railway.app](https://railway.app) 접속
   - GitHub으로 로그인

2. **프로젝트 배포**
   - "Deploy from GitHub repo" 선택
   - 저장소 선택 후 배포

3. **환경변수 설정**
   - Variables 탭에서 설정:
     - `OPENDART_API_KEY`: API 키
     - `NODE_ENV`: `production`

---

### 3. Heroku 배포 💜

#### 준비사항:
- Heroku 계정
- Heroku CLI 설치

#### 배포 단계:
1. **Heroku 앱 생성**
   ```bash
   heroku create your-app-name
   ```

2. **환경변수 설정**
   ```bash
   heroku config:set OPENDART_API_KEY=your_api_key_here
   heroku config:set NODE_ENV=production
   ```

3. **배포**
   ```bash
   git push heroku main
   ```

---

### 4. Docker 배포 🐳

#### 로컬 Docker 실행:
```bash
# 이미지 빌드
docker build -t financial-dashboard .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e OPENDART_API_KEY=your_api_key_here \
  -e NODE_ENV=production \
  financial-dashboard
```

#### Docker Hub 배포:
```bash
# 태그 지정
docker tag financial-dashboard your-dockerhub-username/financial-dashboard

# Docker Hub에 푸시
docker push your-dockerhub-username/financial-dashboard
```

---

## 🔧 환경변수 설정

모든 배포 플랫폼에서 다음 환경변수를 설정해야 합니다:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `OPENDART_API_KEY` | `your_api_key_here` | OpenDart API 인증키 |
| `NODE_ENV` | `production` | 프로덕션 환경 설정 |
| `PORT` | (자동 설정) | 서버 포트 (플랫폼에서 자동 할당) |

---

## 📊 배포 후 확인사항

### 1. 헬스체크
```
GET https://your-domain.com/api/health
```

### 2. 회사 검색 테스트
```
GET https://your-domain.com/api/companies/search?q=삼성전자
```

### 3. 재무데이터 테스트
```
GET https://your-domain.com/api/companies/00126380/financials?year=2024
```

---

## 🛠️ 트러블슈팅

### 1. API 키 오류
- 환경변수 `OPENDART_API_KEY` 확인
- OpenDart 사이트에서 키 상태 확인

### 2. 메모리 부족
- 회사 데이터 로딩 시 메모리 사용량 증가
- 서버 플랜 업그레이드 고려

### 3. 빌드 실패
- Node.js 버전 확인 (18.x 권장)
- 의존성 설치 문제 확인

---

## 📈 성능 최적화

### 1. 캐싱 추가
- 회사 데이터 메모리 캐싱
- API 응답 캐싱

### 2. CDN 활용
- 정적 파일 CDN 배포
- 이미지 최적화

### 3. 데이터베이스 분리
- 회사 데이터를 별도 DB로 이관
- 재무데이터 캐싱 시스템

---

## 🔗 유용한 링크

- [OpenDart API 문서](https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Railway 배포 가이드](https://docs.railway.app/)
- [Heroku Node.js 가이드](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

---

## 📞 지원

배포 중 문제가 발생하면:
1. 로그 확인
2. 환경변수 재확인
3. API 키 유효성 검증

### 로그 확인 명령어:
```bash
# Vercel
vercel logs

# Railway
railway logs

# Heroku
heroku logs --tail
```

