# Dockerfile

# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# 🔑 Expose the port (documentation only; actual binding is handled by server.port)
EXPOSE 10000

# Memory management for free tier
ENTRYPOINT ["sh", "-c", "java -jar -Dserver.port=${PORT:-10000} app.jar"]
