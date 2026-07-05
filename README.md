# EdTech Platform - Enterprise Architecture

This repository contains a full-stack, enterprise-grade Educational Technology (EdTech) platform built using **Angular 21** (Standalone Components, Signals, Router-driven Lazy Loading) and **Spring Boot 3** (Java 21, Spring Security, JWT, JPA, Hibernate).

## Architecture Overview

The system is designed to run as a single deployment unit or a containerized multi-container setup:

1. **Frontend**: Serves the UI to the user. In production, the built Angular files are copied into the Spring Boot backend's static resource directory (`src/main/resources/static/`).
2. **Backend**: A Spring Boot REST API handles authentication, user accounts (Roles: Admin, Instructor, Student), course creation, lesson viewing, video delivery (via Cloudinary), and payments (via Razorpay).
3. **Database**: MySQL 8 manages the persistent state (users, courses, purchases, certificates).
4. **Cache**: Redis handles token blacklists, refresh tokens, and performance caching.
5. **Reverse Proxy & Gateway**: Nginx routes HTTPS requests to the static files or Spring Boot endpoints, providing compression and TLS termination.

---

## Project Structure

```
edtech-platform/
├── backend/                   # Spring Boot 3 API & static files handler
├── frontend/                  # Angular 21 Standalone App
├── docker/                    # Dockerfiles & docker-compose configurations
├── nginx/                     # Reverse proxy routing rules
├── database/                  # Schema definition and seeding data
├── docs/                      # OpenAPI & architecture documentation
├── scripts/                   # Helper scripts for building and running
└── README.md                  # This documentation
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js v22+ & npm 10+
- JDK 21
- Docker Desktop (Optional, for MySQL & Redis)

### Running MySQL & Redis via Docker
From the project root:
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Running Backend API
```bash
cd backend
./mvnw spring-boot:run
```
The REST API will be available at `http://localhost:8080`.

### Running Frontend UI
```bash
cd frontend
npm install
npm start
```
The UI will be available at `http://localhost:4200` (auto-proxied to port 8080 for `/api` requests).

---

## Production Build & Single JAR Packaging

To bundle the Angular frontend into the Spring Boot backend and build a single executable JAR:

```bash
# On Windows
PowerShell -File .\scripts\build.ps1

# On Linux/macOS
bash ./scripts/build.sh
```

This script:
1. Installs Angular dependencies and runs production build.
2. Copies output files to `backend/src/main/resources/static`.
3. Runs `./mvnw clean package` in `backend`.
4. Outputs the final runnable fat-jar to `backend/target/edtech-platform-0.0.1-SNAPSHOT.jar`.

Run it with:
```bash
java -jar backend/target/edtech-platform-0.0.1-SNAPSHOT.jar
```
Your entire EdTech portal will now be running on `http://localhost:8080`.
