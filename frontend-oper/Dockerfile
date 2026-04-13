# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# 패키징 매니저 설정 및 의존성 설치
COPY package.json ./
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Production stage (Nginx)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# 기존 기본 파일 제거 및 빌드 결과물 복사
RUN rm -rf ./*
COPY --from=build /app/dist .

# Nginx 설정 (SPA 라우팅 지원)
RUN printf "server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html index.htm;\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
    location /api {\n\
        proxy_pass http://it-backend:8080;\n\
    }\n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
