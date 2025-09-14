const axios = require('axios');

async function quickTest() {
  try {
    console.log('서버 확인 중...');
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('✅ 서버 정상 실행 중!');
    console.log('응답:', response.data);
    
    console.log('\n🎯 삼성전자 테스트...');
    const search = await axios.get('http://localhost:3000/api/companies/search?q=삼성전자&limit=1');
    console.log('검색 결과:', search.data.companies[0]?.corp_name);
    
  } catch (error) {
    console.log('❌ 서버 연결 실패:', error.code);
  }
}

quickTest();
