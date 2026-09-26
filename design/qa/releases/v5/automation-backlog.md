# v5 Playwright Automation Backlog

Source: `design/qa/releases/v5/qa-cases.yaml`

## Tier 0 — smoke
- QA-V5-A30-001 — 최초 progress 7/8
- QA-V5-A31-003 — A-31 최초 7/8
- QA-V5-A31-006 — 8 content + step 9 package
- QA-V5-A32-001 — package 4종
- QA-V5-A32-004 — Save / Final Submit 분리
- QA-V5-A32-005 — Save/navigation ≠ submit
- QA-V5-A32-006 — submitted + changed
- QA-V5-A32-007 — re-submit
- QA-V5-CROSS-002 — A-30/A-32 상태 sync

## Fixture 준비 후
- QA-V5-A31-001/002/009 — 7개 승계 + 5번 신규 메뉴
- QA-V5-A31-004 — 서버 completion 7/8→8/8 반영
- QA-V5-A32-002/012 — artifact readiness
- QA-V5-A32-010 — PDF only 업로드
- QA-V5-A32-014 — 마감 후 edit/save/submit 잠금
- QA-V5-A32-015/016 — submitted unchanged / re-submit sync

## 디자인 반영 완료
- QA-V5-A30-004/005 — Warning 재제출 상태
- QA-V5-A32-015 — submitted unchanged
- QA-V5-CROSS-002 — changed-after-submit sync

## 디자인 반영 대기
- QA-V5-A32-008 — read-only report viewer modal
- QA-V5-A32-014 — DEADLINE_PASSED 전체 read-only 상태

## UI 자동화 대상 제외
- QA-V5-A31-008 — section 완료 판정식은 서버 책임
- provider-specific validation — provider 제한 없음
- v5 canonical timestamp 문자열 검증 — 별도 UI 정책 아님

## stable selector contract
```
a30-report-card-{applicationId}
a30-report-progress
a30-report-primary-state
a30-report-action-needed
a30-report-resubmit

a31-content-progress
a31-step-{n}
a31-section-{n}
a31-next
a31-back

a32-package-grid
a32-artifact-report
a32-artifact-deck
a32-artifact-demo
a32-artifact-repository
a32-save
a32-submit
a32-resubmit
a32-submit-state
a32-action-needed
a32-report-viewer
a32-report-viewer-close
```

## 실제 spec 생성 전 필요한 webapp contract
1. baseURL / actual route
2. auth/storageState
3. fixture/seed 방식
4. stable data-testid
5. deadline 테스트가 필요하면 backend time control

제품 정책 결정은 더 이상 blocker가 아니다.
