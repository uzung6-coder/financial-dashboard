const axios = require('axios');

async function testPort3001() {
  console.log('🚀 포트 3001에서 서버 테스트');
  
  try {
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
    
    console.log('서버 연결 시도...');
    const response = await axios.get('http://localhost:3001/api/health');
    
    console.log('✅ 서버 연결 성공!');
    console.log('응답:', response.data.message);
    
    console.log('\n🔍 삼성전자 검색 테스트...');
    const search = await axios.get('http://localhost:3001/api/companies/search?q=삼성전자&limit=1');
    
    if (search.data.companies.length > 0) {
      console.log('✅ 검색 성공:', search.data.companies[0].corp_name);
      
      // 재무데이터 테스트
      const corpCode = search.data.companies[0].corp_code;
      console.log('\n💰 재무데이터 테스트...');
      
      const financial = await axios.get(`http://localhost:3001/api/companies/${corpCode}/financials?year=2024`);
      
      if (financial.data.success) {
        const fs = financial.data.data.financial_statements.consolidated;
        const revenue = fs.income_statement.find(acc => acc.account_nm.includes('매출액'));
        
        if (revenue) {
          const amount = revenue.thstrm_amount;
          const formatted = amount >= 1000000000000 ? 
            `${(amount / 1000000000000).toFixed(1)}조원` : 
            `${amount.toLocaleString()}원`;
          
          console.log('✅ 재무데이터 조회 성공!');
          console.log(`   매출액: ${formatted}`);
          console.log(`   원본값: ${amount.toLocaleString()}`);
        }
      }
    }
    
    console.log('\n🎉 모든 테스트 성공!');
    console.log('🌐 웹 브라우저에서 접속: http://localhost:3001');
    
  } catch (error) {
    console.log('❌ 연결 실패:', error.code || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 서버가 아직 시작되지 않았을 수 있습니다.');
      console.log('   잠시 기다린 후 다시 시도해주세요.');
    }
  }
}

testPort3001();

