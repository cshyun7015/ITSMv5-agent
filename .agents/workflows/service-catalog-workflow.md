---
description: 본 워크플로우는 최종 사용자가 IT 서비스를 쉽게 찾아 신청할 수 있도록 서비스 항목을 정의하고, 멀티 테넌트 환경에 맞춰 맞춤형 입력 폼과 결재선을 동적으로 구성하는 전체 과정을 정의합니다.
---

# 서비스 카탈로그 관리 워크플로우 (Service Catalog Management Workflow)

## 1. 개요
본 워크플로우는 최종 사용자가 IT 서비스를 쉽게 찾아 신청할 수 있도록 서비스 항목을 정의하고, 멀티 테넌트 환경에 맞춰 맞춤형 입력 폼과 결재선을 동적으로 구성하는 전체 과정을 정의합니다.

## 2. 단계별 구축 및 운영 절차

### 단계 1: 서비스 항목 기획 및 분류 (Planning & Taxonomy)
* **주도 에이전트:** ITIL Expert, PM
* **작업 내용:** * 고객사 공통 적용 서비스(예: 패스워드 초기화, 공용 소프트웨어 설치)와 개별 테넌트 전용 서비스(예: 특정 고객사 전용 ERP 권한 요청)를 분류합니다.
  * 카탈로그의 대/중/소 카테고리 계층 구조를 설계합니다.

### 단계 2: 데이터 모델링 및 동적 폼 API 구현 (Data Modeling & API)
* **주도 에이전트:** DBA, Backend Developer
* **작업 내용:**
  * **DBA:** 고객사 테이블 모델 내에 서비스 카탈로그 마스터 테이블과 속성(Attributes) 테이블을 설계합니다.
  * **Backend:** 관리자가 설정한 입력 필드(텍스트, 드롭다운, 첨부파일 등)를 프론트엔드가 해석할 수 있는 **JSON 스키마 규격**으로 변환하여 전달하는 API를 개발합니다.
  * **Backend:** 테넌트 식별자(Tenant ID)에 따라 열람 가능한 카탈로그 목록을 제한하는 격리 로직을 적용합니다.

### 단계 3: 사용자 경험 설계 및 화면 렌더링 (UX Design & UI Rendering)
* **주도 에이전트:** UI/UX Designer, Frontend Developer
* **작업 내용:**
  * **UI/UX Designer:** 복잡한 IT 요청을 쇼핑몰 장바구니처럼 쉽게 담고 신청할 수 있는 카탈로그 UI를 설계합니다.
  * **Frontend:** 백엔드에서 내려받은 JSON 스키마를 기반으로 동적 폼(Dynamic Form)을 화면에 렌더링합니다. 공통 코드 API와 연동하여 드롭다운 메뉴의 항목을 실시간으로 구성합니다.

### 단계 4: 결재선 및 이행 워크플로우 매핑 (Approval & Fulfillment Mapping)
* **주도 에이전트:** Backend Developer, ITIL Expert
* **작업 내용:**
  * 각 서비스 카탈로그 항목별로 사전 정의된 결재선(예: 팀장 승인 -> 보안담당자 승인)을 워크플로우 엔진에 매핑합니다.
  * 승인 완료 시 티켓이 배정될 운영사(MSP)의 담당 부서를 지정합니다.

### 단계 5: 격리 검증 및 릴리스 (Isolation Validation & Publishing)
* **주도 에이전트:** QA Engineer
* **작업 내용:**
  * 테넌트 A의 사용자가 테넌트 B의 전용 서비스 카탈로그에 접근하거나 신청할 수 없는지 교차 검증합니다.
  * 관리자가 새로운 카탈로그 항목을 추가했을 때, 프론트엔드 코드 수정 없이 즉각 화면에 올바르게 노출되고 작동하는지 Playwright를 통해 E2E 테스트를 수행합니다.

## 3. 에이전트별 책임 매트릭스 (RACI)

| 역할 | 기획/분류 | 데이터/API | UI/렌더링 | 결재선 매핑 | 검증/배포 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **PM** | A | I | I | I | A |
| **ITIL Expert** | R | C | C | R | I |
| **DBA** | C | R | I | I | I |
| **Backend Developer** | I | R | C | R | I |
| **Frontend Developer** | I | I | R | I | I |
| **UI/UX Designer** | I | I | R | I | C |
| **QA Engineer** | I | I | I | I | R |

*R: Responsible(실무 담당), A: Accountable(최종 책임), C: Consulted(자문), I: Informed(정보 공유)*