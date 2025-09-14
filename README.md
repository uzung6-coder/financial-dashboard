# OpenDart API 프로젝트

OpenDart API를 사용하여 기업공시정보를 조회하는 Node.js 프로젝트입니다.

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경변수 설정
1. `.env` 파일을 프로젝트 루트에 생성
2. `env.example` 파일을 참고하여 환경변수 설정

```bash
# .env 파일 내용
OPENDART_API_KEY=your_api_key_here
NODE_ENV=development
PORT=3000
```

### 3. OpenDart API 키 발급
1. [OpenDart 홈페이지](https://opendart.fss.or.kr/) 접속
2. 회원가입 및 로그인
3. API 인증키 발급 신청
4. 발급받은 키를 `.env` 파일에 설정

### 4. 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 일반 실행
npm start
```

## 📁 프로젝트 구조

```
vibe_test9/
├── config/
│   └── config.js          # 환경변수 설정
├── examples/
│   └── download-corp-code.js  # 회사코드 다운로드 예시
├── data/                  # 다운로드한 데이터 저장 (자동 생성)
│   ├── CORPCODE.xml      # 원본 XML 파일
│   └── corpCode.json     # 변환된 JSON 파일
├── .env                   # 환경변수 파일 (실제 API 키 포함)
├── env.example            # 환경변수 예시 파일
├── .gitignore            # Git 제외 파일 목록
├── package.json          # 프로젝트 설정
├── index.js              # 메인 애플리케이션
└── README.md             # 프로젝트 설명
```

## 🔧 사용법

### 1. 회사코드 다운로드 (필수)
OpenDart API를 사용하기 전에 먼저 회사코드 파일을 다운로드해야 합니다.

```javascript
const { OpenDartClient } = require('./index');

const client = new OpenDartClient();

// 회사코드 다운로드 (ZIP → XML → JSON 변환)
const result = await client.downloadCorpCode('./data');
console.log(`총 ${result.data.total_count}개 회사 정보 다운로드 완료`);
```

### 2. 회사명으로 회사코드 검색
```javascript
// 회사명으로 검색
const searchResult = await client.searchCompanyByName('삼성전자');
console.log(searchResult.companies[0].corp_code); // 회사 고유번호

// 영문명으로도 검색 가능
const searchResult2 = await client.searchCompanyByName('Samsung');
```

### 3. 기업 정보 조회
```javascript
// 기업개황 조회 (회사코드 필요)
const companyInfo = await client.getCompanyInfo('00126380');

// 공시정보 조회
const disclosure = await client.getDisclosure('00126380', '20240101', '20241231');
```

### 4. 예시 실행
```bash
# 회사코드 다운로드 예시 실행
node examples/download-corp-code.js
```

## 🔐 보안

- `.env` 파일은 git에 커밋되지 않습니다
- API 키 등 민감한 정보는 환경변수로 관리됩니다
- `env.example` 파일을 참고하여 필요한 환경변수를 설정하세요

## 📚 API 문서

OpenDart API에 대한 자세한 정보는 [공식 문서](https://opendart.fss.or.kr/guide/detail.do?apiGrpCd=DS001&apiId=2019001)를 참고하세요.

## ⚠️ 주의사항

1. API 키를 공개 저장소에 업로드하지 마세요
2. OpenDart API는 일일 호출 제한이 있습니다
3. 기업고유번호는 OpenDart에서 제공하는 고유번호를 사용해야 합니다
