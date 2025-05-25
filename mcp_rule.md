# Bank Application MCP 규칙

## 프로젝트 기본 정보

### 📁 프로젝트 위치
- **기본 경로**: `/Users/gossing/WorkPlace/bank-app`
- **아키텍처**: MSA (Microservice Architecture)
- **빌드 도구**: Gradle
- **Java 버전**: 17

### 🏗️ 서비스 구성

#### Backend Services
1. **Discovery Service** (포트: 8761)
   - Netflix Eureka Server
   - 서비스 디스커버리 및 레지스트리

2. **Gateway Service** (포트: 8080)
   - Spring Cloud Gateway
   - API 라우팅 및 로드 밸런싱
   - 인증/인가 처리

3. **User Service** (포트: 8081)
   - 사용자 정보 관리
   - JWT 기반 인증
   - PostgreSQL DB: bank_user_db

4. **Account Service** (포트: 8082)
   - 계좌 정보 관리
   - 입출금 처리
   - PostgreSQL DB: bank_account_db

5. **Product Service** (포트: 8083)
   - 예금 상품 관리
   - 이자율 계산
   - PostgreSQL DB: bank_product_db

#### Frontend
- **React + TypeScript** (포트: 3000)
- Material-UI 디자인 시스템
- Redux Toolkit 상태 관리

#### Infrastructure
- **PostgreSQL 16**: 각 서비스별 독립 DB
- **RabbitMQ**: 비동기 메시지 처리
- **Docker & Docker Compose**: 컨테이너화

### 🔧 기술 스택

#### Backend
- **Framework**: Spring Boot 3.2.x
- **Cloud**: Spring Cloud 2023.0.1
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA
- **Message Queue**: Spring AMQP (RabbitMQ)

#### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **UI Library**: Material-UI v5
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Routing**: React Router v6

### 📊 데이터베이스 스키마

#### User Service (bank_user_db)
```sql
-- 사용자 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

#### Account Service (bank_account_db)
```sql
-- 계좌 테이블
CREATE TABLE accounts (
    id BIGSERIAL PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 거래 내역 테이블
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL REFERENCES accounts(id),
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Product Service (bank_product_db)
```sql
-- 예금 상품 테이블
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    min_amount DECIMAL(15,2) DEFAULT 0,
    max_amount DECIMAL(15,2),
    duration_months INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 🚀 실행 방법

#### 1. 전체 서비스 실행 (Docker Compose)
```bash
cd /Users/gossing/WorkPlace/bank-app
docker-compose up -d
```

#### 2. 개별 서비스 실행
```bash
# Backend 서비스
cd [service-name]
./gradlew bootRun

# Frontend
cd frontend
npm install
npm start
```

### 🔑 API 엔드포인트

#### User Service
- `POST /api/users/register` - 사용자 등록
- `POST /api/users/login` - 로그인
- `GET /api/users/{id}` - 사용자 조회
- `PUT /api/users/{id}` - 사용자 수정

#### Account Service
- `POST /api/accounts` - 계좌 개설
- `GET /api/accounts/{accountNumber}` - 계좌 조회
- `POST /api/accounts/{accountNumber}/deposit` - 입금
- `POST /api/accounts/{accountNumber}/withdraw` - 출금
- `GET /api/accounts/{accountNumber}/transactions` - 거래 내역 조회

#### Product Service
- `GET /api/products` - 상품 목록 조회
- `GET /api/products/{id}` - 상품 상세 조회
- `POST /api/products` - 상품 등록 (관리자)
- `PUT /api/products/{id}` - 상품 수정 (관리자)

### 💰 이자 계산 로직

#### 단리 계산
```
이자 = 원금 × 연이율 × 기간(년)
```

#### 복리 계산
```
최종금액 = 원금 × (1 + 연이율)^기간(년)
이자 = 최종금액 - 원금
```

#### 세금 계산
- 일반과세: 이자소득세 14% + 지방소득세 1.4% = 15.4%
- 세후 이자 = 이자 × (1 - 0.154)

### 🔒 보안 설정

#### JWT 토큰
- Access Token 유효기간: 30분
- Refresh Token 유효기간: 7일
- 토큰 저장: localStorage (프론트엔드)

#### CORS 설정
```yaml
allowed-origins:
  - http://localhost:3000
  - http://localhost:8080
```

### 📈 모니터링

#### Health Check Endpoints
- Discovery Service: http://localhost:8761/actuator/health
- Gateway Service: http://localhost:8080/actuator/health
- User Service: http://localhost:8081/actuator/health
- Account Service: http://localhost:8082/actuator/health
- Product Service: http://localhost:8083/actuator/health

#### 관리 도구
- Eureka Dashboard: http://localhost:8761
- RabbitMQ Management: http://localhost:15672 (admin/admin123)
- Adminer (DB): http://localhost:18080

### 🎯 다음 단계 계획

1. **기능 구현**
   - [ ] User Service 전체 구현
   - [ ] Account Service 전체 구현
   - [ ] Product Service 전체 구현
   - [ ] Frontend 페이지 구현

2. **추가 기능**
   - [ ] 정기예금 자동 갱신
   - [ ] 이자 지급 스케줄러
   - [ ] 계좌 이체 기능
   - [ ] 거래 내역 PDF 다운로드

3. **인프라 개선**
   - [ ] Redis 캐시 적용
   - [ ] ELK 스택 로깅
   - [ ] Prometheus + Grafana 모니터링
   - [ ] CI/CD 파이프라인 구축

### 📝 개발 규칙

1. **코드 스타일**
   - Java: Google Java Style Guide
   - TypeScript: Airbnb Style Guide

2. **커밋 메시지**
   - feat: 새로운 기능
   - fix: 버그 수정
   - docs: 문서 수정
   - style: 코드 포맷팅
   - refactor: 코드 리팩토링
   - test: 테스트 코드
   - chore: 빌드 업무 수정

3. **브랜치 전략**
   - main: 프로덕션 브랜치
   - develop: 개발 브랜치
   - feature/*: 기능 개발
   - hotfix/*: 긴급 수정

---

**이 문서는 새로운 MCP 세션에서 프로젝트의 연속성을 보장하기 위한 참조 문서입니다.**
