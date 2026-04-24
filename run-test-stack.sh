#!/bin/bash
# run-test-stack.sh

# 1. 테스트 컨테이너 중지 및 기존 볼륨 데이터 삭제 (깔끔한 시작)
echo "Stopping existing test stack..."
/usr/local/bin/docker-compose -f docker-compose.test.yml down -v

# 2. 테스트 스택 빌드 및 실행
echo "Building and starting test stack on ports 8081, 3001, 4002..."
/usr/local/bin/docker-compose -f docker-compose.test.yml up -d --build

# 3. MariaDB 헬스체크 대기
echo "Waiting for test database to be ready..."
until [ "$(/usr/local/bin/docker inspect -f {{.State.Health.Status}} it-mariadb-test)" == "healthy" ]; do
    sleep 2
done

# 4. 백엔드 기동 대기 (단순 대기 혹은 포트 스캐닝)
echo "Waiting for test backend to reach homeostasis..."
sleep 15

echo "Test stack is ready!"
echo "- Backend: http://localhost:8081"
echo "- Operator Portal: http://localhost:3002"
echo "- User Portal: http://localhost:4002"
