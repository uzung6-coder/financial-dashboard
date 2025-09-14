const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔍 재무제표 시각화 API 테스트');
  console.log('=' .repeat(50));
  
  try {
    // 1. 헬스 체크
    console.log('\n1️⃣  헬스 체크');
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('✅', health.data.message);
    
    // 2. 회사 검색 테스트
    console.log('\n2️⃣  회사 검색 테스트');
    const searchResult = await axios.get(`${baseURL}/api/companies/search?q=삼성전자&limit=3`);
    console.log(`🔍 "삼성전자" 검색 결과: ${searchResult.data.total_results}개`);
    
    if (searchResult.data.companies.length > 0) {
      const company = searchResult.data.companies[0];
      console.log(`   회사명: ${company.corp_name}`);
      console.log(`   회사코드: ${company.corp_code}`);
      console.log(`   종목코드: ${company.stock_code || '없음'}`);
      
      // 3. 재무제표 조회 테스트
      console.log('\n3️⃣  재무제표 조회 테스트');
      try {
        const financial = await axios.get(`${baseURL}/api/companies/${company.corp_code}/financials?year=2024`);
        console.log(`✅ 2024년 재무제표 조회 성공`);
        
        const fs = financial.data.data.financial_statements;
        if (fs.consolidated.balance_sheet.length > 0) {
          console.log(`   연결재무상태표 항목: ${fs.consolidated.balance_sheet.length}개`);
          console.log(`   연결손익계산서 항목: ${fs.consolidated.income_statement.length}개`);
        }
        
      } catch (error) {
        console.log(`⚠️  재무제표 조회 실패: ${error.response?.data?.error || error.message}`);
      }
      
      // 4. 차트 데이터 테스트
      console.log('\n4️⃣  차트 데이터 테스트');
      try {
        const chartData = await axios.get(`${baseURL}/api/companies/${company.corp_code}/chart-data?start_year=2021&end_year=2024`);
        console.log(`✅ 차트 데이터 조회 성공`);
        console.log(`   연도: ${chartData.data.chart_data.years.join(', ')}`);
        console.log(`   데이터셋: ${Object.keys(chartData.data.chart_data.datasets).join(', ')}`);
        
      } catch (error) {
        console.log(`⚠️  차트 데이터 조회 실패: ${error.response?.data?.error || error.message}`);
      }
    }
    
    // 5. 인기 회사 테스트
    console.log('\n5️⃣  인기 회사 테스트');
    const popular = await axios.get(`${baseURL}/api/companies/popular?limit=5`);
    console.log(`✅ 인기 회사 조회 성공: ${popular.data.companies.length}개`);
    popular.data.companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.corp_name} (${company.stock_code || '비상장'})`);
    });
    
    console.log('\n🎉 모든 API 테스트 완료!');
    console.log('\n📱 웹 애플리케이션 접속: http://localhost:3000');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 서버가 실행되지 않았습니다.');
      console.log('💡 다음 명령어로 서버를 실행하세요: npm start');
    } else {
      console.error('❌ API 테스트 실패:', error.message);
    }
  }
}

if (require.main === module) {
  testAPI();
}
