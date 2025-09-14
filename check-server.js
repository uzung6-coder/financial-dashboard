const axios = require('axios');

async function checkServer() {
  console.log('🔍 서버 상태 확인');
  console.log('=' .repeat(40));
  
  try {
    console.log('서버 연결 시도 중...');
    
    // 여러 URL로 시도
    const urls = [
      'http://localhost:3000/api/health',
      'http://127.0.0.1:3000/api/health',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    for (const url of urls) {
      try {
        console.log(`\n시도: ${url}`);
        const response = await axios.get(url, { timeout: 5000 });
        console.log(`✅ 성공! 상태코드: ${response.status}`);
        
        if (url.includes('/api/health')) {
          console.log(`응답: ${response.data.message}`);
        }
        
        console.log(`\n🎉 서버 정상 작동 중!`);
        console.log(`🌐 브라우저에서 접속: ${url.replace('/api/health', '')}`);
        return;
        
      } catch (error) {
        console.log(`❌ 실패: ${error.code || error.message}`);
      }
    }
    
    console.log('\n❌ 모든 연결 시도 실패');
    console.log('\n🔧 해결 방법:');
    console.log('1. 서버가 실행 중인지 확인');
    console.log('2. 방화벽이 포트 3000을 차단하지 않는지 확인');
    console.log('3. 다른 프로그램이 포트 3000을 사용하지 않는지 확인');
    
  } catch (error) {
    console.error('테스트 중 오류:', error.message);
  }
}

checkServer();

