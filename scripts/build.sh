#!/bin/bash
# EduSphere Build Script for Linux/macOS
# Run this from the root directory of the project

set -e

echo "=========================================="
echo "1. Building Angular Frontend..."
echo "=========================================="

cd frontend
npm install
npm run build
cd ..

echo "=========================================="
echo "2. Copying assets to Spring Boot..."
echo "=========================================="

STATIC_DIR="backend/src/main/resources/static"
mkdir -p "$STATIC_DIR"
rm -rf "$STATIC_DIR"/*

cp -r frontend/dist/edtech-frontend/browser/* "$STATIC_DIR"/

echo "=========================================="
echo "3. Compiling Spring Boot Executable JAR..."
echo "=========================================="

cd backend
chmod +x mvnw
./mvnw clean package -DskipTests
cd ..

echo "=========================================="
echo "Build Complete!"
echo "Packaged Jar: backend/target/backend-0.0.1-SNAPSHOT.jar"
echo "To run: java -jar backend/target/backend-0.0.1-SNAPSHOT.jar"
echo "=========================================="
