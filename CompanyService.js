const fs = require('fs-extra');
const path = require('path');

class CompanyService {
  constructor() {
    this.corpCodePath = path.join(__dirname, '../data/corpCode.json');
    this.companies = null;
  }

  // 회사 데이터 로드
  async loadCompanies() {
    try {
      if (await fs.pathExists(this.corpCodePath)) {
        const data = await fs.readJson(this.corpCodePath);
        this.companies = data.companies || [];
        console.log(`✅ 회사 데이터 로드 완료: ${this.companies.length}개`);
      } else {
        console.warn('⚠️  corpCode.json 파일을 찾을 수 없습니다.');
        this.companies = [];
      }
    } catch (error) {
      console.error('회사 데이터 로드 실패:', error.message);
      this.companies = [];
    }
  }

  // 회사명으로 검색
  searchCompanies(query, limit = 20) {
    try {
      if (!this.companies) {
        return {
          success: false,
          error: '회사 데이터가 로드되지 않았습니다.',
          companies: []
        };
      }

      const lowerQuery = query.toLowerCase();
      
      // 검색 결과 필터링 및 정렬
      let results = this.companies.filter(company => {
        const searchText = [
          company.corp_name,
          company.corp_eng_name,
          company.stock_code
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchText.includes(lowerQuery);
      });

      // 정확도 순으로 정렬
      results.sort((a, b) => {
        const aName = a.corp_name.toLowerCase();
        const bName = b.corp_name.toLowerCase();
        
        // 정확히 일치하는 것이 가장 우선
        if (aName === lowerQuery) return -1;
        if (bName === lowerQuery) return 1;
        
        // 시작하는 것이 두 번째 우선
        const aStarts = aName.startsWith(lowerQuery);
        const bStarts = bName.startsWith(lowerQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // 이름 길이 순 (짧은 것 우선)
        return aName.length - bName.length;
      });

      // 제한된 개수만 반환
      results = results.slice(0, limit);
      
      return {
        success: true,
        query: query,
        total_results: results.length,
        companies: results
      };
      
    } catch (error) {
      console.error('회사 검색 실패:', error.message);
      return {
        success: false,
        error: error.message,
        companies: []
      };
    }
  }

  // 회사코드로 회사 정보 조회
  getCompanyByCode(corpCode) {
    try {
      if (!this.companies) {
        return {
          success: false,
          error: '회사 데이터가 로드되지 않았습니다.',
          company: null
        };
      }

      const company = this.companies.find(c => c.corp_code === corpCode);
      
      if (company) {
        return {
          success: true,
          company: company
        };
      } else {
        return {
          success: false,
          error: '회사를 찾을 수 없습니다.',
          company: null
        };
      }
      
    } catch (error) {
      console.error('회사 조회 실패:', error.message);
      return {
        success: false,
        error: error.message,
        company: null
      };
    }
  }

  // 인기 검색어 (종목코드가 있는 상장회사들)
  getPopularCompanies(limit = 10) {
    try {
      if (!this.companies) {
        return {
          success: false,
          error: '회사 데이터가 로드되지 않았습니다.',
          companies: []
        };
      }

      // 종목코드가 있는 상장회사들 필터링
      const listedCompanies = this.companies.filter(company => 
        company.stock_code && company.stock_code.trim() !== ''
      );

      // 랜덤하게 섞어서 선택
      const shuffled = listedCompanies.sort(() => 0.5 - Math.random());
      const results = shuffled.slice(0, limit);
      
      return {
        success: true,
        companies: results
      };
      
    } catch (error) {
      console.error('인기 회사 조회 실패:', error.message);
      return {
        success: false,
        error: error.message,
        companies: []
      };
    }
  }

  // 정리 (JSON 방식에서는 불필요하지만 호환성을 위해 유지)
  close() {
    // JSON 파일 방식에서는 별도 정리 작업 불필요
  }
}

module.exports = CompanyService;
