# --- Stage 1: Build Angular Frontend ---
FROM node:22-alpine AS frontend-builder
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Spring Boot Backend ---
FROM maven:3.9-eclipse-temurin-21 AS backend-builder
WORKDIR /build/backend
COPY backend/pom.xml ./
# Pre-fetch backend dependencies
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Copy Angular files to Spring Boot static resource dir
COPY --from=frontend-builder /build/frontend/dist/edtech-frontend/browser ./src/main/resources/static
# Build executable jar
RUN mvn package -DskipTests

# --- Stage 3: Production Runner Image ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-builder /build/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
