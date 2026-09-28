# V6 A-40 Exploration Triage

기준:
- 정본 초안: `design/operations/prd-v6/PRD.md`
- 현재 Harness 생성: `spec-create-a40-judging-result.json`
- 외부 발산 참고: `stitch-1.html`, `stitch-2.html`

목적: Stitch에서 발견된 유용한 아이디어와 product-policy 발명을 분리한다.
이 문서는 정본 PRD가 아니다.

## LOCKED_CORE — 현재 PRD에서 이미 정의된 범위

- TOP30 참가자가 자기 팀의 심사 결과를 조회한다.
- 수상 여부/순위 또는 특별상/미입상 상태를 제공한다.
- 총점과 AI/휴먼 심사 요약을 제공한다.
- `심사 상세 보기 →`와 `최종 제출 내용 보기 →`가 있다.
- 결과 발표일 표기 규칙이 있다.
- 수상 상태는 결과 hero로 강조하고 미입상은 중립적으로 표현한다.
- 점수 산식/가중치는 화면에 직접 노출하지 않는 방향이 현재 초안에 있다.

## CANDIDATE_PRODUCT — 초안 발산에서 검토할 가치가 있는 기능

| Candidate | 왜 유용한가 | 필요한 제품 결정/데이터 | 현재 상태 |
|---|---|---|---|
| 시상식/후속 일정 안내 | 결과 확인 직후 사용자의 다음 행동을 알려줌. 발표 화면의 follow-up 구조와도 잘 맞음 | 일정/장소/대상/공개 시점 | REVIEW_NEEDED |
| 심사 리포트 PDF 다운로드 | 결과를 보관/공유하려는 요구를 지원할 수 있음 | 다운로드 제공 여부, 포함 범위, 개인정보/심사정보 정책 | REVIEW_NEEDED |
| 이의신청/문의 안내 | 결과 이후 문의 경로를 명확히 할 수 있음 | 접수 가능 여부, 기간, 채널 | REVIEW_NEEDED |
| 팀/프로젝트 metadata 요약 | 어떤 출품작의 결과인지 context를 강화 | 노출할 팀명/서비스명/접수번호 범위 | REVIEW_NEEDED |
| 제출자료 snapshot/preview | 결과와 심사 대상 원본의 연결을 강화 | preview 제공 필요성, A-32 viewer와 중복 여부 | REVIEW_NEEDED |
| 상금/혜택 안내 | 수상 결과의 의미와 후속 정보를 한 화면에서 전달 | 정확한 상금/혜택 source | REVIEW_NEEDED |

## DESIGN_IDEA — 제품 정책을 추가하지 않고 차용 가능한 것

- 기존 서비스 shell / 마이페이지 context를 유지한다.
- 상단에서 `어떤 프로젝트의 어떤 결과인지` context를 먼저 제공한다.
- 결과 hero 다음에 결과 summary를 두고, 그 아래 AI/Human breakdown을 둔다.
- 상세 CTA는 화면 하단/결과 내용 이후에 명확한 action group으로 묶는다.
- 후속 정보가 APPROVED될 경우 결과 본문과 분리된 notice/follow-up 영역으로 둔다.
- 수상 화면의 감정적 강조와 심사 데이터의 읽기 구조를 한 영역에 섞지 않고 계층을 분리한다.

## CONFLICT — 현재 PRD와 충돌하는 Stitch 제안

- Stitch #2의 `절대 점수 미공개, Tier/Grade만 제공`
  - 현재 V6 초안은 총점/항목별 점수 공개 방향이므로 그대로 채택 불가.
- 점수 공개/비공개를 화면 생성기가 자의적으로 변경하는 것
  - Product Decision이므로 Lock 전 변경 금지.

## UNSUPPORTED_DETAIL — source 없이 확정하면 안 되는 값

- AI 50점 + Human 50점 가중치
- 94.8/100, 상위 6.6%, TOP 2 같은 실제 결과값을 정책 예시 이상으로 취급
- 심사위원 5인
- 만장일치 추천
- 상금 1,000만원
- 채용 가산점
- 시상식 2026.10.15 / 마곡 ISC
- 이의신청 3일
- 특정 평가항목 5개와 각 점수/등급

이 값들은 사용자/공식 source가 확정하기 전에는 PRD와 Figma 정본에 넣지 않는다.

## 이번 Lock에서 사용자 판단이 필요한 후보

제품 기능 분기를 많이 만들지 않기 위해 아래 3개 묶음만 판단 대상으로 올린다.

1. **후속 일정** — 시상식/다음 일정 안내를 A-40에 포함할지
2. **결과 활용** — 심사 리포트 PDF 다운로드를 제공할지
3. **결과 문의** — 이의신청/문의 안내를 제공할지

팀/프로젝트 metadata는 화면 context용 design candidate로 두되,
노출 필드가 제품 정책에 영향을 주면 별도 확인한다.

제출자료 preview는 기존 `최종 제출 내용 보기 →`와 기능 중복 가능성이 높으므로 기본은 DEFER 후보로 둔다.
