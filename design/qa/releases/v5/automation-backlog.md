# v5 QA Automation Backlog — Deferred

Source: `design/qa/releases/v5/qa-cases.yaml`

## Current decision

V5에서는 브라우저 QA 자동화를 구현하지 않는다.

현재 QA는 45개이며 여러 TC를 사용자 journey 단위로 묶어 검수할 수 있다. 실제 화면의 의미와 상태를 사람이 최종 확인해야 하는 항목도 많다. 현재 회사 작업 환경에서는 자동화를 위한 실행 환경, 테스트 fixture, 상태 제어를 별도로 구축하는 비용이 수동 QA 절감 효과보다 클 가능성이 높다.

따라서 이번 V5는 `manual-checklist.md`의 journey 기반 수동 QA를 사용한다.

## 계속 자동화하는 영역

Design Flow Harness의 구조/semantic coverage 자동화는 유지한다.

- mutation 후 scoped extract
- 최신 snapshot 갱신
- coverage assertion
- semantic state / 필수 상태 누락 검증
- 반복되는 생성 실수의 harness/coverage 회귀 방지

이는 실제 서비스 QA와 별도 영역이다.

## 다시 검토할 시점

아래 상황이 생기면 브라우저 QA 자동화를 다시 검토한다.

- V6/V7 등에서 동일 회귀 QA를 반복 실행하게 됨
- QA 수가 크게 증가함
- 동일 제출/수정/재제출 흐름을 여러 환경에서 반복해야 함
- 테스트용 fixture/seed 또는 상태 제어 환경이 자연스럽게 제공됨
- 브라우저 agent 또는 Playwright 실행 환경을 별도 구축 없이 사용할 수 있게 됨

## 향후 자동화 후보

자동화를 재개한다면 우선순위는 다음과 같다.

1. 저장 ≠ 최종 제출
2. 최종 제출 성공
3. 제출 후 수정 → 재제출 필요
4. 재제출 → 최신 제출본 반영
5. A-30/A-32 상태 동기화
6. package 4종 및 미등록 상태
7. PDF only + 20MB 경계 validation
8. 7/8 → 8/8 completion

마감 상태처럼 backend time control이 필요한 케이스와 AI 발표자료 생성처럼 비동기 contract가 필요한 케이스는 후순위로 둔다.


## Spec gap 처리

`qa-gap-audit.md`에 기록된 미정 정책은 자동화 후보로 취급하지 않는다. expected behavior가 확정된 뒤 QA 정본에 반영한다.
