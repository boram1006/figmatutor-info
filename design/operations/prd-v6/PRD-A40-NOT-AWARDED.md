# A-40 PRD — 심사 결과 / 미입상

> Release: v6
> Screen ID: A-40
> State: `NOT_AWARDED`
> Audience: 본선 TOP30 참가자 중 미입상 팀
> Entry: 마이페이지 → 내 지원 현황 → 선택한 지원서 → 심사 결과 보기
> Status: current implementation-aligned PRD

---

## 1. 목적

본선 심사가 완료된 참가자가 자신의 **미입상 결과를 명확하게 확인**하고,
심사 과정에서 확인된 프로젝트 강점과 심사위원 평가를 확인한다.

이 화면의 첫 번째 사용자 질문은:

> “그래서 우리 팀은 수상한 건가, 아닌 건가?”

첫 viewport에서 해석 없이 답이 보여야 한다.

미입상 사실을 숨기지는 않되, 불필요하게 차갑거나 실패를 강조하는 표현은 사용하지 않는다.

---

## 2. 진입 및 Navigation

- 진입 경로: `마이페이지 → 내 지원 현황 → 선택한 지원서 → 심사 결과 보기`
- A-40은 선택된 지원 건의 child/detail 화면이다.
- My Page sidebar는 노출하지 않는다.
- 상단에 `← 내 지원 현황으로 돌아가기`를 제공한다.

---

## 3. 화면 정보 구조

### 3.1 지원 프로젝트 Context

표시:
- `본선 진출 TOP 30` 등 이전 단계 성과
- 프로젝트명
- 팀명
- 팀장/구성원 요약
- 트랙

주의:
- `TOP 30`은 이전 단계 성과/맥락이다.
- 최종 결과인 것처럼 hero보다 더 강하게 표현하지 않는다.

### 3.2 미입상 결과 Hero

필수 정보:
- 상태 tag: `본선 미입상`
- headline: `이번 본선에서는 수상팀으로 선정되지 않았습니다.`
- 보조 설명
- final result object:
  - `FINAL RESULT`
  - `수상 미선정`
  - `본선 진출 TOP 30`은 보조 context

원칙:
- `심사가 완료되었습니다` 같은 일반 상태만 headline으로 사용하지 않는다.
- 결과 자체가 첫 viewport에서 명확해야 한다.
- `탈락`, `실패`처럼 필요 이상으로 강한 표현은 사용하지 않는다.
- celebration gradient/award object는 사용하지 않고 중립적 result treatment를 적용한다.

### 3.3 핵심 강점

미입상이어도 심사 과정에서 확인된 강점을 제공한다.

구조:
- section intro
- 동일 위계의 3개 highlight card
- 각 card:
  - label/icon
  - 강점 제목
  - 설명
  - 보조 evidence/keyword

원칙:
- 수상 화면과 동일한 정보 구조를 유지한다.
- 단, 평가 강도/표현은 실제 심사 결과에 맞게 달라질 수 있다.
- peer card는 동일 높이.

### 3.4 심사위원 종합 평가

표시:
- 패널 총평
- 심사위원별 주요 평가

미입상 상태에서는:
- 강점뿐 아니라 상위 평가로 이어지지 못한 보완 관점이 포함될 수 있다.
- 평가를 과도하게 부정적으로 재작성하지 않는다.
- 실제 심사 데이터 이상으로 원인을 추론하지 않는다.

### 3.5 화면 마무리

미입상 화면의 마지막 영역은 추가 정보 안내가 아니라 **closure** 역할을 한다.

확정 문구:
- title: `본선 심사까지 수고 많으셨습니다.`
- body: `이번 경험을 바탕으로 다음 도전에서도 좋은 결과를 기대하겠습니다.`

원칙:
- 위에서 이미 제공한 피드백을 “아래에서 확인하세요”처럼 반복 안내하지 않는다.
- 미확정 후속 프로그램/채널/혜택을 새로 발명하지 않는다.
- 감사하게 생각하라는 뉘앙스가 되지 않도록 한다.
- 짧고 존중하는 마무리로 종료한다.

---

## 4. 상태 및 Visual Tone

- 상태: `NOT_AWARDED`
- hero: neutral result treatment
- award gradient / trophy / celebration object 사용 안 함
- 일반 card 구조는 수상 화면과 일관성 유지
- layout wrapper는 투명
- semantic card만 product surface + outline 적용

---

## 5. Layout

- desktop viewport: 1440
- centered detail rail: 1200
- My Page sidebar 미사용
- long copy는 content width 내 wrap
- horizontal peer cards는 동일 높이(FILL/STRETCH)
- spacing/radius는 DS token 값과 실제 variable binding까지 적용

---

## 6. 수상 화면과의 State Delta

동일:
- navigation
- project context
- overall section order
- highlights
- panel review
- centered rail
- product card grammar

변경:
- result state/copy
- hero visual tone
- award-specific object 제거
- 후속 안내 → 미입상 closure
- 필요 시 평가 문구의 강도 조정

별도의 새로운 IA를 만들지 않는다.

---

## 7. 비포함 범위

현재 화면에는 아래 action을 추가하지 않는다.

- `심사 상세 보기`
- `최종 제출 내용 보기`

또한 근거 없이 아래 내용을 추가하지 않는다.

- 재도전 프로그램
- 별도 이메일/공식 채널 안내
- 보상/혜택
- 수상팀 발표 일정
- 점수 산식
- 미입상 사유의 임의 추론

---

## 8. 데이터 상태

실제 연동 시 최소 필요 데이터:
- application/project identity
- team identity
- final result state = `NOT_AWARDED`
- prior-stage context (TOP30)
- highlight items
- panel consensus
- reviewer comments

디자인 exploration용 예시 텍스트는 실제 심사 결과 데이터와 구분한다.
