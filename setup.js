const fs = require('fs');
const path = require('path');

console.log('🚀 OpenDart API 프로젝트 설정');
console.log('='.repeat(40));

// env.example에서 API 키 읽기
const envExamplePath = path.join(__dirname, 'env.example');
const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envExamplePath)) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // API 키가 설정되어 있는지 확인
    const apiKeyMatch = envExampleContent.match(/OPENDART_API_KEY=(.+)/);
    
    if (apiKeyMatch && apiKeyMatch[1] && apiKeyMatch[1].trim() !== '') {
      const apiKey = apiKeyMatch[1].trim();
      
      console.log('✅ env.example에서 API 키를 발견했습니다!');
      console.log(`🔑 API 키: ${apiKey.substring(0, 8)}...`);
      
      // .env 파일 생성
      if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envExampleContent);
        console.log('✅ .env 파일이 생성되었습니다!');
      } else {
        console.log('ℹ️  .env 파일이 이미 존재합니다.');
      }
      
      console.log('\n📦 이제 다음 명령어로 의존성을 설치하세요:');
      console.log('npm install');
      
      console.log('\n🏃‍♂️ 그 다음 다음 명령어로 실행하세요:');
      console.log('npm start');
      console.log('또는');
      console.log('node examples/download-corp-code.js');
      
    } else {
      console.log('⚠️  env.example에 API 키가 설정되지 않았습니다.');
      console.log('\n🔧 설정 방법:');
      console.log('1. https://opendart.fss.or.kr/ 에서 API 키 발급');
      console.log('2. env.example 파일을 열어서 OPENDART_API_KEY 값 입력');
      console.log('3. 다시 이 스크립트 실행: node setup.js');
    }
  } else {
    console.log('❌ env.example 파일을 찾을 수 없습니다.');
  }
  
} catch (error) {
  console.error('❌ 설정 중 오류 발생:', error.message);
}
