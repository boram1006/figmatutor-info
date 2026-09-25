# v5 QA Open Questions

2026-09-25 기준 **제품 정책상 blocking open question 없음**.

확정된 사항:
- 7개 승계 + 5번 신규 메뉴 추가
- completion 판정은 서버 책임
- AI PPTX 생성 / PDF only 등록
- repository provider 제한 없음
- 마이페이지 진입 + A-31 지원하기 컨텍스트 정상
- 기존 마감 정의 사용
- 마감 후 edit/save/submit 전부 잠금
- loading/error는 공통 양식 사용

남은 것은 QA blocker가 아닌 화면 slug 승인뿐이다:
- `A-30_final-report-status`
- `A-31_final-report-step-form`
- `A-32_final-report-package`

Playwright 구현 전 필요한 것은 기획 open question이 아니라 **webapp 실행 contract**다:
- baseURL/route
- auth/storageState
- 상태별 fixture/seed
- stable `data-testid`
- 필요 시 test clock/backend time control
