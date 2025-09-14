const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenDartClient } = require('./index');
const CompanyService = require('./services/CompanyService');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 서비스 인스턴스 생성
let openDartClient;
let companyService;

async function initializeServices() {
  try {
    openDartClient = new OpenDartClient();
    
    // corp code 파일이 없으면 다운로드
    console.log('📥 회사 코드 파일 확인 중...');
    await openDartClient.downloadCorpCode();
    
    companyService = new CompanyService();
    await companyService.loadCompanies();
    
    console.log('✅ 서비스 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ 서비스 초기화 실패:', error.message);
    return false;
  }
}

// API 라우트

// 1. 회사 검색 API
app.get('/api/companies/search', async (req, res) => {
  try {
    const { q: query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '검색어를 입력해주세요.'
      });
    }
    
    const result = companyService.searchCompanies(query, parseInt(limit));
    res.json(result);
    
  } catch (error) {
    console.error('회사 검색 API 오류:', error.message);
    res.status(500).json({
      success: false,
      error: '검색 중 오류가 발생했습니다.'
    });
  }
});

// 2. 인기 회사 목록 API
app.get('/api/companies/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = companyService.getPopularCompanies(parseInt(limit));
    res.json(result);
    
  } catch (error) {
    console.error('인기 회사 API 오류:', error.message);
    res.status(500).json({
      success: false,
      error: '인기 회사 조회 중 오류가 발생했습니다.'
    });
  }
});

// 3. 회사 상세 정보 API
app.get('/api/companies/:corpCode', async (req, res) => {
  try {
    const { corpCode } = req.params;
    
    // 회사 기본 정보
    const companyInfo = companyService.getCompanyByCode(corpCode);
    
    if (!companyInfo.success) {
      return res.status(404).json(companyInfo);
    }
    
    // OpenDart API에서 기업개황 조회
    try {
      const dartInfo = await openDartClient.getCompanyInfo(corpCode);
      companyInfo.dart_info = dartInfo;
    } catch (error) {
      console.warn('기업개황 조회 실패:', error.message);
      companyInfo.dart_info = null;
    }
    
    res.json(companyInfo);
    
  } catch (error) {
    console.error('회사 상세 정보 API 오류:', error.message);
    res.status(500).json({
      success: false,
      error: '회사 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

// 4. 재무제표 조회 API
app.get('/api/companies/:corpCode/financials', async (req, res) => {
  try {
    const { corpCode } = req.params;
    const { year, report_code = '11011' } = req.query;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        error: '사업연도를 입력해주세요.'
      });
    }
    
    const result = await openDartClient.getFinancialStatements(corpCode, year, report_code);
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('재무제표 조회 API 오류:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. 다년도 재무데이터 조회 API
app.get('/api/companies/:corpCode/financials/multi-year', async (req, res) => {
  try {
    const { corpCode } = req.params;
    const { start_year, end_year, report_code = '11011' } = req.query;
    
    if (!start_year || !end_year) {
      return res.status(400).json({
        success: false,
        error: '시작연도와 종료연도를 입력해주세요.'
      });
    }
    
    const result = await openDartClient.getMultiYearFinancials(
      corpCode, 
      parseInt(start_year), 
      parseInt(end_year), 
      report_code
    );
    
    res.json(result);
    
  } catch (error) {
    console.error('다년도 재무데이터 조회 API 오류:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6. 데이터 시각화용 API
app.get('/api/companies/:corpCode/chart-data', async (req, res) => {
  try {
    const { corpCode } = req.params;
    const { start_year, end_year, accounts } = req.query;
    
    if (!start_year || !end_year) {
      return res.status(400).json({
        success: false,
        error: '시작연도와 종료연도를 입력해주세요.'
      });
    }
    
    // 다년도 데이터 조회
    const financialData = await openDartClient.getMultiYearFinancials(
      corpCode, 
      parseInt(start_year), 
      parseInt(end_year)
    );
    
    // 차트용 데이터 변환
    const chartData = processChartData(financialData.data, accounts ? accounts.split(',') : null);
    
    res.json({
      success: true,
      corp_code: corpCode,
      years: `${start_year}-${end_year}`,
      chart_data: chartData
    });
    
  } catch (error) {
    console.error('차트 데이터 API 오류:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 차트용 데이터 변환 함수
function processChartData(financialDataArray, selectedAccounts = null) {
  const chartData = {
    years: [],
    datasets: {}
  };
  
  // 기본 주요 계정들
  const defaultAccounts = [
    '매출액', '영업이익', '당기순이익', '자산총계', '부채총계', '자본총계'
  ];
  
  const targetAccounts = selectedAccounts || defaultAccounts;
  
  financialDataArray.forEach(yearData => {
    const year = yearData.bsns_year;
    chartData.years.push(year);
    
    // 연결재무제표 우선, 없으면 개별재무제표
    const statements = yearData.financial_statements.consolidated.balance_sheet.length > 0 
      ? yearData.financial_statements.consolidated 
      : yearData.financial_statements.separate;
    
    const allAccounts = [...statements.balance_sheet, ...statements.income_statement];
    
    targetAccounts.forEach(accountName => {
      if (!chartData.datasets[accountName]) {
        chartData.datasets[accountName] = {
          label: accountName,
          data: [],
          borderColor: getRandomColor(),
          backgroundColor: getRandomColor(0.2),
          fill: false
        };
      }
      
      const account = allAccounts.find(item => item.account_nm === accountName);
      const amount = account ? account.thstrm_amount : 0;
      
      chartData.datasets[accountName].data.push(amount);
    });
  });
  
  return chartData;
}

// 랜덤 색상 생성
function getRandomColor(alpha = 1) {
  const colors = [
    `rgba(255, 99, 132, ${alpha})`,
    `rgba(54, 162, 235, ${alpha})`,
    `rgba(255, 205, 86, ${alpha})`,
    `rgba(75, 192, 192, ${alpha})`,
    `rgba(153, 102, 255, ${alpha})`,
    `rgba(255, 159, 64, ${alpha})`
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 정적 파일 제공 (HTML)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT,
      has_api_key: !!process.env.OPENDART_API_KEY,
      companies_loaded: companyService && companyService.companies ? companyService.companies.length : 0
    }
  });
});

// 서버 시작
async function startServer() {
  try {
    const initialized = await initializeServices();
    
    if (!initialized) {
      console.error('❌ 서비스 초기화 실패로 서버를 시작할 수 없습니다.');
      process.exit(1);
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 재무제표 시각화 서버가 실행되었습니다!`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📊 API 문서: http://localhost:${PORT}/api/health`);
      console.log('\n📋 사용 가능한 API:');
      console.log('  GET  /api/companies/search?q=삼성');
      console.log('  GET  /api/companies/popular');
      console.log('  GET  /api/companies/:corpCode');
      console.log('  GET  /api/companies/:corpCode/financials?year=2023');
      console.log('  GET  /api/companies/:corpCode/financials/multi-year?start_year=2020&end_year=2023');
      console.log('  GET  /api/companies/:corpCode/chart-data?start_year=2020&end_year=2023');
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error.message);
    process.exit(1);
  }
}

startServer();

// 프로세스 종료시 정리
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  
  if (companyService) {
    companyService.close();
  }
  
  process.exit(0);
});
