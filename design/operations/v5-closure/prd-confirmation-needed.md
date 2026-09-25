# V5 PRD — 추가 확인 필요 항목

대상: `design/operations/prd-v5/PRD.md`

이미 확정 반영:
- 본선 진입 초기 content completion = **7/8**
- 1차 지원서 7개 content section 승계
- 승계된 7개 section 수정 가능
- 신규 content section 1개 추가
- 8 content sections 이후 package finalization = UI step 9
- 제출 후 수정 시 primary state는 **SUBMITTED 유지**
- 수정사항 미반영/재제출 필요는 secondary action-needed state

## 사용자/기획 확인이 필요한 것

### Q1. 1차 지원서 → 최종보고서 section mapping
현재 Figma에서는 5번 `신규 메뉴!!`만 미완료로 보여 신규 section 후보처럼 보인다.

확인 필요:
- 1차 지원서의 7개 section 이름
- 최종보고서 1~8 중 각 mapping
- 실제 신규 section이 `신규 메뉴!!`가 맞는지
- field schema가 변경된 section이 있는지

### Q2. section 완료 판정
- section별 required / optional field
- 일부 입력만 한 경우 완료 처리 여부
- 저장 완료와 section 완료의 관계
- inherited 7개 section은 본선 진입 즉시 completed로 간주하는지

### Q3. 발표자료 file policy
현재 화면에 동시에 존재:
- 발표 자료(PDF)
- PDF only upload 문구
- 완료 예시 파일 `.pptx`
- AI 발표자료 초안 생성 `.pptx`

확인 필요:
- 최종 제출 허용 확장자
- AI가 만든 PPTX의 다음 단계
- PDF 변환 주체
- 생성 결과 자동 등록 여부

### Q4. source repository provider
- 설명: 사내 GitLab
- 예시: github.com

확인 필요:
- GitLab only / GitHub+GitLab / provider 무관 URL

### Q5. 최종보고서 navigation ownership
- A-30은 마이페이지에서 진입
- A-31/A-32는 현재 화면상 지원하기 GNB를 유지

확인 필요:
- route/GNB상 어느 영역의 하위 workflow인지
- back action의 canonical destination

### Q6. deadline canonical timestamp
화면: `10/16 24:00`

확인 필요:
- timezone
- 서버 기준 ISO timestamp
- cutoff 순간 요청 판정 기준
- 마감 후 edit/save/submit 각각의 잠금 범위

### Q7. loading/error/empty
현재 일부 문구는 역복원 PRD의 [기본값]이다.
실제 제품 정책으로 확정할지, 구현에 있는 것만 QA할지 결정 필요.
