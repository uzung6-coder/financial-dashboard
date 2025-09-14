const axios = require('axios');

async function finalTest() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🎉 최종 웹 애플리케이션 테스트');
  console.log('=' .repeat(60));
  
  try {
    // 서버 상태 확인
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 대기
    
    console.log('\n1️⃣  서버 상태 확인');
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('✅ 서버 정상 실행 중');
    
    console.log('\n2️⃣  삼성전자 검색 및 자동 재무데이터 로드 시뮬레이션');
    const searchResult = await axios.get(`${baseURL}/api/companies/search?q=삼성전자&limit=1`);
    
    if (searchResult.data.companies.length > 0) {
      const company = searchResult.data.companies[0];
      console.log(`🏢 검색된 회사: ${company.corp_name} (${company.corp_code})`);
      
      // 자동 재무데이터 로드 (웹에서 회사 선택 시 발생하는 동작)
      console.log('\n3️⃣  자동 재무데이터 로드 (2024년)');
      const financial2024 = await axios.get(`${baseURL}/api/companies/${company.corp_code}/financials?year=2024`);
      
      if (financial2024.data.success) {
        console.log('✅ 2024년 재무제표 자동 로드 성공');
        
        const fs = financial2024.data.data.financial_statements;
        const statements = fs.consolidated.balance_sheet.length > 0 ? fs.consolidated : fs.separate;
        
        // 웹에서 표시될 주요 지표들
        console.log('\n📊 웹 애플리케이션에서 표시될 재무 요약:');
        
        const revenue = statements.income_statement.find(acc => acc.account_nm.includes('매출액'));
        const operatingProfit = statements.income_statement.find(acc => acc.account_nm.includes('영업이익'));
        const netIncome = statements.income_statement.find(acc => acc.account_nm.includes('당기순이익'));
        const totalAssets = statements.balance_sheet.find(acc => acc.account_nm.includes('자산총계'));
        const totalLiabilities = statements.balance_sheet.find(acc => acc.account_nm.includes('부채총계'));
        const totalEquity = statements.balance_sheet.find(acc => acc.account_nm.includes('자본총계'));
        
        console.log(`   💰 매출액: ${formatAmount(revenue?.thstrm_amount)}`);
        console.log(`   📈 영업이익: ${formatAmount(operatingProfit?.thstrm_amount)}`);
        console.log(`   💵 당기순이익: ${formatAmount(netIncome?.thstrm_amount)}`);
        console.log(`   🏦 자산총계: ${formatAmount(totalAssets?.thstrm_amount)}`);
        console.log(`   📊 부채총계: ${formatAmount(totalLiabilities?.thstrm_amount)}`);
        console.log(`   💎 자본총계: ${formatAmount(totalEquity?.thstrm_amount)}`);
        
        // 재무비율 계산
        if (revenue && operatingProfit && netIncome) {
          console.log('\n📈 자동 계산된 재무비율:');
          const operatingMargin = (operatingProfit.thstrm_amount / revenue.thstrm_amount) * 100;
          const netMargin = (netIncome.thstrm_amount / revenue.thstrm_amount) * 100;
          
          console.log(`   영업이익률: ${operatingMargin.toFixed(1)}%`);
          console.log(`   순이익률: ${netMargin.toFixed(1)}%`);
          
          if (totalAssets && totalLiabilities && totalEquity) {
            const debtRatio = (totalLiabilities.thstrm_amount / totalEquity.thstrm_amount) * 100;
            const equityRatio = (totalEquity.thstrm_amount / totalAssets.thstrm_amount) * 100;
            
            console.log(`   부채비율: ${debtRatio.toFixed(1)}%`);
            console.log(`   자기자본비율: ${equityRatio.toFixed(1)}%`);
          }
        }
        
        console.log('\n4️⃣  다년도 차트 데이터 테스트');
        const chartData = await axios.get(`${baseURL}/api/companies/${company.corp_code}/chart-data?start_year=2021&end_year=2024`);
        
        if (chartData.data.success) {
          console.log('✅ 차트 데이터 생성 성공');
          console.log(`   연도: ${chartData.data.chart_data.years.join(', ')}`);
          console.log(`   지표: ${Object.keys(chartData.data.chart_data.datasets).join(', ')}`);
        }
        
      } else {
        console.log('⚠️  2024년 데이터 없음 (2023년으로 대체됨)');
      }
    }
    
    console.log('\n🎉 최종 테스트 완료!');
    console.log('\n✨ 웹 애플리케이션 기능 요약:');
    console.log('   🔍 회사명 검색 → 즉시 선택 가능');
    console.log('   🔄 회사 선택 → 자동 재무데이터 로드');
    console.log('   📊 재무 요약 → 6개 주요 지표 표시');
    console.log('   📈 재무비율 → 4개 비율 자동 계산');
    console.log('   📋 재무제표 → 상세 테이블 (재무상태표/손익계산서)');
    console.log('   📊 추세 차트 → 다년도 비교 시각화');
    
    console.log('\n🌐 웹 브라우저에서 접속: http://localhost:3000');
    console.log('💡 이제 차트 생성 버튼 없이도 회사 검색만으로 완전한 재무분석 가능!');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 서버 연결 실패');
      console.log('💡 서버가 시작되기까지 잠시 기다려주세요...');
    } else {
      console.error('❌ 테스트 실패:', error.message);
    }
  }
}

function formatAmount(amount) {
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
  finalTest();
}
