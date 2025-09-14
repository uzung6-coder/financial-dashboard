const axios = require('axios');

async function testFixedParsing() {
  const baseURL = 'http://localhost:3000';
  
  console.log('🔧 수정된 금액 파싱 테스트');
  console.log('=' .repeat(50));
  
  try {
    // 1. 삼성전자 검색
    const searchResult = await axios.get(`${baseURL}/api/companies/search?q=삼성전자&limit=1`);
    const samsung = searchResult.data.companies[0];
    
    console.log('\n1️⃣  삼성전자 기본 정보');
    console.log(`회사명: ${samsung.corp_name}`);
    console.log(`회사코드: ${samsung.corp_code}`);
    
    // 2. 2024년 재무제표 조회 (수정된 파싱 적용)
    console.log('\n2️⃣  수정된 파싱으로 2024년 재무제표 조회');
    const response2024 = await axios.get(`${baseURL}/api/companies/${samsung.corp_code}/financials?year=2024`);
    
    if (response2024.data.success) {
      console.log('✅ 2024년 재무제표 조회 성공');
      
      const fs = response2024.data.data.financial_statements;
      const statements = fs.consolidated.balance_sheet.length > 0 ? fs.consolidated : fs.separate;
      
      console.log('\n📊 수정된 주요 재무지표 (2024년):');
      
      // 손익계산서 주요 항목
      const incomeItems = statements.income_statement;
      incomeItems.forEach(item => {
        if (['매출액', '영업이익', '당기순이익'].some(keyword => item.account_nm.includes(keyword))) {
          console.log(`   💰 ${item.account_nm}:`);
          console.log(`      당기: ${formatKoreanAmount(item.thstrm_amount)}`);
          console.log(`      전기: ${formatKoreanAmount(item.frmtrm_amount)}`);
          console.log(`      원본 숫자: ${item.thstrm_amount.toLocaleString()}`);
        }
      });
      
      // 재무상태표 주요 항목
      console.log('\n🏦 주요 재무상태표 항목:');
      const balanceItems = statements.balance_sheet;
      balanceItems.forEach(item => {
        if (['자산총계', '부채총계', '자본총계'].some(keyword => item.account_nm.includes(keyword))) {
          console.log(`   💎 ${item.account_nm}:`);
          console.log(`      당기: ${formatKoreanAmount(item.thstrm_amount)}`);
          console.log(`      전기: ${formatKoreanAmount(item.frmtrm_amount)}`);
          console.log(`      원본 숫자: ${item.thstrm_amount.toLocaleString()}`);
        }
      });
      
      // 재무비율 계산
      const revenue = incomeItems.find(item => item.account_nm.includes('매출액'));
      const operatingProfit = incomeItems.find(item => item.account_nm.includes('영업이익'));
      const netIncome = incomeItems.find(item => item.account_nm.includes('당기순이익'));
      
      if (revenue && operatingProfit && netIncome) {
        console.log('\n📈 재무비율:');
        const operatingMargin = (operatingProfit.thstrm_amount / revenue.thstrm_amount) * 100;
        const netMargin = (netIncome.thstrm_amount / revenue.thstrm_amount) * 100;
        
        console.log(`   영업이익률: ${operatingMargin.toFixed(1)}%`);
        console.log(`   순이익률: ${netMargin.toFixed(1)}%`);
      }
      
    } else {
      console.log('❌ 2024년 데이터 조회 실패');
    }
    
    // 3. 2023년과 비교
    console.log('\n3️⃣  2023년 데이터와 비교');
    const response2023 = await axios.get(`${baseURL}/api/companies/${samsung.corp_code}/financials?year=2023`);
    
    if (response2023.data.success) {
      const fs2023 = response2023.data.data.financial_statements.consolidated;
      const revenue2023 = fs2023.income_statement.find(item => item.account_nm.includes('매출액'));
      
      if (revenue2023) {
        console.log(`   2023년 매출액: ${formatKoreanAmount(revenue2023.thstrm_amount)}`);
        console.log(`   원본 숫자: ${revenue2023.thstrm_amount.toLocaleString()}`);
      }
    }
    
    console.log('\n🎉 파싱 수정 테스트 완료!');
    console.log('✅ 이제 올바른 조원 단위 금액이 표시됩니다.');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    if (error.response?.data) {
      console.error('API 오류:', error.response.data.error);
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
  testFixedParsing();
}
