# PRD 작성 워크플로우 (기능 요청 → PRD)

이 문서는 **대략적인 기능 요청을 받아, 화면을 확정적으로 그릴 수 있는 수준의 PRD를 생성**하는 절차다.
`docs/new-screen-workflow.md`의 역방향이다: 저기가 "PRD → 화면"이라면, 여기는 "요청 → PRD".
생성한 PRD는 곧바로 new-screen-workflow의 입력으로 쓸 수 있어야 한다.

품질 기준선은 v1·v3 PRD 수준(8블록 + 상태별 UI 매트릭스)이다.

---

## 언제 쓰나

- "○○ 기능 화면 하나 만들어줘" 처럼 **기능만 대략 말했을 때**
- 새 릴리즈(버전 업데이트)에서 화면을 추가할 때, 먼저 PRD부터 뽑을 때
- 기존 PRD가 성겨서 8블록을 채워야 할 때

---

## 절차

### 0. 현재 정책 / 버전 맥락 확인
PRD를 쓰기 전에 `design/02-structure/SERVICE_EVOLUTION.md`를 확인한다.
자동화/agent가 current baseline을 선택할 때는 같은 내용의 machine-readable companion인 `design/02-structure/service-baselines.json`도 함께 사용한다.

- 같은 기능의 과거 화면이 여러 개면 **현재 baseline / legacy evidence**를 먼저 구분한다.
- 과거 PRD가 더 상세하더라도 이미 바뀐 product policy를 새 PRD의 기본값으로 복원하지 않는다.
- visual 구조는 재사용할 수 있어도 product behavior는 버전별 정책을 따른다.
- 현재 정책보다 더 새로운 변경 요청이면 해당 변경을 새 PRD에 명시하고 기존 baseline을 그대로 강제하지 않는다.

예:
- 사람 심사 → 최종 심사 화면을 current visual baseline으로 사용
- 팀빌딩 → H2의 팀 리더 검토/선발 정책이 current baseline
- 합격 발표 → 구조는 재사용하되 회차별 background/copy/theme은 variable
- 본선 최종보고서 → 1차 지원서 데이터를 승계하는 form lineage로 해석

### 1. 요청 해석 + 화면 분해
- 요청을 화면 단위로 쪼갠다. 하나의 기능이 여러 화면일 수 있다(리스트/상세/폼/모달/빈상태).
- 각 화면에 임시 ID를 부여한다(예: `B-01 심사 대시보드`). 기존 ID 체계(A-01 등)와 충돌하지 않게.

### 2. 8블록 초안 생성
`docs/new-screen-workflow.md` 1절의 8블록을 화면마다 채운 초안을 만든다:
1. 화면 개요(ID·이름·한 줄 역할)
2. 진입 경로 + 조건
3. 데이터 로딩 정책 + 예외(로딩/에러/빈상태)
4. 상태 머신(상태 + 전이 트리거)
5. 상태별 UI 매트릭스(배지색·문구·CTA·부가표시·메뉴)
6. 정렬·버튼 규칙
7. 표기 규칙(상대시간·자릿수·말줄임)
8. 레이아웃·인터랙션 세부

- 기본값은 **전 서비스 공통 관례가 아니라, 같은 user task / 같은 page archetype / 현재 정책에 맞는 가장 가까운 기존 화면**에서만 가져온다.
- 같은 task의 화면이 여러 버전에 존재하면 `SERVICE_EVOLUTION.md`의 current baseline을 먼저 적용하고, superseded/legacy 화면은 보조 evidence로만 사용한다.
- 먼저 `design/03-design-rules/generation/README.md`와 `page-archetypes.md`를 읽고 화면 성격을 정한다.
- 그 다음 동일 task의 기존 화면이 있을 때만 아래처럼 재사용한다.
  - 상태 뱃지 색/문구: 동일 workflow state가 기존에 정의돼 있을 때 재사용
  - 상대시간: 동일한 시간표기 맥락에서만 기존 규칙 재사용
  - 네비: 해당 계정/권한의 기존 GNB 구조 재사용
  - 빈/에러 상태: 동일 task의 기존 패턴이 있으면 재사용
  - 내부 스크롤 / fixed height / sticky / modal / split pane 등: **유사 화면에서 실제로 확인된 경우에만 적용**
