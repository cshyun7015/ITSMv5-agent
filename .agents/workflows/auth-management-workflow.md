# 사용자 및 운영자 인증 관리 워크플로우 (Auth Management Workflow)

## 0. 정책 기본 원칙
* [cite_start]**frontend-oper (운영사/MSP):** 사내 시스템(AD 등) 연동을 통한 SSO 및 RBAC 기반의 관리자 포털 접근 권한 부여(추후). 지금은 id/pwd 로 로그인 로직 구현. 멀티 운영사 고려. **보안:** 모든 인증은 JWT 또는 보안 토큰을 사용하여 세션을 관리하며, 테넌트 간 데이터 노출을 원천 차단함[cite: 18, 70, 93].
* [cite_start]**frontend-user (고객사/일반):** 테넌트(Tenant ID) 기반 가입, 로그인 및 사용자 포털 접근 권한 부여[cite: 29, 65, 89].
* [cite_start]**보안:** 모든 인증은 JWT 또는 보안 토큰을 사용하여 세션을 관리하며, 테넌트 간 데이터 노출을 원천 차단함[cite: 54, 75, 90].

## 단계 1: 인증 정책 및 권한 설계
* **주도 에이전트:** ITIL Expert, PM
* [cite_start]**작업 내용:** * 운영사와 고객사를 구분하는 권한 체계(RBAC) 정의[cite: 29, 87].
    * [cite_start]일반 사용자의 회원가입 시 승인 프로세스(자동 가입 혹은 관리자 승인) 기획[cite: 27, 28].
    * [cite_start]운영자의 AD 계정 동기화 범위 및 필드 매핑 정의. 운영사와 고객사 간의 맵핑

## 단계 2: 인증 UI/UX 디자인
* **주도 에이전트:** UI/UX Designer
* [cite_start]**작업 내용:** * 운영자용(Admin Portal)과 사용자용(User Portal) 로그인 화면의 브랜드 아이덴티티 분리 설계[cite: 73, 76, 78].
    * [cite_start]복잡한 가입 양식을 단계별(Wizard)로 나누어 직관적인 경험 제공[cite: 81, 82].
    * [cite_start]로그인 실패, 토큰 만료 등에 대한 사용자 친화적인 피드백 디자인[cite: 75, 77].

## 단계 3: DB 스키마 및 보안 로직 구현
* **주도 에이전트:** DBA, Backend Developer
* [cite_start]**작업 내용:** * **DBA:** 운영사/고객사 테이블 모델을 기반으로 `MSP_OPER`와 `CUSTOMER_USER` 테이블의 관계 및 인덱스 설계[cite: 6, 39, 41].
    * [cite_start]**Backend:** Spring Security를 활용하여 `frontend-oper`와 `frontend-user`를 구분하는 멀티 테넌시 인증 필터 구현[cite: 55, 56].
    * [cite_start]**Backend:** JWT 발급, 검증 및 로그아웃 시 토큰 무효화 로직 개발[cite: 52, 75].

## 단계 4: 프론트엔드 연동 및 세션 관리
* **주도 에이전트:** Frontend Developer
* [cite_start]**작업 내용:** * React/TypeScript 환경에서 테넌트별 동적 로그인 페이지 구현[cite: 65, 72].
    * [cite_start]로그인 시 획득한 토큰을 로컬 스토리지 또는 쿠키에 안전하게 저장하고 API 요청마다 헤더에 포함[cite: 74, 75].
    * [cite_start]로그아웃 시 클라이언트 측 세션 초기화 및 로그인 페이지로 리다이렉션 처리[cite: 65].

## 단계 5: 인증 보안 및 격리 검증 (QA)
* **주도 에이전트:** QA Engineer, Infra Architect
* [cite_start]**작업 내용:** * **QA:** 일반 사용자가 관리자 URL로 접근을 시도하거나 다른 테넌트의 계정으로 로그인을 시도하는 비정상 시나리오 검증[cite: 89, 90].
    * [cite_start]**QA:** 가입 시 필수 입력 값 유효성 및 중복 가입 방지 테스트[cite: 10, 86].
    * [cite_start]**Infra:** 모니터링 시스템(Prometheus, Loki)을 통해 로그인 실패 횟수 및 이상 징후 감시 체계 구축[cite: 17, 37, 62].
