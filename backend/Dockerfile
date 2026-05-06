# Use an official Maven image to build the project
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the Maven project files
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Use a lightweight Java runtime to run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built JAR file from the 'build' stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]