const axios = require('axios');
const config = require('./config/config');

async function checkOpenDartResponse() {
  console.log('🔍 OpenDart API 원본 응답 검증');
  console.log('=' .repeat(50));
  
  try {
    // 직접 OpenDart API 호출
    const apiUrl = 'https://opendart.fss.or.kr/api/fnlttSinglAcnt.json';
    const params = {
      crtfc_key: config.opendart.apiKey,
      corp_code: '00126380', // 삼성전자
      bsns_year: '2023', // 2023년으로 우선 테스트
      reprt_code: '11011'  // 사업보고서
    };
    
    console.log('\n📡 OpenDart API 직접 호출');
    console.log(`URL: ${apiUrl}`);
    console.log(`Parameters:`, params);
    
    const response = await axios.get(apiUrl, { params });
    
    console.log(`\n📋 API 응답 상태: ${response.status}`);
    console.log(`📋 응답 상태: ${response.data.status}`);
    console.log(`📋 응답 메시지: ${response.data.message}`);
    console.log(`📋 데이터 건수: ${response.data.list ? response.data.list.length : 0}건`);
    
    if (response.data.list && response.data.list.length > 0) {
      console.log('\n💰 원본 데이터 샘플 (처음 5개):');
      
      response.data.list.slice(0, 5).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.account_nm}`);
        console.log(`   당기금액: ${item.thstrm_amount} ${item.currency}`);
        console.log(`   전기금액: ${item.frmtrm_amount} ${item.currency}`);
        console.log(`   재무제표구분: ${item.sj_div} (${item.sj_nm})`);
        console.log(`   개별/연결: ${item.fs_div} (${item.fs_nm})`);
        
        // 매출액인 경우 상세 분석
        if (item.account_nm.includes('매출액')) {
          console.log(`   >>> 매출액 분석:`);
          console.log(`       원본값: "${item.thstrm_amount}"`);
          console.log(`       타입: ${typeof item.thstrm_amount}`);
          console.log(`       숫자변환: ${parseInt(item.thstrm_amount)}`);
          console.log(`       억원 단위: ${(parseInt(item.thstrm_amount) / 100000000).toFixed(0)}억원`);
          console.log(`       조원 단위: ${(parseInt(item.thstrm_amount) / 1000000000000).toFixed(1)}조원`);
        }
      });
      
      // 매출액 찾기
      const revenue = response.data.list.find(item => 
        item.account_nm.includes('매출액') && item.sj_div === 'IS'
      );
      
      if (revenue) {
        console.log('\n🎯 매출액 상세 분석:');
        console.log(`   계정명: ${revenue.account_nm}`);
        console.log(`   당기금액: "${revenue.thstrm_amount}"`);
        console.log(`   통화: ${revenue.currency}`);
        console.log(`   당기명: ${revenue.thstrm_nm}`);
        console.log(`   당기일자: ${revenue.thstrm_dt}`);
        
        // 다양한 단위로 변환 시도
        const amount = parseInt(revenue.thstrm_amount);
        console.log('\n💱 단위 변환 시도:');
        console.log(`   원본: ${amount.toLocaleString()}원`);
        console.log(`   천원 단위: ${(amount / 1000).toLocaleString()}천원`);
        console.log(`   백만원 단위: ${(amount / 1000000).toLocaleString()}백만원`);
        console.log(`   십억원 단위: ${(amount / 1000000000).toLocaleString()}십억원`);
        console.log(`   조원 단위: ${(amount / 1000000000000).toFixed(1)}조원`);
        
        // 2023년 삼성전자 실제 매출액과 비교
        console.log('\n📊 예상 vs 실제:');
        console.log(`   OpenDart 응답값: ${amount.toLocaleString()}`);
        console.log(`   예상 삼성전자 매출액 (2023): 약 258조원`);
        console.log(`   단위 배율: ${258000000000000 / amount}배`);
      }
    }
    
    // 2024년도 확인
    console.log('\n\n🔄 2024년 데이터 확인');
    
    const params2024 = { ...params, bsns_year: '2024' };
    
    try {
      const response2024 = await axios.get(apiUrl, { params: params2024 });
      
      if (response2024.data.status === '000') {
        console.log('✅ 2024년 데이터 있음');
        
        const revenue2024 = response2024.data.list.find(item => 
          item.account_nm.includes('매출액') && item.sj_div === 'IS'
        );
        
        if (revenue2024) {
          console.log(`2024년 매출액: ${revenue2024.thstrm_amount} ${revenue2024.currency}`);
        }
      } else {
        console.log(`⚠️  2024년 데이터 없음: ${response2024.data.message}`);
      }
    } catch (error) {
      console.log(`❌ 2024년 데이터 조회 실패: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ API 호출 실패:', error.message);
    if (error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
    }
  }
}

if (require.main === module) {
  checkOpenDartResponse();
}
