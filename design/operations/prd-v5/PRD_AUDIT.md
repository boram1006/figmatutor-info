# v5 PRD Consistency Audit

대상: `design/operations/prd-v5/PRD.md`

목적: 역방향 복원된 v5 PRD를 현재 확정된 서비스 정책, 실제 Figma 화면, generation rule과 대조해
**확정 사실 / 충돌 / 누락 / 추론 / 확인 필요**를 분리한다.

> 중요: v5 PRD는 원본 기획서가 아니라 화면에서 역복원한 문서다.
> 따라서 이 audit은 기존 문장을 자동으로 "정답"으로 승격하지 않는다.

## 판정 기준

- **CONFIRMED**: 사용자 확인 또는 current baseline 문서로 확정
- **SCREEN_EVIDENCE**: 실제 Figma 화면에서 직접 관찰 가능
- **CONFLICT**: 확정된 current baseline 또는 다른 확정 규칙과 충돌
- **MISSING**: 구현/QA 판정에 필요한 정보가 빠짐
- **INFERRED**: 화면/기존 규칙에서 유추했으나 원본 요구사항 근거 없음
- **OPEN_QUESTION**: 사용자/기획 확인 없이는 확정 불가

---

## 1. A-30 초기 진행률 — 1/8 vs 7/8

**판정: CONFLICT**

현재 v5 PRD:
- 작성중 카드 예시: `최종 보고서 작성 진행률 1/8`

현재 확정 baseline:
- 1차 지원서의 작성 데이터 7개 섹션을 최종보고서에 승계
- 본선용 신규 content section 1개 추가
- 본선 진입 시 content completion은 **7/8**
- 승계된 7개도 수정 가능

따라서 본선 진입 직후의 기본 진행률을 `1/8`로 해석하면 안 된다.

### 수정 기준
- **content completion**: 기본 `7/8`
- 사용자가 기존 7개 섹션을 수정해도 "완료 섹션 수" 자체는 7개로 유지될 수 있음
- 신규 8번째 content section 완료 후 `8/8`
- package finalization은 별도 9번째 UI 단계

Source:
- `SERVICE_EVOLUTION.md §4`
- `service-baselines.json / application-to-final-report`

---

## 2. 제출 후 수정 상태 — 단일 "재제출 필요" 상태

**판정: CONFLICT**

현재 v5 PRD:
- `제출완료 → 재제출 필요`
- primary badge 자체를 Red `재제출 필요`로 교체

현재 generation state rule:
- 제출완료는 **primary workflow state**
- 수정사항 미반영/재제출 필요는 **secondary action-needed state**
- `SUBMITTED + CHANGED_AFTER_SUBMIT` 형태로 동시에 유지

### 수정 기준
상태 모델:
- primary: `SUBMITTED`
- secondary: `CHANGED_AFTER_SUBMIT`
- UI:
  - 제출완료 상태는 유지
  - 수정사항 미반영 warning / secondary label 표시
  - CTA는 `변경사항 다시 제출하기`

즉 "재제출 필요"를 별도의 primary workflow state로 승격하지 않는다.

Source:
- `generation/state-and-interaction.md S1, S2, S5`

---

## 3. 1차 지원서 → 최종보고서 section mapping

**판정: MISSING**

확정된 것은:
- 기존 7개 content section 승계
- 신규 content section 1개 추가
- 기존 7개 수정 가능

하지만 v5 PRD에는:
- **1차 지원서의 어느 section이 최종보고서의 어느 section으로 매핑되는지**
- 신규 section이 정확히 무엇인지

가 명시적으로 정리되어 있지 않다.

### QA/개발 영향
이 mapping 없이 아래를 확정 테스트할 수 없다.
- prefill 정확성
- section별 데이터 보존
- 기존값 수정 후 저장
- 신규 section 초기 empty 상태
- schema 변경 시 migration

### 필요 산출물
`application → final report section mapping table`

---

## 4. section 완료 판정 vs 필수/선택 규칙 스킵

**판정: CONFLICT / MISSING**

현재 v5 PRD:
- "필수 입력 충족 시 완료(✔)로 전환" [기본값]
- 동시에 "항목별 필수/선택 필드 규칙은 스킵 · 별도 전달"

