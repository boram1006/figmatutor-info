# V5 QA List

정본: `qa-cases.yaml`  
누락/미정 감사: `qa-gap-audit.md`

현재 정본 PRD 기준 **45개 TC**로 재구성했다.

| 영역 | TC 수 | 핵심 |
|---|---:|---|
| A-30 | 8 | 7/8, 8/8, 작성/제출/재제출필요/미진출, CTA, 안내 |
| A-31 | 8 | 승계, 수정 가능, 7→8, step 순서/상태, package 진입 |
| A-32 | 24 | 4종, viewer, PPTX, PDF/20MB, URL, 저장, 제출, 수정, 재제출, 마감 |
| Cross-screen | 5 | completion/submission/change/resubmit 동기화 |
| **합계** | **45** | |

## 이번 재작성에서 추가된 핵심

- A-30 변경 미반영 상태에서 Green `제출완료` 비노출을 별도 QA
- A-30 제출완료/미진출/8/8 상태 분리
- A-31 step structure와 상태 표현 분리
- PDF 20MB 경계값과 초과 케이스 추가
- 저장 가능 여부와 저장≠제출 분리
- 제출 버튼 disabled/active 분리
- 마감 후 state/read-only/action 없음/문구를 각각 분리
- cross-screen 8/8, submit, changed, resubmit을 각각 검증

## Spec gap

PRD에 없는 동작은 QA에서 추측하지 않는다. 현재 미정 항목은 `qa-gap-audit.md`에 따로 기록했다.
