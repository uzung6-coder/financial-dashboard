const axios = require('axios');

async function debugSamsungData() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔍 삼성전자 재무데이터 오류 검증');
  console.log('=' .repeat(50));
  
  try {
    // 1. 삼성전자 검색
    const searchResult = await axios.get(`${baseURL}/api/companies/search?q=삼성전자&limit=1`);
    const samsung = searchResult.data.companies[0];
    
    console.log('\n1️⃣  삼성전자 기본 정보');
    console.log(`회사명: ${samsung.corp_name}`);
    console.log(`회사코드: ${samsung.corp_code}`);
    console.log(`종목코드: ${samsung.stock_code}`);
    
    // 2. 원본 API 응답 확인 (2024년)
    console.log('\n2️⃣  2024년 원본 API 응답 분석');
    const response2024 = await axios.get(`${baseURL}/api/companies/${samsung.corp_code}/financials?year=2024`);
    
    if (response2024.data.success) {
      console.log('✅ 2024년 API 호출 성공');
      
      const rawData = response2024.data.data;
      console.log(`\n📋 API 기본 정보:`);
      console.log(`   상태: ${rawData.status}`);
      console.log(`   메시지: ${rawData.message}`);
      console.log(`   회사코드: ${rawData.corp_code}`);
      console.log(`   사업연도: ${rawData.bsns_year}`);
      
      // 연결재무제표 손익계산서 원본 데이터 확인
      const consolidated = rawData.financial_statements.consolidated;
      console.log(`\n📊 연결 손익계산서 원본 데이터:`);
      
      consolidated.income_statement.forEach((account, index) => {
        console.log(`   ${index + 1}. ${account.account_nm}:`);
        console.log(`      당기금액: ${account.thstrm_amount} (원본값)`);
        console.log(`      전기금액: ${account.frmtrm_amount} (원본값)`);
        console.log(`      통화: ${account.currency}`);
        
        if (account.account_nm.includes('매출액')) {
          console.log(`      >>> 매출액 상세 분석:`);
          console.log(`          원본 숫자값: ${account.thstrm_amount}`);
          console.log(`          타입: ${typeof account.thstrm_amount}`);
          console.log(`          실제 매출액 (조원): ${(account.thstrm_amount / 1000000000000).toFixed(1)}조원`);
        }
      });
      
      // 연결재무상태표도 확인
      console.log(`\n💰 연결 재무상태표 주요 계정:`);
      consolidated.balance_sheet.slice(0, 3).forEach((account, index) => {
        console.log(`   ${index + 1}. ${account.account_nm}: ${account.thstrm_amount} (${account.currency})`);
        
        if (account.account_nm.includes('자산총계')) {
          console.log(`      >>> 자산총계 (조원): ${(account.thstrm_amount / 1000000000000).toFixed(1)}조원`);
        }
      });
      
    } else {
      console.log('❌ 2024년 데이터 조회 실패, 2023년으로 확인');
      
      // 2023년 데이터로 검증
      const response2023 = await axios.get(`${baseURL}/api/companies/${samsung.corp_code}/financials?year=2023`);
      
      if (response2023.data.success) {
        console.log('\n📊 2023년 데이터로 검증:');
        const data2023 = response2023.data.data.financial_statements.consolidated;
        
        const revenue2023 = data2023.income_statement.find(acc => acc.account_nm.includes('매출액'));
        if (revenue2023) {
          console.log(`   매출액 (2023): ${revenue2023.thstrm_amount}`);
          console.log(`   실제 매출액 (조원): ${(revenue2023.thstrm_amount / 1000000000000).toFixed(1)}조원`);
        }
      }
    }
    
    // 3. 데이터 타입 및 변환 과정 검증
    console.log('\n3️⃣  데이터 변환 과정 검증');
    
    // 직접 OpenDart API 호출해서 원본 확인
    const { OpenDartClient } = require('./index');
    const client = new OpenDartClient();
    
    console.log('\n🔗 OpenDart API 직접 호출:');
    const directApiResult = await client.getFinancialStatements(samsung.corp_code, '2024');
    
    if (directApiResult.status === '000') {
      console.log('✅ OpenDart API 직접 호출 성공');
      
      const directData = directApiResult.financial_statements.consolidated;
      const directRevenue = directData.income_statement.find(acc => acc.account_nm.includes('매출액'));
      
      if (directRevenue) {
        console.log(`   직접 API 매출액: ${directRevenue.thstrm_amount}`);
        console.log(`   타입: ${typeof directRevenue.thstrm_amount}`);
        console.log(`   조원 단위: ${(directRevenue.thstrm_amount / 1000000000000).toFixed(1)}조원`);
      }
    } else {
      console.log(`❌ OpenDart API 직접 호출 실패: ${directApiResult.message}`);
    }
    
    // 4. 포맷팅 함수 테스트
    console.log('\n4️⃣  포맷팅 함수 테스트');
    
    const testAmounts = [
      258870000000000,  // 258.87조원 (예상 삼성전자 매출액)
      58886669000000,   // 58.89조원 (예상 영업이익)
      339357244000000   // 339.36조원 (예상 자산총계)
    ];
    
    testAmounts.forEach((amount, index) => {
      console.log(`   테스트 ${index + 1}: ${amount} → ${formatKoreanAmount(amount)}`);
    });
    
  } catch (error) {
    console.error('❌ 검증 중 오류:', error.message);
    if (error.response?.data) {
      console.error('API 응답 오류:', error.response.data);
    }
  }
}

function formatKoreanAmount(amount) {
  if (!amount) return '-';
  
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000000000000) {
    return `${(amount / 1000000000000).toFixed(1)}조원`;
  } else if (absAmount >= 100000000) {
    return `${(amount / 100000000).toFixed(0)}억원`;
  } else if (absAmount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  } else {
    return `${amount.toLocaleString()}원`;
  }
}

if (require.main === module) {
  debugSamsungData();
}
