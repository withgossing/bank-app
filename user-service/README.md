# User Service

사용자 정보를 관리하는 마이크로서비스입니다.

## 주요 기능
- 사용자 등록
- 사용자 조회/수정/삭제
- 사용자 인증
- JWT 토큰 발급

## 기술 스택
- Spring Boot 3.2.x
- Spring Data JPA
- PostgreSQL
- Spring Security
- JWT
- RabbitMQ
- Gradle

## API 엔드포인트
- `POST /api/users/register` - 사용자 등록
- `POST /api/users/login` - 로그인
- `GET /api/users/{id}` - 사용자 조회
- `PUT /api/users/{id}` - 사용자 수정
- `DELETE /api/users/{id}` - 사용자 삭제

## 데이터베이스 스키마
```sql
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

## 실행 방법
```bash
./gradlew bootRun
```
