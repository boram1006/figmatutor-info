# v5 PRD Consistency Audit — Resolved

대상: `design/operations/prd-v5/PRD.md`
기준일: 2026-09-25

초기 역복원 PRD에서 발견된 충돌/미확정 항목은 사용자 결정으로 모두 해소됐다.

| 항목 | 최종 판정 | 확정 내용 |
|---|---|---|
| A-30 초기 progress | RESOLVED | 1/8이 아니라 **7/8** |
| 제출 후 수정 상태 | RESOLVED | primary=SUBMITTED 유지 + secondary Warning `재제출 필요` |
| 1차→최종보고서 mapping | RESOLVED | 7개 그대로 승계 + **5번 신규 메뉴** 추가 |
| section 완료 판정 | RESOLVED | 서버 판정, UI는 결과만 표시 |
| 발표자료 형식 | RESOLVED | AI 생성=.pptx 수정용 / 등록=PDF only |
| 저장소 provider | RESOLVED | 링크 입력만, provider 제한/검증 없음 |
| navigation ownership | RESOLVED | 마이페이지 진입 + A-31 지원하기 컨텍스트 정상 |
| deadline | RESOLVED | 기존 서비스 마감 정의 사용, v5에 새 timestamp 노출 없음 |
| 마감 후 lock | RESOLVED | edit/save/submit 3종 전부 잠금, 전체 read-only |
| loading/error/empty | RESOLVED | loading/error는 공통 양식, empty는 필요 시만 추가 |

## 디자인 영향

- A-30 progress 7/8 수정
- A-30 재제출 Warning semantic 정합화
- A-32 submitted unchanged / changed-after-submit / deadline-passed 상태 필요
- final report read-only viewer modal 필요

## 자동화 영향

더 이상 product decision 때문에 막혀야 하는 항목:
- section completion UI 판정식 테스트: **제외** (서버 책임)
- provider-specific validation: **제외** (provider 제한 없음)
- canonical timestamp 문자열 검증: **제외** (v5 UI 정책 아님)

자동화 구현 자체에는 별도로 webapp route/auth/fixture/stable selector contract가 필요하다.

## 남은 non-blocking 항목

- 화면 slug 최종 승인:
  - `A-30_final-report-status`
  - `A-31_final-report-step-form`
  - `A-32_final-report-package`
