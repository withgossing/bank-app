# Bank Application - MSA Architecture

## 📋 프로젝트 개요

마이크로서비스 아키텍처(MSA) 기반의 은행 애플리케이션입니다.

### 기술 스택
- **Backend**: Spring Boot 3.2.x + Gradle
- **Frontend**: React 18 + TypeScript + Material-UI
- **Database**: PostgreSQL 16
- **API Gateway**: Spring Cloud Gateway
- **Service Discovery**: Eureka
- **Message Broker**: RabbitMQ
- **Container**: Docker & Docker Compose

### 서비스 구성
1. **User Service** (포트: 8081) - 사용자 정보 관리
2. **Account Service** (포트: 8082) - 계좌 정보 관리
3. **Product Service** (포트: 8083) - 예금 상품 관리
4. **Gateway Service** (포트: 8080) - API Gateway
5. **Discovery Service** (포트: 8761) - Service Discovery (Eureka)
6. **Frontend** (포트: 3000) - React 웹 애플리케이션

### 주요 기능
- 사용자 등록 및 관리
- 계좌 개설 및 조회
- 예금 상품 관리
- 이자 계산 (단리/복리)
- 세금 계산 (15.4% 일반과세)

## 🚀 실행 방법

### 1. 전체 서비스 실행
```bash
cd /Users/gossing/WorkPlace/bank-app
docker-compose up -d
```

### 2. 개별 서비스 실행
```bash
# Backend 서비스
cd [service-name]
./gradlew bootRun

# Frontend
cd frontend
npm install
npm start
```

### 3. 서비스 접속
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761

## 📁 프로젝트 구조
```
bank-app/
├── user-service/         # 사용자 서비스
├── account-service/      # 계좌 서비스
├── product-service/      # 상품 서비스
├── gateway-service/      # API Gateway
├── discovery-service/    # Eureka Server
├── frontend/            # React Frontend
├── docker-compose.yml   # Docker Compose 설정
└── README.md
```

## 🔧 개발 가이드

### API 엔드포인트
- `/api/users/**` - 사용자 관련 API
- `/api/accounts/**` - 계좌 관련 API
- `/api/products/**` - 상품 관련 API

### 데이터베이스 스키마
각 서비스는 독립적인 데이터베이스를 사용합니다:
- `bank_user_db` - 사용자 정보
- `bank_account_db` - 계좌 정보
- `bank_product_db` - 상품 정보
