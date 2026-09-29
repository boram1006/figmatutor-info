# A-40 PRD — 심사 결과

> Release: v6
> Screen ID: A-40
> Audience: 본선 TOP30 참가자
> Entry: 마이페이지 → 내 지원 현황 → 선택한 지원서 → 심사 결과 보기
> Supported states: `AWARDED_RANK`, `AWARDED_SPECIAL`, `NOT_AWARDED`
> Status: current implementation-aligned PRD

---

## 1. 목적

본선 심사가 완료된 참가자가 자신의 **최종 심사 결과를 첫 화면에서 즉시 확인**하고,
심사 과정에서 높게 평가된 핵심 강점과 심사위원 평가를 확인한다.

이 화면이 첫 번째로 답해야 하는 질문은:

> “그래서 우리 팀의 최종 결과가 무엇인가?”

수상/미입상 여부는 첫 viewport에서 해석 없이 명확해야 한다.

---

## 2. 진입 및 Navigation

- 진입 경로: `마이페이지 → 내 지원 현황 → 선택한 지원서 → 심사 결과 보기`
- A-40은 My Page hub가 아니라 **선택된 지원 건의 child/detail 화면**이다.
- My Page sidebar는 노출하지 않는다.
- 상단에 `← 내 지원 현황으로 돌아가기`를 제공한다.
- 결과 발표 전에는 A-40 진입을 기본적으로 노출하지 않는다.

---

## 3. 공통 정보 구조

### 3.1 지원 프로젝트 Context

표시:
- 프로젝트명
- 팀명
- 팀장/구성원 요약
- 트랙
- 필요 시 이전 단계 성과(예: 본선 진출 TOP30)

이전 단계 성과는 현재 최종 결과보다 더 강하게 표현하지 않는다.

### 3.2 최종 결과 Hero

필수:
- 결과 상태 tag
- 결과를 직접 설명하는 headline
- 짧은 보조 설명
- final result object

원칙:
- `심사가 완료되었습니다`처럼 일반 상태만 headline으로 사용하지 않는다.
- 실제 결과가 첫 viewport에서 바로 이해되어야 한다.
- 상태에 따라 visual tone만 달라지며 별도 IA를 만들지 않는다.

### 3.3 핵심 강점

심사 과정에서 확인된 주요 강점을 3개 내외로 요약한다.

각 card:
- label/icon
- 강점 제목
- 설명
- 보조 evidence/keyword

원칙:
- 동일 row의 peer card는 동일 높이
- 구체 문구는 실제 심사 데이터에 따라 달라질 수 있다
- 디자인 exploration용 문구를 실제 평가 데이터로 간주하지 않는다

### 3.4 심사위원 종합 평가

표시:
- 패널 총평
- 심사위원별 주요 평가

원칙:
- 패널 총평이 개별 reviewer comment보다 상위 위계
- reviewer card는 동일 row에서 동일 높이
- 실제 심사 데이터 이상으로 수상/미입상 원인을 추론하지 않는다

### 3.5 화면 마무리

상태에 맞는 후속 정보 또는 closure를 제공한다.

원칙:
- 본문에서 이미 전달한 내용을 다시 반복하지 않는다.
- 근거 없는 일정/혜택/프로그램/전달 채널을 새로 만들지 않는다.

---

## 4. 상태별 UI

### 4.1 AWARDED_RANK

목적:
- 수상 여부, 순위, 상 이름을 첫 viewport에서 명확히 전달

예시:
- headline: `축하합니다! CodeReview Team이 본선 2위(최우수상)에 입상했습니다.`
- result object:
  - `FINAL RESULT`
  - `본선 2위`
  - `최우수상`

Visual:
- bounded celebration treatment 허용
- gradient/tint는 product semantic/award token 사용
- 주변 기능 영역은 기본 product grammar 유지

마무리:
- 수상 후 실제 확정된 후속 안내가 있을 때 제공
- 정확한 일정/장소/연락 채널은 확정 데이터가 있을 때만 노출

### 4.2 AWARDED_SPECIAL

- 기본 구조는 `AWARDED_RANK`와 동일
- 순위 대신 확정된 특별상 이름을 표시
- 별도의 IA를 만들지 않는다

### 4.3 NOT_AWARDED

목적:
- 미입상 결과를 명확하게 전달하되 불필요하게 실패를 강조하지 않는다

필수 표현:
- state tag: `본선 미입상`
- headline: `이번 본선에서는 수상팀으로 선정되지 않았습니다.`
- result object:
  - `FINAL RESULT`
  - `수상 미선정`
  - `본선 진출 TOP 30`은 보조 context

Visual:
- celebration gradient / trophy / award object 사용 안 함
- neutral result treatment 사용
- card/content 구조는 수상 화면과 동일한 product grammar 유지

마무리 확정 문구:
- title: `본선 심사까지 수고 많으셨습니다.`
- body: `이번 경험을 바탕으로 다음 도전에서도 좋은 결과를 기대하겠습니다.`

주의:
- `탈락`, `실패`처럼 필요 이상으로 강한 표현은 사용하지 않는다.
- `TOP30`은 이전 단계 성과이며 최종 결과를 대체하지 않는다.
- 미입상 사유를 임의로 추론하지 않는다.

---

## 5. 상태 간 공통/차이

공통:
- navigation
- project context
- section order
- 핵심 강점
- 심사위원 종합 평가
- centered rail
- product card grammar

상태별 변경:
- result tag/headline
- hero visual tone
- result object
- final closure/follow-up

상태가 달라져도 별도 새로운 레이아웃을 만들지 않는다.

---

## 6. Layout / Design System

- desktop viewport: 1440
- centered detail rail: 1200
- My Page sidebar 미사용
- layout wrapper는 투명
- semantic card만 product surface + outline
- long copy는 content width 안에서 wrap
- 동일 row peer card는 vertical FILL/STRETCH로 동일 높이
- spacing/radius는 기존 DS token 값뿐 아니라 실제 Figma variable binding까지 적용
- 외부 Stitch/HTML의 layout 구조는 참고하되 font/color/radius/shadow는 product Figma grammar로 변환

---

## 7. 비포함 범위

현재 A-40에는 아래 action을 추가하지 않는다.

- `심사 상세 보기`
- `최종 제출 내용 보기`

또한 확정 근거 없이 아래 내용을 추가하지 않는다.

- 상금/혜택
- 정확한 시상식 일시/장소
- 재도전 프로그램
- 별도 이메일/공식 채널 안내
- 점수 산식/가중치
- 다운로드/공유 기능
- 미입상 원인의 임의 추론

---

## 8. 데이터

공통 최소 데이터:
- application/project identity
- team identity
- final result state
- highlight items
- panel consensus
- reviewer comments

상태별:
- AWARDED_RANK: rank, award name
- AWARDED_SPECIAL: special award name
- NOT_AWARDED: final result = not awarded, prior-stage context if needed
- follow-up/closure data: 확정된 경우에만 사용

디자인 exploration에 사용한 예시 텍스트는 실제 제품 정책/실데이터와 구분한다.
