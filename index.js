const config = require('./config/config');
const axios = require('axios');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const fs = require('fs-extra');
const path = require('path');

// OpenDart API 클라이언트 클래스
class OpenDartClient {
  constructor() {
    this.apiKey = config.opendart.apiKey;
    this.baseUrl = config.opendart.baseUrl;
    
    if (!this.apiKey) {
      throw new Error('OpenDart API 키가 설정되지 않았습니다. .env 파일에 OPENDART_API_KEY를 설정해주세요.');
    }
  }

  // 공시정보 조회
  async getDisclosure(corpCode, beginDe, endDe, lastReprtAt = '') {
    try {
      const response = await axios.get(`${this.baseUrl}/list.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_code: corpCode,
          bgn_de: beginDe,
          end_de: endDe,
          last_reprt_at: lastReprtAt,
          pblntf_ty: 'A'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('OpenDart API 호출 실패:', error.message);
      throw error;
    }
  }

  // 기업개황 조회
  async getCompanyInfo(corpCode) {
    try {
      const response = await axios.get(`${this.baseUrl}/company.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_code: corpCode
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('기업개황 조회 실패:', error.message);
      throw error;
    }
  }

  // 단일회사 주요계정 조회
  async getFinancialStatements(corpCode, bsnsYear, reprtCode = '11011') {
    try {
      console.log(`📊 재무제표 조회: ${corpCode}, ${bsnsYear}, ${reprtCode}`);
      
      const response = await axios.get(`${this.baseUrl}/fnlttSinglAcnt.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_code: corpCode,
          bsns_year: bsnsYear,
          reprt_code: reprtCode
        }
      });

      if (response.data.status !== '000') {
        throw new Error(`API 오류: ${response.data.message} (${response.data.status})`);
      }

      const data = response.data.list || [];
      
      // 데이터를 재무제표별, 개별/연결별로 분류
      const processedData = {
        status: response.data.status,
        message: response.data.message,
        corp_code: corpCode,
        bsns_year: bsnsYear,
        reprt_code: reprtCode,
        financial_statements: this.processFinancialData(data)
      };

      return processedData;

    } catch (error) {
      console.error('재무제표 조회 실패:', error.message);
      throw error;
    }
  }

  // 재무데이터 처리 및 분류
  processFinancialData(data) {
    const result = {
      consolidated: { // 연결재무제표 (CFS)
        balance_sheet: [], // 재무상태표 (BS)
        income_statement: [] // 손익계산서 (IS)
      },
      separate: { // 개별재무제표 (OFS)
        balance_sheet: [], // 재무상태표 (BS)
        income_statement: [] // 손익계산서 (IS)
      }
    };

    data.forEach(item => {
      const processedItem = {
        account_nm: item.account_nm,
        thstrm_nm: item.thstrm_nm,
        thstrm_dt: item.thstrm_dt,
        thstrm_amount: this.parseAmount(item.thstrm_amount),
        frmtrm_nm: item.frmtrm_nm,
        frmtrm_dt: item.frmtrm_dt,
        frmtrm_amount: this.parseAmount(item.frmtrm_amount),
        bfefrmtrm_nm: item.bfefrmtrm_nm,
        bfefrmtrm_dt: item.bfefrmtrm_dt,
        bfefrmtrm_amount: this.parseAmount(item.bfefrmtrm_amount),
        ord: parseInt(item.ord),
        currency: item.currency
      };

      // 연결/개별 구분
      const fsType = item.fs_div === 'CFS' ? 'consolidated' : 'separate';
      
      // 재무상태표/손익계산서 구분
      const stType = item.sj_div === 'BS' ? 'balance_sheet' : 'income_statement';
      
      result[fsType][stType].push(processedItem);
    });

    // 정렬 (ord 기준)
    Object.keys(result).forEach(fsType => {
      Object.keys(result[fsType]).forEach(stType => {
        result[fsType][stType].sort((a, b) => a.ord - b.ord);
      });
    });

    return result;
  }

  // 금액 파싱 헬퍼 메서드 (콤마 제거)
  parseAmount(amountString) {
    if (!amountString || amountString === '') return 0;
    
    // 문자열에서 콤마 제거 후 숫자로 변환
    const cleanedString = String(amountString).replace(/,/g, '');
    const parsed = parseInt(cleanedString);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  // 다년도 재무데이터 조회
  async getMultiYearFinancials(corpCode, startYear, endYear, reprtCode = '11011') {
    try {
      const results = [];
      const currentYear = new Date().getFullYear();
      const actualEndYear = Math.min(endYear, 2024); // 2024년까지 허용
      
      console.log(`📈 다년도 재무데이터 조회: ${startYear}-${actualEndYear}`);
      
      for (let year = startYear; year <= actualEndYear; year++) {
        try {
          const data = await this.getFinancialStatements(corpCode, year.toString(), reprtCode);
          results.push(data);
          
          // API 호출 제한을 위한 짧은 지연
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.warn(`${year}년 데이터 조회 실패:`, error.message);
        }
      }
      
      return {
        success: true,
        corp_code: corpCode,
        years: `${startYear}-${actualEndYear}`,
        reprt_code: reprtCode,
        data: results
      };
      
    } catch (error) {
      console.error('다년도 재무데이터 조회 실패:', error.message);
      throw error;
    }
  }

  // 회사코드 다운로드 및 파싱
  async downloadCorpCode(outputDir = './data') {
    try {
      console.log('📥 회사코드 파일 다운로드 시작...');
      
      // ZIP 파일 다운로드
      const response = await axios.get('https://opendart.fss.or.kr/api/corpCode.xml', {
        params: {
          crtfc_key: this.apiKey
        },
        responseType: 'arraybuffer'
      });

      // 응답 상태 확인
      if (response.status !== 200) {
        throw new Error(`다운로드 실패: HTTP ${response.status}`);
      }

      // 출력 디렉토리 생성
      await fs.ensureDir(outputDir);
      
      const zipPath = path.join(outputDir, 'corpCode.zip');
      const xmlPath = path.join(outputDir, 'CORPCODE.xml');
      const jsonPath = path.join(outputDir, 'corpCode.json');

      // ZIP 파일 저장
      await fs.writeFile(zipPath, response.data);
      console.log('✅ ZIP 파일 다운로드 완료:', zipPath);

      // ZIP 파일 압축 해제
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(outputDir, true);
      console.log('✅ ZIP 파일 압축 해제 완료');

      // XML 파일 존재 확인
      if (!await fs.pathExists(xmlPath)) {
        throw new Error('CORPCODE.xml 파일을 찾을 수 없습니다.');
      }

      // XML 파일 읽기 및 JSON 변환
      const xmlData = await fs.readFile(xmlPath, 'utf8');
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xmlData);

      // 회사 리스트 추출
      const companies = result.result.list || [];
      const processedData = {
        status: result.result.status?.[0] || '000',
        message: result.result.message?.[0] || '정상',
        total_count: companies.length,
        companies: companies.map(company => ({
          corp_code: company.corp_code?.[0] || '',
          corp_name: company.corp_name?.[0] || '',
          corp_eng_name: company.corp_eng_name?.[0] || '',
          stock_code: company.stock_code?.[0] || '',
          modify_date: company.modify_date?.[0] || ''
        }))
      };

      // JSON 파일로 저장
      await fs.writeJson(jsonPath, processedData, { spaces: 2 });
      console.log('✅ JSON 변환 완료:', jsonPath);

      // 원본 ZIP 파일 삭제 (선택적)
      await fs.remove(zipPath);

      console.log(`🎉 회사코드 다운로드 완료! 총 ${processedData.total_count}개 회사 정보`);
      
      return {
        success: true,
        data: processedData,
        files: {
          xml: xmlPath,
          json: jsonPath
        }
      };

    } catch (error) {
      console.error('❌ 회사코드 다운로드 실패:', error.message);
      
      // API 에러 상태 코드 처리
      if (error.response?.data) {
        const errorBuffer = Buffer.from(error.response.data);
        const errorText = errorBuffer.toString('utf8');
        console.error('API 응답 에러:', errorText);
      }
      
      throw error;
    }
  }

  // 회사명으로 회사코드 검색
  async searchCompanyByName(companyName, corpCodeFilePath = './data/corpCode.json') {
    try {
      // JSON 파일이 없으면 먼저 다운로드
      if (!await fs.pathExists(corpCodeFilePath)) {
        console.log('회사코드 파일이 없습니다. 다운로드를 시작합니다...');
        await this.downloadCorpCode();
      }

      const corpData = await fs.readJson(corpCodeFilePath);
      const results = corpData.companies.filter(company => 
        company.corp_name.includes(companyName) || 
        company.corp_eng_name.toLowerCase().includes(companyName.toLowerCase())
      );

      return {
        success: true,
        query: companyName,
        total_results: results.length,
        companies: results
      };

    } catch (error) {
      console.error('회사 검색 실패:', error.message);
      throw error;
    }
  }
}

// 사용 예시
async function main() {
  try {
    console.log('🚀 OpenDart API 클라이언트 시작');
    console.log(`📋 환경: ${config.app.env}`);
    console.log(`🔑 API 키 설정됨: ${config.opendart.apiKey ? '✅' : '❌'}`);
    
    if (!config.opendart.apiKey) {
      console.log('\n📝 설정 방법:');
      console.log('1. 프로젝트 루트에 .env 파일 생성');
      console.log('2. OPENDART_API_KEY=your_api_key_here 추가');
      console.log('3. OpenDart에서 API 키 발급: https://opendart.fss.or.kr/');
      return;
    }

    const client = new OpenDartClient();
    
    // 회사코드 다운로드 예시
    console.log('\n🔄 회사코드 파일 다운로드를 시작합니다...');
    const corpCodeResult = await client.downloadCorpCode();
    
    if (corpCodeResult.success) {
      console.log(`\n📊 다운로드 결과:`);
      console.log(`- 총 회사 수: ${corpCodeResult.data.total_count}개`);
      console.log(`- XML 파일: ${corpCodeResult.files.xml}`);
      console.log(`- JSON 파일: ${corpCodeResult.files.json}`);
      
      // 삼성전자 검색 예시
      console.log('\n🔍 삼성전자 검색 예시:');
      const searchResult = await client.searchCompanyByName('삼성전자');
      if (searchResult.total_results > 0) {
        console.log(`검색 결과: ${searchResult.total_results}개`);
        console.log('첫 번째 결과:', searchResult.companies[0]);
      }
    }
    
    console.log('\n✅ OpenDart API 클라이언트가 준비되었습니다!');
    console.log('💡 사용 가능한 메서드:');
    console.log('  - client.downloadCorpCode(): 회사코드 다운로드');
    console.log('  - client.searchCompanyByName(name): 회사명으로 검색');
    console.log('  - client.getCompanyInfo(corpCode): 기업개황 조회');
    console.log('  - client.getDisclosure(): 공시정보 조회');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 모듈로 export
module.exports = { OpenDartClient, config };

// 직접 실행시에만 main 함수 호출
if (require.main === module) {
  main();
}
