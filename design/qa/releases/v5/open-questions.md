# v5 QA Open Questions

QA/Playwright expected result를 확정하기 전에 필요한 기획 확인 항목이다.

## Q1. 1차 지원서 → 최종보고서 section mapping

확정된 사실:
- 1차 지원서 작성 데이터 7개 section 승계
- 최종보고서 신규 content section 1개 추가
- 기존 7개 수정 가능
- 초기 completion 7/8

필요:
| 1차 지원서 source section | 최종보고서 target section | field mapping | schema 변경 여부 |
|---|---|---|---|
| TBD | TBD | TBD | TBD |

이 표가 있어야 prefill/수정/저장 Playwright를 field-level로 만들 수 있다.

## Q2. section 완료 체크 조건

v5 화면에는 완료/미완료 step state가 있지만 필수/선택 field 규칙은 별도 전달이라고 되어 있다.

확정 필요:
- section별 required fields
- empty/partial 시 completion 처리
- 저장과 completion의 관계
- inherited section이 본선 진입 시 자동 completed인지

현재 QA:
- QA-V5-A31-008 = 자동화 금지

## Q3. 발표자료 file policy

현재 자료가 충돌한다.
- package label: 발표 자료(PDF)
- upload 안내: PDF만
- 완료 예시: .pptx
- AI action: .pptx 초안 생성

확정 필요:
- upload 허용: PDF only / PDF+PPTX
- AI 생성 PPTX의 다음 단계
- 자동 등록 여부
- 변환 주체

현재 QA:
- QA-V5-A32-010 = 자동화 금지

## Q4. source repository provider

현재 자료:
- 설명은 사내 GitLab
- 화면 예시는 github.com URL

확정 필요:
- GitLab only
- GitHub/GitLab 모두 허용
- provider 무관 URL 형식만 검증

현재 QA:
- QA-V5-A32-011 = 자동화 금지

## Q5. A-31 navigation ownership

현재 흐름은 A-30 마이페이지에서 시작하지만 역복원 PRD에는 "지원하기 컨텍스트 유지"가 있다.

확정 필요:
- GNB/route상 최종보고서가 마이페이지 하위인지
- 지원하기 workflow의 연장인지
- back navigation의 기준 destination

## Q6. canonical deadline

표현: `10/16 24:00`

자동화/서버 기준에 필요한 것:
- timezone
- canonical ISO timestamp
- cutoff 판정 기준 시각
- 마감 순간 in-flight submit 처리 정책

현재 QA:
- QA-V5-A32-014 = 자동화 금지

## Q7. error/loading/empty state의 권위

v5 역복원 PRD에 공통 기본값으로 정리된 loading/error/empty가 실제 v5 원본 요구사항인지 확인 필요.

확정 전:
- 화면에서 실제 구현이 확인되면 SCREEN source로 QA 가능
- 구현/화면 근거가 없으면 INFERRED 유지