- 다음 항목은 전역 기본값으로 발명하지 않는다.
  - 목록 고정 높이 + 내부 스크롤
  - Card/Table 선택
  - grid column 수
  - fixed/sticky action bar
  - pane 비율
  - action 개수 제한
- 기존 화면에 기능을 추가/수정하는 PRD라면 `existing-screen-modification.md`를 우선 적용하고, PRD에 언급되지 않은 구조를 변경하지 않는다.
- 채운 기본값에는 **[기본값: 근거 화면/규칙]** 형태로 출처를 표시해, 무엇을 재사용했는지 드러낸다.

### 3. 부족분만 질문 (핵심)
- 초안에서 **정말 판단이 필요한 것만** 골라 질문한다. 일률적으로 다 묻지 않는다.
- 질문 대상: 비즈니스 규칙(권한·제약·수치), 상태 전이 트리거, result/점수 정책, 도메인 문구 등
  기본값으로 못 정하는 것.
- 예: "심사 점수는 몇 점 만점인가요? (v2는 지원서 60 + 산출물 40 = 100점이었습니다)"
- 사용자가 "알아서 해"라고 해도 서비스 전역 관례를 새로 만들지 않는다. 같은 task/archetype의 기존 화면을 근거로 채우고 출처를 명시한다. 근거가 없으면 `HYPOTHESIS` 또는 미정으로 남긴다.

### 4. PRD 확정 + 저장
- 보완된 PRD를 마크다운으로 정리한다. 저장 위치:
  - 프로젝트 전체 PRD면 루트 `PRD.md`에 반영
  - 특정 릴리즈/기능 PRD면 `design/operations/prd-<release>/PRD.md` 또는 `docs/` 하위에 파일로
- **Figma 노란 박스 게시 규칙**(아래)에 따라, 이 PRD를 해당 릴리즈 프레임 맨 앞 노란 박스에도 싣는다.

### 5. 다음 단계로 인계
- 확정 PRD를 `docs/new-screen-workflow.md`의 입력으로 넘긴다:
  requirements.json 작성 → 화면 그리기(토큰/컴포넌트/인스턴스) → screens/verification.

---

## Figma 노란 박스 게시 규칙 (릴리즈마다 필수)

기존 릴리즈(v1~v5)는 각 Figma 프레임 **맨 앞(왼쪽)에 노란색 박스로 그 릴리즈의 PRD 스펙**을 실었다.
이 관례를 규칙으로 고정한다:

- **버전이 업데이트(새 릴리즈)될 때마다, 해당 릴리즈 Figma 프레임의 맨 앞에 노란색 배경 박스를 두고 그 릴리즈의 PRD를 작성한다.**
- 노란 박스에는 위 8블록(+심사/점수 계열이면 채점 규칙)을 담는다.
- 화면과 PRD가 같은 캔버스에 붙어 있어, 나중에 누구나(사람·AI) 화면과 근거를 함께 읽을 수 있게 한다.
- 이 규칙은 steering(`design-flow-harness.md`)과 `docs/new-screen-workflow.md`에도 링크되어 있다.

> 근거: v1~v5 전부 이 방식으로 작성돼 있었고, 그래서 PDF만으로 각 화면의 의도·상태·예외를 복원할 수 있었다.
> 노란 박스가 없으면 화면만 남고 "왜 이렇게 만들었는지"가 사라진다.

---

## 원칙

- 기존 토큰/컴포넌트와 **동일 task의 current baseline 화면**을 기본값의 출처로 삼는다. 단일 사례를 전 서비스 규칙으로 확대하지 않는다. 새 값은 꼭 필요할 때만, 근거와 함께.
- historical 화면의 상세한 정책이 current baseline과 충돌하면 current baseline이 우선한다.
- PRD는 화면을 **확정적으로** 그릴 수 있어야 한다. 모호하면 그리기 전에 질문으로 좁힌다.
- 생성한 PRD는 new-screen-workflow의 8블록과 1:1로 맞아야 한다(양방향 호환).
