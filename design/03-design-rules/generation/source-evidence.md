# Source Evidence Map

이 파일은 generation rule이 어떤 실제 화면에서 나온 것인지 추적하기 위한 참고용이다.

기계적인 Pattern Retrieval은 `design/03-design-rules/patterns/registry.json`을 사용한다.
이 문서의 evidence 이름은 semantic 근거이고, 실제 clone용 node ID는 최신 extract snapshot에서 registry selector가 exact unique match일 때만 resolve한다.

## v1. 공통 페이지
관찰 범위:
- Home / landing
- 공지사항 목록
- 공지 상세
- FAQ
- 팀빌딩
- 마이페이지
- 팀원/설정 modal
- 1차 심사 결과 발표 variation

주요 근거:
- public reading page의 중앙 정렬/낮은 밀도
- 팀빌딩의 entity card grid
- 카드 내부 bounded position list
- MyPage의 table/status 영역
- modal의 bounded secondary task
- 공통 top navigation / dark footer

## v1. 심사 페이지
관찰 범위:
- 심사 대상 목록
- document viewer
- AI 과제 요약
- 심사표
- 진행률/점수
- 최종 검토 table

주요 근거:
- high-density evaluation workspace
- context preservation
- entity queue + artifact + scoring
- final review matrix
- progress/next-item flow

## v1. 최종 심사 페이지
관찰 범위:
- 좌측 심사 queue
- 대형 content/viewer
- 우측 floating/expanded score panel
- panel collapse variation

주요 근거:
- evaluation workspace
- center-primary spatial hierarchy
- evaluation panel의 persistent local task
- viewport 적극 사용

## v2. AI 심사 페이지
관찰 범위:
- AI 심사 dashboard
- summary KPI
- 128건 table
- result detail
- agent/template management
- test/config forms

주요 근거:
- KPI summary + data table
- filter/sort/export proximity
- admin high density
- summary/detail hierarchy
- status colors
- configuration form의 local panels

## v3. 지원하기_NEW
관찰 범위:
- 지원서 없음 → form direct entry
- 지원서 있음 → status hub
- MyPage 상태
- multi-step form
- DRAFT/SUBMITTED/REVIEWING/REVIEWED

주요 근거:
- state-driven entity card
- persistent step form
- explicit submit
- progress + timestamp + next action
- empty state

## v4. 하반기 해커톤용
관찰 범위:
- 1차 합격 발표
- 팀빌딩 모집 예정
- 팀빌딩 active
- 팀빌딩 설정 modal

주요 근거:
- campaign/celebration visual mode
- dark/gold exception
- campaign → functional page transition
- entity browse card grid
- modal configuration

## v5. 최종보고서 제출
관찰 범위:
- 최종보고서 진입 status hub
- 9-step workflow
- final package submission
- submitted / changed / resubmit state

주요 근거:
- final-report persistent step form
- package readiness grid
- explicit completion event
- submitted-after-change warning
- final action bar