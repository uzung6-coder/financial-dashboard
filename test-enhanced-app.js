const axios = require('axios');

async function testEnhancedApp() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔍 개선된 재무제표 시각화 앱 테스트');
  console.log('=' .repeat(60));
  
  try {
    // 1. 헬스 체크
    console.log('\n1️⃣  서버 상태 확인');
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('✅', health.data.message);
    
    // 2. 삼성전자 검색 및 자동 재무데이터 로드 시뮬레이션
    console.log('\n2️⃣  삼성전자 자동 재무데이터 로드 테스트');
    const searchResult = await axios.get(`${baseURL}/api/companies/search?q=삼성전자&limit=1`);
    
    if (searchResult.data.companies.length > 0) {
      const company = searchResult.data.companies[0];
      console.log(`🏢 선택된 회사: ${company.corp_name} (${company.corp_code})`);
      
      // 3. 2024년 재무제표 자동 조회
      console.log('\n3️⃣  2024년 재무제표 자동 조회');
      try {
        const financial2024 = await axios.get(`${baseURL}/api/companies/${company.corp_code}/financials?year=2024`);
        
        if (financial2024.data.success) {
          console.log('✅ 2024년 재무제표 조회 성공');
          
          const fs = financial2024.data.data.financial_statements;
          const statements = fs.consolidated.balance_sheet.length > 0 ? fs.consolidated : fs.separate;
          
          console.log('\n📊 주요 재무지표:');
          
          // 주요 계정 출력
          const revenue = statements.income_statement.find(acc => acc.account_nm.includes('매출액'));
          const operatingProfit = statements.income_statement.find(acc => acc.account_nm.includes('영업이익'));
          const netIncome = statements.income_statement.find(acc => acc.account_nm.includes('당기순이익'));
          const totalAssets = statements.balance_sheet.find(acc => acc.account_nm.includes('자산총계'));
          
          if (revenue) console.log(`   💰 매출액: ${formatKoreanAmount(revenue.thstrm_amount)}`);
          if (operatingProfit) console.log(`   📈 영업이익: ${formatKoreanAmount(operatingProfit.thstrm_amount)}`);
          if (netIncome) console.log(`   💵 당기순이익: ${formatKoreanAmount(netIncome.thstrm_amount)}`);
          if (totalAssets) console.log(`   🏦 자산총계: ${formatKoreanAmount(totalAssets.thstrm_amount)}`);
          
          // 재무비율 계산
          if (revenue && operatingProfit) {
            const operatingMargin = (operatingProfit.thstrm_amount / revenue.thstrm_amount) * 100;
            console.log(`   📊 영업이익률: ${operatingMargin.toFixed(1)}%`);
          }
          
          if (revenue && netIncome) {
            const netMargin = (netIncome.thstrm_amount / revenue.thstrm_amount) * 100;
            console.log(`   📊 순이익률: ${netMargin.toFixed(1)}%`);
          }
          
        } else {
          console.log('⚠️  2024년 데이터 없음, 2023년으로 테스트');
          
          const financial2023 = await axios.get(`${baseURL}/api/companies/${company.corp_code}/financials?year=2023`);
          if (financial2023.data.success) {
            console.log('✅ 2023년 재무제표 조회 성공 (대체)');
          }
        }
        
      } catch (error) {
        console.log(`❌ 재무제표 조회 실패: ${error.response?.data?.error || error.message}`);
      }
      
      // 4. 재무제표 상세 데이터 확인
      console.log('\n4️⃣  재무제표 상세 구조 확인');
      try {
        const detailedFinancial = await axios.get(`${baseURL}/api/companies/${company.corp_code}/financials?year=2024`);
        
        if (detailedFinancial.data.success) {
          const fs = detailedFinancial.data.data.financial_statements;
          console.log(`   📋 연결재무상태표 항목: ${fs.consolidated.balance_sheet.length}개`);
          console.log(`   📋 연결손익계산서 항목: ${fs.consolidated.income_statement.length}개`);
          console.log(`   📋 개별재무상태표 항목: ${fs.separate.balance_sheet.length}개`);
          console.log(`   📋 개별손익계산서 항목: ${fs.separate.income_statement.length}개`);
          
          // 주요 계정들 나열
          console.log('\n📊 재무상태표 주요 계정:');
          fs.consolidated.balance_sheet.slice(0, 5).forEach(acc => {
            console.log(`   - ${acc.account_nm}: ${formatKoreanAmount(acc.thstrm_amount)}`);
          });
          
          console.log('\n📈 손익계산서 주요 계정:');
          fs.consolidated.income_statement.slice(0, 5).forEach(acc => {
            console.log(`   - ${acc.account_nm}: ${formatKoreanAmount(acc.thstrm_amount)}`);
          });
        }
      } catch (error) {
        console.log('⚠️  상세 재무제표 조회 실패');
      }
    }
    
    console.log('\n🎉 개선된 앱 테스트 완료!');
    console.log('\n✨ 새로운 기능:');
    console.log('   🔄 회사 선택 시 자동 재무데이터 로드');
    console.log('   📊 주요 재무지표 요약 표시');
    console.log('   📈 재무비율 자동 계산');
    console.log('   📋 재무상태표/손익계산서 탭 구조');
    console.log('   💎 전년 대비 증감률 표시');
    console.log('\n🌐 웹 애플리케이션: http://localhost:3000');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 서버가 실행되지 않았습니다.');
      console.log('💡 다음 명령어로 서버를 실행하세요: npm start');
    } else {
      console.error('❌ 테스트 실패:', error.message);
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
  testEnhancedApp();
}
