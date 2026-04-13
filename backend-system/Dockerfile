# Build stage
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# 설정 파일 및 소스 코드 복사
COPY build.gradle settings.gradle ./
COPY src src

# 애플리케이션 빌드
RUN gradle bootJar -x test --no-daemon

# Production stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 빌드 결과물 복사
COPY --from=build /app/build/libs/*.jar app.jar

# 컨테이너 실행 환경 설정
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
