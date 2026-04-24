---
description: 운영사 통합 대시보드 구축 워크플로우 (Operator Dashboard Workflow)
---

# 운영사 통합 대시보드 구축 워크플로우 (Operator Dashboard Workflow)

## 0. 핵심 목표
* **통합 관제:** 고객사의 모든 티켓과 인프라 상태를 단일 화면에서 관리(Single Pane of Glass)합니다.
* **신속한 대응:** 장애 발생 시 즉각적인 인지 및 상세 분석(Drill-down)이 가능해야 합니다.
* **자원 최적화:** Mac Mini M4 및 Docker 컨테이너 자원 사용량을 모니터링하여 MSP 효율을 극대화합니다.

## 단계 1: 통합 관제 및 분석 지표 정의
* **주도 에이전트:** Infra Architect, ITIL Expert
* **작업 내용:** * 전사 통합 지표: 전체 미해결 인시던트 현황, 테넌트별 SLA 위반 위험 티켓, 시스템 리소스(CPU/Mem) 부하.
    * 운영팀별(인프라팀, 앱개발팀 등) 맞춤형 워크리스트 구성 기획.

## 단계 2: 데이터 밀집형 UI 설계
* **주도 에이전트:** UI/UX Designer
* **작업 내용:** * 방대한 양의 데이터를 효율적으로 보여주는 데이터 그리드 및 차트 중심의 레이아웃 설계.
    * 긴급도(P1/P2)에 따른 시각적 경고(Blinking, Red highlight) 시스템 디자인.

## 단계 3: 통합 모니터링(LGTM) 연동 및 API 개발
* **주도 에이전트:** Infra Architect, Backend Developer
* **작업 내용:** * **Infra:** Loki(로그), Prometheus(메트릭), Grafana 대시보드를 시스템과 연동. Mac Mini M4 노드 메트릭 수집 설정.
    * **Backend:** 고객사별 통합 집계(Aggregation)하는 관리자 전용 API 구현. 운영사 전용 테이블 모델 기반 권한 체크 로직 적용. (운영사가 관리하는 고객사 정보만 대상으로 대시보드 구현)

## 단계 4: MSP 통합 포털 구현
* **주도 에이전트:** Frontend Developer
* **작업 내용:** * 고밀도 데이터 그리드(Filtering, Sorting, Pagination) 구현.
    * Grafana 차트를 IFRAME 또는 API 방식으로 포털 내부에 임베딩.

## 단계 5: 시스템 부하 및 권한 검증 (QA)
* **주도 에이전트:** QA Engineer
* **작업 내용:** * **성능 테스트:** k6를 활용하여 고객사 대량 데이터를 동시 조회할 때의 응답 시간 검증.
    * **권한 검증:** 운영자 등급(Super Admin vs 일반 Operator)에 따른 기능 제어 테스트.