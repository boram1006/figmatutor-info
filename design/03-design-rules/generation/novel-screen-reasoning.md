# Novel Screen Reasoning

이 문서는 **기존 화면과 동일한 유형이 없는 새로운 기획**을 디자인할 때의 판단 절차다.

목적은 기존 화면을 억지로 복제하는 것이 아니라,
기존 서비스의 UX 원리·패턴·컴포넌트·토큰을 근거로 새로운 조합을 만드는 것이다.

## 1. 먼저 Product Decision과 Design Decision을 분리한다

### Product Decision — AI가 임의로 결정하지 않는다
예:
- 어떤 점수/순위/평균을 사용자에게 공개할지
- 어떤 권한이 어떤 정보를 볼 수 있는지
- 제출 후 수정/재제출 정책
- 상태 전이 조건
- 평가 의견을 어디까지 노출할지
- 데이터 보존/마감/제한 규칙

PRD나 확정 문서에 없으면 `OPEN_QUESTION`으로 남긴다.
일반 서비스 관례로 채우지 않는다.

### Design Decision — 근거를 조합해 AI가 판단할 수 있다
예:
- 읽기 중심인지 운영/비교 중심인지
- Card/Table/List/Workspace 중 어떤 표현이 적합한지
- 어떤 정보가 상단 summary가 되어야 하는지
- 기존 pattern 중 어떤 부분을 조합할지
- density, hierarchy, grouping, placement

## 2. 새 화면 판단 순서

1. **User / Task / Outcome**
   - 누가 사용하는가
   - 무엇을 하려고 들어오는가
   - 화면을 나갈 때 무엇을 이해하거나 완료해야 하는가

2. **Information / Action Inventory**
   - 반드시 보여야 하는 정보
   - 사용자가 수행해야 하는 action
   - 동시에 비교/참조해야 하는 정보
   - 상태·권한·예외

3. **Existing Archetype Fit Check**
   - 기존 archetype 하나가 사용자 목표와 작업 방식을 충분히 설명하는가?
   - 단순히 domain entity가 같다는 이유로 같은 archetype을 선택하지 않는다.

4. **Pattern Composition**
   기존 archetype 하나로 충분하지 않으면 여러 검증된 pattern을 조합한다.
   예:
   - Personal Status context
   - Read-only Information hierarchy
   - Evaluation Result breakdown
   - Result announcement emphasis

5. **Candidate Pattern**
   기존 pattern 조합만으로도 설명이 부족하면 신규 구조를 만든다.
   이 구조는 즉시 서비스 규칙으로 승격하지 않고
   `CANDIDATE` 또는 `HYPOTHESIS`로 기록한다.

6. **System Binding**
   구조가 결정된 뒤 existing component → token → exact geometry 순으로 연결한다.

## 3. Archetype은 분류표이지 템플릿이 아니다

- archetype은 화면 목적과 density를 결정하는 출발점이다.
- archetype의 section 순서나 panel 개수를 기계적으로 복사하지 않는다.
- primary archetype + supporting pattern 조합이 가능하다.
- 기존 archetype에 억지로 맞추기보다 사용자 task가 다른지를 먼저 본다.

## 4. Candidate Pattern 승격

새 구조가 한 번 사용됐다는 이유로 generation rule에 HIGH/MEDIUM 규칙으로 추가하지 않는다.

### Candidate
- 신규 기획 1건에서 처음 등장
- 현재 PRD에만 유효
- 다른 화면에 자동 적용 금지

### Reusable Pattern 후보
- 유사한 사용자 task에서 다시 필요해짐
- 두 사례의 공통 구조와 차이를 설명할 수 있음
- product-specific rule과 design pattern을 분리할 수 있음

### Established Pattern
- 반복 사례와 사용자 확인을 거쳐 generation rules에 정식 편입

## 5. 예시 — 지원자용 평가 결과 리포트

요청:
"제출한 지원서의 결과를 성적표처럼 지원자에게 제공"

### Product questions
기존 근거가 없다면 다음은 임의 결정하지 않는다.
- 총점 공개 여부
- 항목별 점수 공개 여부
- 순위/백분위 공개 여부
- 사람 심사/AI 심사 구분 여부
- 심사 의견 전체 공개 여부
- 탈락자에게 동일 정보 제공 여부

### Design reasoning
사용자 목표:
- 한 건의 결과를 읽고 이해

작업 특성:
- 입력/운영/다수 비교가 아님
- 개인 context
- 결과 summary + 상세 breakdown 필요

가능한 조합:
- A4 Personal Status의 개인 지원서 context
- A1 Editorial / Information의 읽기 구조
- 평가 화면의 score/result information pattern
- 결과 발표 화면의 result emphasis는 필요한 범위에서만 사용

이 조합으로 만든 최초 구조는
예: `Candidate: Applicant Result / Feedback Report`
로 기록하고 바로 A10 같은 정식 archetype으로 승격하지 않는다.

## 6. 금지

- "가장 가까운 archetype" 하나를 찾았다는 이유로 전체 layout 복사
- 기존 화면에 없는 product policy를 디자인 결정처럼 추가
- 단일 신규 화면을 즉시 전역 pattern/archetype으로 승격
- 경쟁 서비스/일반 SaaS 관례만으로 정보 공개 범위 결정
- 근거 없는 숫자 threshold, panel ratio, column count 생성
