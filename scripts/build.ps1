# EduSphere Build Script for Windows
# Run this from the root directory of the project

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Building Angular Frontend..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Push-Location frontend
npm install
npm run build
Pop-Location

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "2. Copying assets to Spring Boot..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Ensure static resource directory exists
$StaticDir = "backend\src\main\resources\static"
if (!(Test-Path $StaticDir)) {
    New-Item -ItemType Directory -Force -Path $StaticDir
} else {
    # Clean old assets
    Remove-Item -Recurse -Force "$StaticDir\*" -ErrorAction SilentlyContinue
}

# Copy from dist to static
Copy-Item -Path "frontend\dist\edtech-frontend\browser\*" -Destination $StaticDir -Recurse -Force

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "3. Compiling Spring Boot Executable JAR..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Push-Location backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
.\mvnw clean package -DskipTests
Pop-Location

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "Packaged Jar: backend\target\backend-0.0.1-SNAPSHOT.jar" -ForegroundColor Green
Write-Host "To run: java -jar backend\target\backend-0.0.1-SNAPSHOT.jar" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