필수 규칙이 없으면 완료 판정식을 확정할 수 없다.

### 처리
필수/선택 schema를 받기 전까지:
- 완료 체크 조건을 확정 product rule로 취급하지 않는다.
- QA의 expected result로 "필수 입력 충족 시 체크"를 자동 생성하지 않는다.
- 관련 TC는 `OPEN_QUESTION` 또는 `INFERRED`로 둔다.

---

## 5. 발표자료 형식

**판정: CONFLICT / OPEN_QUESTION**

현재 문서에 동시에 존재:
- 구성요소 이름: `발표 자료(PDF)`
- 업로드: `PDF 파일만 업로드 가능`
- 완료 예시 파일: `...v1.2.pptx`
- AI 액션: `발표 자료 초안 생성 (.pptx)`

확정이 필요한 정책:
1. AI가 PPTX 초안을 생성하고 사용자가 PDF로 변환한 뒤 업로드하는가?
2. PPTX와 PDF 모두 등록 가능한가?
3. 생성된 PPTX가 별도 변환 없이 구성요소 2에 바로 연결되는가?

확정 전 자동화 금지.

---

## 6. 소스코드 저장소 provider

**판정: CONFLICT / OPEN_QUESTION**

현재 문서:
- 설명: `사내 GitLab`
- 예시 URL: `github.com/...`

확정 필요:
- GitLab only
- GitHub/GitLab 모두 허용
- URL 형식만 검증하며 provider 제한 없음

확정 전 provider-specific validation QA를 만들지 않는다.

---

## 7. A-31 navigation context

**판정: OPEN_QUESTION**

현재 문서:
- A-30 마이페이지 → 이어 작성
- A-31에서는 "상단 GNB에서 지원하기 컨텍스트 유지"

최종보고서가:
- 마이페이지의 하위 workflow인지
- 지원하기 정보구조를 재사용하는지

명확한 navigation 기준이 필요하다.

화면에 보이는 GNB는 `SCREEN_EVIDENCE`로 검증 가능하지만,
정보구조 의도 자체는 화면만으로 확정하지 않는다.

---

## 8. 마감 시각 10/16 24:00

**판정: MISSING / OPEN_QUESTION**

사람에게는 이해되지만 자동화/백엔드 기준에는 timezone 포함 canonical timestamp가 필요하다.

예:
- `2026-10-17T00:00:00+09:00`

확정 필요:
- 기준 timezone
- 정확한 cutoff timestamp
- cutoff 순간 요청 처리 기준(서버 수신 시각 등)이 별도 존재하는지

---

## 9. 화면에서 복원한 기본값

**판정: INFERRED**

아래처럼 `[기본값]`으로 추가된 항목은 원본 PRD와 같은 권위로 사용하지 않는다.

예:
- loading / error / empty state
- 정렬: 진행 중 우선
- 스텝 임의 점프
- 제출 gate 일부
- 1차 합격 발표 → 본선 작성중 전환의 정확한 backend trigger

QA 생성 시:
- 화면에서 직접 확인 가능하면 `SCREEN`
- current project rule로 별도 확정됐으면 `CONFIRMED_PROJECT_RULE`
- 아니면 `INFERRED`
- `INFERRED`는 Playwright 자동화 대상에서 제외

---

## QA 생성 전 확정 체크

### 지금 바로 QA source로 사용 가능
- 7개 section 승계 + 신규 1개 + 초기 7/8
- 기존 7개 수정 가능
- 8 content sections 이후 package finalization
- 실제 화면에 존재하는 label / card / button / layout
- Save와 Submit 분리
- 제출 후 변경은 자동 반영하지 않고 재제출 action 필요
  - 단, primary 상태는 SUBMITTED 유지

### 확인 전 자동화 금지
- section 완료 판정식
- 발표자료 허용 file type
- source repository provider
- navigation ownership
- canonical deadline timestamp
- 역복원 PRD의 [기본값] 항목

---

## 다음 조치

1. 이 audit에서 CONFIRMED conflict를 v5 PRD에 수정
2. OPEN_QUESTION 5개를 사용자 확인
3. source provenance를 기준으로 v5 QA case 생성
4. automationCandidate=true인 케이스만 Playwright backlog로 전달
