# 🚀 GitHub 업로드 및 무료 배포 가이드

## 📁 **1단계: GitHub에 파일 업로드**

### 방법 1: 웹 브라우저 사용 (가장 간단)
1. https://github.com 접속 후 로그인
2. "New repository" 클릭
3. Repository name: `financial-dashboard`
4. Public 선택
5. "Create repository" 클릭
6. "uploading an existing file" 클릭
7. 프로젝트 폴더의 모든 파일을 드래그&드롭
8. Commit message: "Initial commit"
9. "Commit changes" 클릭

### 방법 2: GitHub Desktop 사용
1. GitHub Desktop 다운로드: https://desktop.github.com
2. 설치 후 GitHub 계정으로 로그인
3. "Create a New Repository on your hard drive" 선택
4. 현재 폴더 위치 선택
5. "Publish repository" 클릭

## 🌐 **2단계: 무료 배포**

### Option A: Render.com (추천)
1. https://render.com 가입 (GitHub 계정으로)
2. "New +" → "Web Service"
3. GitHub 저장소 연결
4. Environment Variables에 OPENDART_API_KEY 추가
5. Deploy 클릭

### Option B: Vercel
1. https://vercel.com 가입
2. "Import Project" → GitHub 저장소 선택
3. Environment Variables에 OPENDART_API_KEY 추가
4. Deploy 클릭

### Option C: Railway
1. https://railway.app 가입
2. "Deploy from GitHub repo"
3. 저장소 선택 후 Deploy

## 🔑 **중요: API 키 설정**
배포 시 환경변수에 반드시 추가:
- `OPENDART_API_KEY`: 본인의 OpenDart API 키
- `NODE_ENV`: production
- `PORT`: 10000 (Render) 또는 자동 (Vercel)

## 📱 **배포 완료 후**
- 배포된 URL로 접속하여 테스트
- 삼성전자 검색해서 재무제표 확인
- 차트 생성 테스트

---
💡 **문제 발생 시**: 각 플랫폼의 로그를 확인하고 환경변수가 올바르게 설정되었는지 점검하세요.
