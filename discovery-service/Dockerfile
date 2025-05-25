# Discovery Service Dockerfile
FROM openjdk:17-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# Gradle Wrapper 복사
COPY gradlew .
COPY gradle gradle

# 빌드 파일 복사
COPY build.gradle .

# 소스 코드 복사
COPY src src

# 실행 권한 부여
RUN chmod +x ./gradlew

# 애플리케이션 빌드
RUN ./gradlew bootJar --no-daemon

# 빌드된 JAR 파일을 실행 위치로 이동
RUN mv build/libs/discovery-service.jar app.jar

# 불필요한 파일 제거
RUN rm -rf build src gradle gradlew build.gradle

# 포트 노출
EXPOSE 8761

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD curl -f http://localhost:8761/actuator/health || exit 1

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
