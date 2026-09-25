# Service Evolution & Current Baseline

이 문서는 LGE AX Hackathon 웹서비스의 **버전별 정책 변화와 앞으로의 기본 기준**을 설명한다.

Figma/PRD에는 과거 정책과 현재 정책이 함께 남아 있다.
새 기획·화면 생성 시 단순히 "같은 기능의 기존 화면"을 찾는 것만으로는 부족하다.
먼저 이 문서에서 **현재 기준인지, 과거 참고인지**를 확인한다.

## 적용 원칙

1. **현재 운영 의도(Current Baseline)**가 과거 화면/PRD보다 우선한다.
2. 과거 화면은 구조·컴포넌트·상태 표현의 evidence로 사용할 수 있지만,
   이미 변경된 product policy를 새 화면에 다시 가져오지 않는다.
3. 같은 기능이 반복되며 디자인이 개선된 경우:
   - 최신/향후 기준 화면 = 생성·수정의 기본 visual reference
   - 이전 화면 = legacy evidence
4. 캠페인성 화면은 구조와 시즌/회차별 visual treatment를 분리한다.
5. PRD 작성 전 이 문서의 관련 항목을 확인하고,
   정책이 다시 바뀌는 요청이면 기존 current baseline을 그대로 적용하지 말고 새 정책을 명시한다.

---

## 1. 사람 심사: 1차 심사 → 최종 심사 디자인 진화

### 기능 관계

1차 심사와 최종 심사는 핵심 work loop가 같다.

`대상 선택 → 지원서/산출물 확인 → 점수 입력 → 저장 → 다음 대상`

두 화면의 기능적 목적은 동일 계열이지만,
서비스를 업데이트하면서 최종 심사 화면 쪽으로 UI/레이아웃이 개선되었다.

### 현재 기준

- **앞으로의 사람 심사 화면 디자인 기준은 최종 심사 화면을 우선한다.**
- 1차 심사 화면은 동일 work loop의 과거 구현/legacy evidence로 본다.
- 새로운 심사 화면을 만들 때 1차/최종 화면의 geometry를 평균내거나
  두 화면을 동등한 current reference로 취급하지 않는다.
- 1차 심사에만 존재하는 정책/기능이 별도로 필요하면 그 부분만 명시적으로 재사용한다.

### Figma evidence

- legacy: `RV-01_first-review`
- current visual baseline: `RV-02_final-review-unfolded`

---

## 2. 합격자 발표: H1/H2 공통 구조 + 회차별 테마

H1은 상반기, H2는 하반기 해커톤을 의미한다.

### 안정적으로 유지되는 것

- 결과 발표 hero
- 합격/선정 메시지
- 합격팀 card 구조
- 후속 일정/행동 안내
- 필요 시 countdown/다음 단계 안내

합격팀 card의 기본 디자인 구조는 H1/H2에서 동일 계열로 유지한다.

### 회차마다 달라질 수 있는 것

- 배경 visual
- campaign color/theme
- hero copy
- 설명 텍스트
- 행사 컨셉에 따른 decorative treatment
- 합격팀 수/노출량에 따른 페이지 길이

따라서 **dark/gold는 Announcement Pattern의 고정 규칙이 아니다.**
해당 회차의 컨셉에서 사용된 campaign skin 중 하나다.

새 발표 화면은 기존 구조를 재사용하되,
배경/문구/색상은 해당 회차의 기획 컨셉을 입력으로 받아 변형한다.

### Figma evidence

- H1: `H-02_first-round-result_H1`
- H2: `H-02_first-round-result_H2`

---

## 3. 팀빌딩: H1 선착순 → H2 팀장 선발

팀빌딩의 큰 화면 목적은 동일하다.

- 본선/참여 팀 탐색
- 모집 포지션 확인
- 포지션 지원
- 지원 상태 확인

하지만 **선발 정책은 변경되었다.**

### H1 / 과거 정책

- 선착순 중심
- 과거 화면의 지원/취소/모집완료 상태는 이 정책 맥락에서 해석한다.

### H2 / 현재 기준

