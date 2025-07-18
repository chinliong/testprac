#!/bin/bash

# SonarQube Analysis Script
# Run this script to perform local SonarQube analysis

echo "🔍 Starting SonarQube Analysis..."

# Check if SonarQube is running
if ! curl -s http://localhost:9000/api/system/status > /dev/null; then
    echo "❌ SonarQube server is not running!"
    echo "Please start SonarQube with: docker-compose up -d"
    exit 1
fi

echo "✅ SonarQube server is running"

# Run tests with coverage
echo "🧪 Running tests with coverage..."
npm test -- --coverage

if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

echo "✅ Tests passed"

# Run SonarQube analysis
echo "📊 Running SonarQube analysis..."
sonar-scanner \
  -Dsonar.projectKey=testprac \
  -Dsonar.projectName="Test Practical - Secure Password Application" \
  -Dsonar.projectVersion=1.0 \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=squ_70db82ef5569d5696c56d01d7526f92b85ad2e09

if [ $? -eq 0 ]; then
    echo "🎉 SonarQube analysis completed successfully!"
    echo "📈 View results at: http://localhost:9000/dashboard?id=testprac"
    open http://localhost:9000/dashboard?id=testprac
else
    echo "❌ SonarQube analysis failed!"
    exit 1
fi
