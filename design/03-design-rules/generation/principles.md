# Design Principles

## P1. 기능적 위계가 장식보다 우선한다
**Confidence: HIGH**

일반 서비스 화면은 구조, 정렬, 여백, 타이포그래피, 얇은 border/surface 차이로 위계를 만든다.
강한 장식, 큰 shadow, 과도한 컬러 surface를 기본값으로 사용하지 않는다.

**Do**
- 먼저 영역의 역할과 정보 관계를 정한다.
- 색상은 행동, 상태, 예외를 구분하는 데 우선 사용한다.
- 같은 레벨의 콘텐츠는 시각적 무게를 비슷하게 유지한다.

**Do not**
- 중요도를 만들기 위해 모든 section을 별도 Card로 감싼다.
- 기능 화면에 장식적 gradient, glow, glass effect를 임의 추가한다.

Evidence: 공통 페이지, 지원하기, AI 심사, 최종보고서, 심사 화면.

---

## P2. 정보 밀도는 화면 목적에 따라 달라진다
**Confidence: HIGH**

모든 화면을 "여백이 넓고 단순한 UI"로 만들지 않는다.

- 읽기/홍보/안내 화면: 낮은~중간 밀도
- 상태 확인/목록 화면: 중간 밀도
- 운영/심사/비교 화면: 높은 밀도

**Rule**
IF 사용자가 한 화면에서 여러 항목을 비교하거나 반복 처리해야 한다  
THEN 정보량을 줄이기보다 구조화하여 동시에 노출한다.

Evidence: AI 심사 대시보드, 최종 심사, 1차 심사 최종 검토.

---

## P3. 작업에 필요한 컨텍스트는 가능한 한 유지한다
**Confidence: HIGH**

심사처럼 "대상 확인 → 근거 확인 → 평가 → 다음 대상"이 반복되는 작업에서는
필요한 정보를 별도 페이지로 계속 이동시키지 않는다.

**Rule**
IF 작업 중 다른 정보의 지속적 참조가 필요하다  
THEN list/sidebar + primary content + action/evaluation panel처럼 화면을 분할하여 컨텍스트를 유지한다.

Evidence: 심사 페이지, 최종 심사 페이지, AI 심사 결과 상세.

---

## P4. Card는 장식이 아니라 독립된 entity/task 단위다
**Confidence: HIGH**

Card는 다음 중 하나를 만족할 때 사용한다.

- 각 항목이 독립적인 상태를 가진다.
- 각 항목에 독립적인 action이 있다.
- 항목 내부에 서로 다른 종류의 정보가 함께 묶여야 한다.
- summary/KPI처럼 하나의 의미 단위를 빠르게 읽어야 한다.

동일 schema의 여러 행을 비교하는 것이 핵심이면 Table을 우선한다.

Evidence: 팀빌딩 카드, 내 지원 현황, KPI 카드, 최종 제출 패키지.

---

## P5. 상태는 텍스트만 바꾸지 않고 UI 전체 행동을 바꾼다
**Confidence: HIGH**

상태 변화는 badge 색상만 바꾸는 것이 아니다.

상태에 따라:
- 표시 metadata
- 안내 문구
- progress
- 가능한 CTA
- 편집 가능 여부
- warning/보조 상태

가 함께 달라진다.

Evidence: 지원서 DRAFT/SUBMITTED/REVIEWING/REVIEWED, 최종보고서 작성/제출/재제출 상태.

---

## P6. 명시적 완료 이벤트를 존중한다
**Confidence: HIGH**

작성 저장과 최종 제출은 다른 상태다.
수정했다고 자동으로 최종본이 갱신되는 것으로 설계하지 않는다.

**Rule**
IF 업무에 최종 제출/확정이라는 명시적 완료 이벤트가 존재한다  
THEN draft/save 상태와 final submit 상태를 시각적·행동적으로 분리한다.

Evidence: 지원하기, 최종보고서 제출, 심사 최종 확정.

---

## P7. 긴 작업은 진행 위치를 지속적으로 보여준다
**Confidence: HIGH**

다단계 작성 업무는 현재 단계와 전체 진행 구조를 동시에 보여준다.

**Rule**
IF 여러 section을 순차적으로 작성하는 작업이다  
THEN persistent step navigation + current section workspace를 우선한다.

Evidence: 지원서 8개 section, 최종보고서 9개 step.

---

## P8. 읽기 화면과 작업 화면의 폭 전략이 다르다
**Confidence: HIGH**

- 읽기/공지/FAQ/홍보: 중앙 정렬된 제한적 content width와 넓은 외부 여백
- 운영/심사/비교: viewport를 적극 사용하여 작업 공간 확보

**Do not**
전역 max-width 하나를 모든 page archetype에 강제하지 않는다.

Evidence: 공지/FAQ vs AI 심사/최종 심사.

---

## P9. Red는 기능 화면의 핵심 행동/상태 강조에 사용한다
**Confidence: HIGH**

일반 기능 UI에서 Red는 primary action, active state, attention-needed 상태를 강조한다.
완료/심사중/비활성 상태는 별도 semantic state color를 사용한다.

**Do**
한 local task scope 안에서 가장 중요한 행동에 가장 강한 Red emphasis를 준다.

**Do not**
정보성 Card 전체를 이유 없이 Red surface로 채운다.

Evidence: 지원하기, 팀빌딩, 심사, 최종보고서.

---

## P10. 이벤트성 화면은 별도의 표현 모드를 허용한다
**Confidence: HIGH**

합격 발표/축하/캠페인 화면에서는 dark background, gold/yellow accent,
큰 headline, 장식 이미지처럼 감정적 표현을 강화할 수 있다.

이 스타일을 일반 업무 화면의 기본 스타일로 확장하지 않는다.

Evidence: 하반기 해커톤 1차 심사 합격 발표 화면.

---

## P11. 페이지 내부의 반복 작업 흐름을 우선 최적화한다
**Confidence: MEDIUM**

작업 화면은 "한 번 볼 때 예쁜 화면"보다 반복 수행 효율을 우선하는 경향이 있다.

예:
- 다음 지원서 이동
- inline 점수 수정
- 상태/진행률의 지속 노출
- 정렬/필터와 데이터 목록의 근접 배치

새로운 운영 화면에서도 반복 빈도가 높은 행동을 화면 구조의 중심으로 둔다.