- 사용자가 모집 포지션에 지원
- **지원자는 각 팀 리더의 검토를 통해 선정**
- 따라서 `지원하기`는 즉시 팀 합류를 의미하지 않는다.
- 지원 상태와 최종 선발 상태를 분리해서 해석해야 한다.

현재 확정된 범위를 넘어
동시 지원 가능 개수, 팀장 심사 상세 UI, 거절/대기 상태 등은 임의로 발명하지 않는다.
추가 기획 시 PRD에서 확정한다.

### 현재 디자인 기준

새 팀빌딩 화면은 H2 화면을 우선 visual reference로 사용한다.
H1 화면은 과거 정책을 이해하거나 반복 visual 구조를 확인하는 보조 evidence다.

### H2 Figma evidence

- page: `TB-01_team-list__recruiting_H2`
- current card example: `card_1`
- 화면 안내문에도 "지원자는 각 팀 리더의 검토를 통해 선정" 정책이 명시되어 있다.

---

## 4. 지원서 → 본선 최종보고서: 별도 폼이 아니라 이어지는 정보 계보

### H1

상반기에는 현재의 "1차 지원서 작성" 단계가 없었다.

### H2: 1차 지원서 도입

하반기에는 먼저 1차 지원서를 받고,
심사를 통과한 팀만 본선으로 진출하는 구조가 추가되었다.

repo에서는 이 흐름이 주로 v3 `지원하기_NEW` 자산으로 나타난다.

1차 지원서 UI는 8-step으로 표현되지만,
제품 관점에서는 다음처럼 해석한다.

- **작성 데이터 섹션 7개**
- 마지막 `검토 및 제출` step

즉 마지막 step은 새로운 도메인 데이터 섹션이라기보다
1차 지원서의 finalization 단계다.

### 본선 최종보고서

본선 진출자가 작성하는 최종보고서는
1차 지원서와 완전히 별개의 새 양식이 아니다.

- 1차 지원서에서 작성한 **7개 데이터 섹션을 그대로 승계**
- 본선용 **새 데이터 섹션 1개 추가**
- 결과적으로 최종보고서의 작성 대상은 **8개 데이터 섹션**
- 기존 7개는 진입 시 이미 채워져 있으므로 초기 completion은 **7 / 8**
- 승계된 7개 섹션도 본선 단계에서 **수정 가능**
- 8개 데이터 섹션 이후 최종 산출물 package 제출 단계가 별도로 존재

Figma에서 package 화면은 `SECTION 9 / 9`로 표현된다.
따라서 아래 두 숫자를 혼동하지 않는다.

- **content completion:** 7 / 8 → 8 / 8
- **overall UI workflow:** 8 content sections + 9번째 final package/finalization step

### 설계 의미

- 최종보고서 진입 시 빈 폼을 새로 만들지 않는다.
- 1차 지원서 데이터를 prefill한다.
- 기존 입력값은 read-only가 아니라 editable이다.
- 신규 섹션은 미완료 상태로 시작한다.
- progress는 inherited completion을 반영한다.
- 기존 1차 지원서와 최종보고서의 공통 구조는 같은 form lineage로 취급한다.

### Figma evidence

- 1차 지원서: `AP-01_application-form`
- 최종보고서: `A-31_report-step-form`
- 최종 package: `A-32_submission-package`

---

## 5. 새 기획에서의 우선순위

새 요구사항을 해석할 때:

1. 이 문서의 **Current Baseline**
2. 해당 기능의 최신 확정 PRD
3. 최신/current Figma reference
4. 같은 task의 과거 PRD/화면
5. 일반적인 UX 추론

순서로 근거를 사용한다.

과거 화면이 더 상세하더라도,
정책이 변경된 영역에서는 과거 product behavior를 복원하지 않는다.

예:
- 새 심사 화면 → 최종 심사 visual baseline
- 새 팀빌딩 → 팀장 선발 정책
- 새 합격 발표 → 공통 발표 구조 + 회차별 campaign skin
- 본선 최종보고서 → 1차 지원서 데이터 승계 + 추가 섹션
