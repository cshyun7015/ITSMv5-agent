---
description: 
---

# 코드 관리 및 형상 병합 워크플로우 (Code Management & PR Workflow)

## 0. 목적 및 기본 정책
* **목적:** 다중 테넌트 환경의 코드 무결성을 유지하고, Git 롤백이나 병합 충돌로 인한 DB 스키마 불일치를 원천 차단합니다.
* **빌드 환경:** Backend는 반드시 `Gradle`을 사용하며(Maven 불가), Frontend는 `React/TypeScript` 및 BEM 방법론을 준수합니다.
* **브랜치 전략:** `main` (운영) <- `develop` (통합 테스트) <- `feature/기능명` (개별 작업)

## 단계 1: 작업 할당 및 브랜치 생성
* **주도 에이전트:** ITSM Project Manager (PM)
* **참여 에이전트:** Backend Developer, Frontend Developer
* **작업 내용:** * PM은 WBS에 따라 기능 또는 버그 수정 티켓을 발행합니다.
    * 개발자는 `develop` 브랜치에서 최신 코드를 pull 받은 후, 명명 규칙(`feature/티켓번호-작업내용` 또는 `hotfix/이슈내용`)에 맞추어 신규 브랜치를 생성합니다.

## 단계 2: 로컬 개발 및 스키마 동기화 (★ 핵심 안전 장치)
* **주도 에이전트:** Backend Developer, DBA
* **참여 에이전트:** Frontend Developer, UI/UX Designer
* **작업 내용:**
    * **Backend:** 비즈니스 로직 및 API를 개발합니다. 이때 Java 엔티티 구조를 변경할 경우 DB 스키마 자동 업데이트(ddl-auto)를 즉시 사용하지 않고 SQL 스크립트를 생성합니다.
    * **DBA:** 생성된 SQL 스크립트를 리뷰하고, 고객사/운영사(MSP)가 분리된 테이블 모델과의 정합성을 검사합니다. 이전 Git 롤백 이슈가 재발하지 않도록 엔티티와 실제 스키마 상태를 교차 검증합니다.
    * **Frontend:** UI/UX Designer가 설계한 디자인 시스템에 맞추어 동적 렌더링 화면을 구현합니다.

## 단계 3: Pull Request (PR) 및 코드 리뷰
* **주도 에이전트:** 전체 개발 그룹 (PM, Backend, Frontend)
* **참여 에이전트:** Infrastructure Architect
* **작업 내용:**
    * 개발이 완료되면 `develop` 브랜치로 PR을 생성합니다.
    * PR 내용에는 '수정된 DB 스키마 내역', '영향받는 테넌트 범위'를 필수로 기재합니다.
    * 인프라 아키텍트는 추가된 라이브러리(Gradle 의존성 등)가 Mac Mini M4(Rosetta 2) 및 Docker 컨테이너 환경에서 충돌을 일으키지 않는지 검토합니다.

## 단계 4: 자동화 테스트 및 품질 검증 (QA)
* **주도 에이전트:** QA Engineer
* **작업 내용:**
    * PR이 생성되면 QA 에이전트가 격리된 테스트 환경에서 검증 파이프라인을 가동합니다.
    * **E2E 테스트:** Playwright를 활용해 지원 티켓 및 서비스 요청 워크플로우가 정상 작동하는지 확인합니다.
    * **격리 테스트:** RBAC 및 테넌트 식별자를 통한 데이터 격리가 유지되는지 검증합니다.
    * **성능 테스트:** k6를 통해 신규 병합된 쿼리가 MariaDB 10.11 환경에서 슬로우 쿼리를 유발하지 않는지 점검합니다.

## 단계 5: 최종 승인 및 병합 (Merge)
* **주도 에이전트:** ITSM Project Manager (PM)
* **작업 내용:**
    * DBA의 스키마 승인, 인프라의 환경 승인, QA의 테스트 통과 결과를 모두 취합합니다.
    * 모든 조건이 충족되면 PM이 PR을 승인하고 `develop` 브랜치로 코드를 병합(Merge)합니다.
    * 병합 후 스테이징 환경 배포 파이프라인을 트리거합니다.
