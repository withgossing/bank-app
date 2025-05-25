# Gateway Service

Spring Cloud Gateway 기반의 API Gateway 서비스입니다.

## 주요 기능
- API 라우팅
- 로드 밸런싱
- 인증/인가
- Rate Limiting
- Circuit Breaker

## 기술 스택
- Spring Boot 3.2.x
- Spring Cloud Gateway
- Spring Cloud Netflix Eureka Client
- Gradle

## 라우팅 규칙
- `/api/users/**` → User Service
- `/api/accounts/**` → Account Service
- `/api/products/**` → Product Service

## 실행 방법
```bash
./gradlew bootRun
```

## 접속 정보
- Gateway: http://localhost:8080
