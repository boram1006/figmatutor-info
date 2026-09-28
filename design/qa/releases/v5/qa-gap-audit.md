# v5 QA Gap Audit

기준 문서: `design/operations/prd-v5/PRD.md`

목적은 QA 수를 늘리는 것이 아니라 **PRD에 정의된 요구사항과 실제 QA 사이의 누락을 찾는 것**이다.  
PRD에 없는 동작은 QA expected로 추측하지 않는다.

## 1. 기존 QA에서 확인된 누락/오류

| 영역 | 기존 상태 | 조치 |
|---|---|---|
| A-30 변경 미반영 | '제출완료 상태 유지' 표현이 남아 있었음 | Warning `재제출 필요` 표시와 Green `제출완료` 비노출을 분리 검증 |
| A-30 제출완료/미진출 | 독립 상태 QA 부족 | 상태 + CTA 각각 추가 |
| A-30 8/8 반영 | A-31 안에서만 검증 | A-30 cross-screen 반영 추가 |
| A-31 step structure | 8개+9단계만 포괄 확인 | 순서/상태 표현/package badge를 분리 검증 |
| A-32 PDF 제한 | PDF only만 확인 | 20MB 경계값/초과 검증 추가 |
| A-32 demo URL | 항목 존재만 사실상 확인 | 입력 + 테스트 액션 실행 여부 추가 |
| A-32 저장/제출 | happy path 위주 | disabled/active/save≠submit/submitted/re-submit 상태를 분리 |
| A-32 마감 | 한 TC에 여러 요구사항 묶음 | deadline state/read-only/action 없음/문구를 분리 |
| Cross-screen | 2개 시나리오만 존재 | 8/8, submit, changed, resubmit 동기화를 각각 추가 |

## 2. 현재 PRD만으로 expected를 확정할 수 없는 항목

아래는 **QA 누락이 아니라 spec gap**이다. 제품 정책이 정해지기 전에는 QA expected를 만들지 않는다.

| Gap ID | 항목 | 현재 PRD에서 부족한 정보 |
|---|---|---|
| GAP-V5-001 | A-31 5번 신규 section | `신규 메뉴 ※ 아직 미확정`으로 명시되어 있어 최종 명칭/세부 입력 요구사항 미확정 |
| GAP-V5-002 | A-31 저장/persistence | section 수정 후 언제 저장되는지, 재진입 시 persistence 규칙이 현재 PRD에 없음 |
| GAP-V5-003 | 데모 URL validation | URL 형식 오류, 테스트 실패, 접근 불가 URL에 대한 UI/에러 처리 미정 |
| GAP-V5-004 | PDF 파일 검증 방식 | 확장자와 MIME이 불일치하는 파일을 어떻게 처리할지 미정 |
| GAP-V5-005 | 파일 업로드 실패 | 네트워크 실패/재시도/업로드 중 상태 정책 미정 |
| GAP-V5-006 | 최종 제출 실패 | API 실패, 중복 클릭, timeout 시 상태/재시도 정책 미정 |
| GAP-V5-007 | 마감 경계 | canonical timezone/서버 시각/정확한 마감 경계 처리 방식이 v5 PRD에 없음 |
| GAP-V5-008 | 마감 후 미제출 사용자 | DEADLINE_PASSED는 단일 상태이나 제출본이 전혀 없는 경우 어떤 내용을 read-only로 보여줄지 미정 |
| GAP-V5-009 | repository generic URL | provider 제한은 없지만 URL 자체의 형식 validation 여부는 명시되지 않음 |

## 3. QA 작성 원칙

- PRD의 한 문장에 여러 독립 조건이 있으면 TC를 분리한다.
- state transition은 From / Event / To가 각각 검증 가능해야 한다.
- validation은 정상값만 보지 않고 명시된 boundary와 거부 조건까지 포함한다.
- cross-screen 상태는 각 화면에서 따로 맞는지 확인한다.
- PRD가 정의하지 않은 error/retry/validation은 임의로 expected를 만들지 않고 spec gap으로 올린다.
- 디자인 생성 규칙과 서비스 QA를 섞지 않는다.
