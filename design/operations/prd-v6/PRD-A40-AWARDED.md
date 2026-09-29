# A-40 PRD — 심사 결과 / 수상

> Release: v6
> Screen ID: A-40
> State: `AWARDED_RANK` / 수상
> Audience: 본선 TOP30 참가자
> Entry: 마이페이지 → 내 지원 현황 → 선택한 지원서 → 심사 결과 보기
> Status: current implementation-aligned PRD

---

## 1. 목적

본선 심사가 완료된 참가자가 자신의 **최종 수상 결과**를 즉시 확인하고,
심사 과정에서 높게 평가된 핵심 강점과 심사위원 평가를 확인한다.

이 화면의 첫 번째 사용자 질문은:

> “우리 팀이 수상했는가? 어떤 결과인가?”

첫 viewport에서 해석 없이 답이 보여야 한다.

---

## 2. 진입 및 Navigation

- 진입 경로: `마이페이지 → 내 지원 현황 → 선택한 지원서 → 심사 결과 보기`
- A-40은 My Page hub가 아니라 **선택된 지원 건의 child/detail 화면**이다.
- My Page sidebar는 노출하지 않는다.
- 상단에 `← 내 지원 현황으로 돌아가기`를 제공한다.
- 사용자는 결과 화면에서 바로 상위 지원 현황 목록으로 돌아갈 수 있어야 한다.

---

## 3. 화면 정보 구조

### 3.1 지원 프로젝트 Context

표시:
- 프로젝트명
- 팀명
- 팀장/구성원 요약
- 트랙

목적:
- 사용자가 어떤 지원 건의 결과를 보고 있는지 명확히 한다.

### 3.2 수상 결과 Hero

필수 정보:
- 수상 상태
- 순위
- 상 이름
- 결과를 명확히 전달하는 headline
- 짧은 설명

현재 AWARDED_RANK 예시:
- headline: `축하합니다! CodeReview Team이 본선 2위(최우수상)에 입상했습니다.`
- result object:
  - `FINAL RESULT`
  - `본선 2위`
  - `최우수상`

원칙:
- 첫 viewport에서 수상 여부와 결과가 즉시 식별되어야 한다.
- 수상 결과 화면은 bounded celebration treatment를 사용할 수 있다.
- gradient/tint 등 표현은 product semantic token 범위 안에서 적용한다.

### 3.3 핵심 강점

심사 과정에서 공통적으로 높게 평가된 핵심 강점을 요약한다.

현재 구조:
- section title
- 동일 위계의 3개 highlight card
- 각 card:
  - label/icon
  - 강점 제목
  - 짧은 설명
  - 보조 evidence/keyword

원칙:
- 3개 card는 같은 row에서 동일 높이
- 내용량이 달라도 peer card height는 동일
- 구체적인 강점/문구는 실제 심사 데이터에 따라 달라질 수 있다

### 3.4 심사위원 종합 평가

표시:
- 패널 총평 1개
- 심사위원별 주요 의견 3개

목적:
- 단순 수상 결과 외에 “왜 이런 평가를 받았는가”를 이해할 수 있게 한다.

원칙:
- 총평은 주요 의견보다 상위 위계
- reviewer card는 동일 row에서 동일 높이
- 심사위원 이름/직책/개별 코멘트는 실제 데이터에 따라 구성
- 화면용 문구를 근거 없이 사실 데이터로 승격하지 않는다

### 3.5 수상 후속 안내

수상자에게 필요한 후속 정보 영역.

현재 화면의 구조적 의도:
- 시상식/오프라인 네트워킹 등 수상 후속 안내를 위한 단일 band

정책:
- 정확한 일정/장소/연락 채널은 확정 데이터가 있을 때만 노출
- 일정/장소가 미정이면 구체 값을 발명하지 않는다

---

## 4. 상태 및 Visual Tone

- 상태: `AWARDED_RANK`
- hero: celebration
- 일반 content 영역: product 기본 surface/card grammar 유지
- layout wrapper는 투명
- semantic card만 product surface + outline
- 외부 Stitch styling을 그대로 복제하지 않는다

---

## 5. Layout

- desktop viewport: 1440
- centered detail rail: 1200
- 좌우 균형 margin 유지
- predecessor My Page sidebar 미사용
- long copy는 content width 안에서 wrap
- spacing/radius는 기존 DS token 값 + 실제 Figma variable binding 사용

---

## 6. 비포함 범위

현재 화면에는 아래 action을 추가하지 않는다.

- `심사 상세 보기`
- `최종 제출 내용 보기`

또한 아래 내용은 확정 데이터 없이는 표시하지 않는다.

- 상금
- 시상식 정확한 일시/장소
- 별도 혜택
- 점수 산식/가중치
- 신규 다운로드/공유 기능

---

## 7. 데이터 상태

실제 연동 시 최소 필요 데이터:
- application/project identity
- team identity
- final result state
- rank
- award name
- highlight items
- panel consensus
- reviewer comments
- approved follow-up information

디자인 exploration에 사용된 예시 텍스트는 제품 정책/실데이터와 구분한다.
