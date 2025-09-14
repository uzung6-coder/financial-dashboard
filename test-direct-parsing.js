const { OpenDartClient } = require('./index');

async function testDirectParsing() {
  console.log('🔧 직접 파싱 테스트 (서버 독립적)');
  console.log('=' .repeat(50));
  
  try {
    const client = new OpenDartClient();
    
    console.log('\n📊 삼성전자 2024년 재무제표 직접 조회');
    const result = await client.getFinancialStatements('00126380', '2024');
    
    console.log(`상태: ${result.status}`);
    console.log(`메시지: ${result.message}`);
    
    if (result.status === '000') {
      const fs = result.financial_statements;
      const statements = fs.consolidated.balance_sheet.length > 0 ? fs.consolidated : fs.separate;
      
      console.log('\n💰 손익계산서 주요 항목:');
      statements.income_statement.forEach(item => {
        if (['매출액', '영업이익', '당기순이익'].some(keyword => item.account_nm.includes(keyword))) {
          console.log(`   ${item.account_nm}:`);
          console.log(`      당기금액: ${formatKoreanAmount(item.thstrm_amount)}`);
          console.log(`      원본 숫자: ${item.thstrm_amount.toLocaleString()}`);
        }
      });
      
      console.log('\n🏦 재무상태표 주요 항목:');
      statements.balance_sheet.forEach(item => {
        if (['자산총계', '부채총계', '자본총계'].some(keyword => item.account_nm.includes(keyword))) {
          console.log(`   ${item.account_nm}:`);
          console.log(`      당기금액: ${formatKoreanAmount(item.thstrm_amount)}`);
          console.log(`      원본 숫자: ${item.thstrm_amount.toLocaleString()}`);
        }
      });
      
      console.log('\n✅ 직접 파싱 테스트 성공!');
      
      // 예상 값과 비교
      const revenue = statements.income_statement.find(item => item.account_nm.includes('매출액'));
      if (revenue) {
        const expectedRange = [250000000000000, 350000000000000]; // 250~350조원 범위
        const isValid = revenue.thstrm_amount >= expectedRange[0] && revenue.thstrm_amount <= expectedRange[1];
        
        console.log(`\n🎯 매출액 검증:`);
        console.log(`   실제값: ${revenue.thstrm_amount.toLocaleString()}`);
        console.log(`   예상범위: ${expectedRange[0].toLocaleString()} ~ ${expectedRange[1].toLocaleString()}`);
        console.log(`   검증결과: ${isValid ? '✅ 정상' : '❌ 비정상'}`);
      }
      
    } else {
      console.log(`❌ API 호출 실패: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ 직접 테스트 실패:', error.message);
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
  testDirectParsing();
}
