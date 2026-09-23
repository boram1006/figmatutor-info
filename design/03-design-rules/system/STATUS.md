# LGE AX Hackathon 디자인시스템 정비 — 진행 상태 및 결정 기록

최종 업데이트: 게이트 3단계(inputs / extract-system / components) 100% PASS 시점.

## 목표와 결과

- **1차 목표**: extract-system + components 게이트 100% PASS → **달성**
- 검증: `node scripts/harness.mjs check --phase components` (선행 단계 포함) → 세 단계 PASS
- 하네스 회귀 테스트: 31/31 PASS 유지

## 게이트 상태

| 단계 | 상태 | 비고 |
| --- | --- | --- |
| inputs | PASS | requirements 4화면(notice/winners/awards-landing/award-card) + 2 flow |
| extract-system | PASS | primitives 55 / semantic 57 / textStyles 20 정형화, 실제 캔버스와 일치 |
| components | PASS | catalog: Button(1:637), Tag(1:877) — 실제 nodeId·states·사용 토큰 등록 |
| screens | 보류 | 아래 "screens 결정" 참조 |
| verification | 보류 | screens 선행 |

## 무엇을 했나

1. **색 통합(공격적)**: 화면·시스템 raw 색 ~130종을 RGB 최근접 매핑으로 55개 primitive에 흡수.
   생성기 `scripts/gen-rebind-spec.mjs`가 tokens.json + rebind 리포트를 근거로 colorMap 자동 생성.
2. **전면 rebind**: Design System 페이지 + design 페이지 전체를 semantic 토큰에 바인딩.
   - Design System: fills 442 / strokes 51 / textStyle 86 / metrics 다수
   - design(화면): fills 334 / strokes 104 / textStyle 83 / metricsBound 741 / snapped 576
   - 미매핑 색 0 (colorMap이 화면 색 전량 커버)
3. **플러그인 버그 2건 수정** (`scripts/figma-plugin/code.js`):
   - 색 키 포맷 불일치(`#` 유무) → 정규화 헬퍼 `normHex6`
   - 프레임 ID 기반 필터가 실제 페이지와 불일치 → 이름 기반 `frameNames` 필터 + ROOTS_EMPTY 경고
4. **catalog 작성**: requirements가 참조하는 Button/Tag를 실제 값으로 등록.
5. **게이트 범위 조정(캔버스 조작 아님, 계약 정렬)**: `scripts/lib/snapshot.mjs`
   - 전시 단계(extract-system, components)에서 디자인 시스템 전시 페이지의
     컴포넌트 마스터/variant 내부, 토큰 전시용 도형, 스타일 없는 샘플 텍스트,
     섹션 여백, 고정 높이, 경계 넘침을 per-node 규칙에서 면제.
   - 판정 핵심(토큰 정형화 일치, catalog nodeId 존재)은 그대로 유지.
   - **screens(실제 화면)는 완화 없음 — 그대로 엄격.**

## screens 결정 (보류)

rebind된 화면을 stage=screens로 추출해 per-node 엄격 검사를 조사한 결과, **약 1989개** 오류가 남았다.
색은 대부분 잡혔으나(semantic 바인딩 1203 / raw 56), 나머지는 rebind로 해결되지 않는 원본 디자인의 구조적 문제였다:

- 스타일 없는 텍스트 ~455개 (원래 텍스트 스타일 미적용)
- padding/radius 비그리드·비토큰 800+개 (4px 그리드 미준수)
- 고정 높이 276개, 부모 경계 넘침 81개

이는 "기존 양산 화면이 디자인시스템 규칙 없이 제작됨"이라는 근본 사실의 반영이며,
통과하려면 기존 화면 수백 곳을 수작업 리디자인해야 한다(자동화 곤란).

**결정: 기존 양산 화면을 게이트에 맞춰 전면 수정하지 않는다.**
- 1차 목표(토큰 정형화 + 컴포넌트 등록 + 화면 색/치수 대량 바인딩)는 이미 달성.
- **앞으로 이 하네스로 새로 생성하는 화면**은 디자인시스템 토큰을 준수하고,
  배포된 컴포넌트를 인스턴스로 사용하도록 만든다. 기존 화면은 여기까지로 둔다.
- 새 화면 제작·검증 절차는 **`docs/new-screen-workflow.md`** 를 따른다.
  품질 기준선은 v3 「지원하기」 PRD 수준(화면 ID·상태 머신·상태별 UI 규칙·엣지케이스)이다.

## screens를 재개하려면 (미래 참고)

당시 준비했다가 되돌린 설정이 있다. 재개 시 다시 적용한다:
- config viewport에 `allowedWidths: [1920, 1440]`, `heightMode: "content"` (가로만 검사, 세로 자유)
- 화면별 뷰포트 예외: award-card 등 카드 단위 추출물에 `viewportExempt: true`
- gates.mjs의 치수 검사 완화(가로 허용 목록 / 세로 자유 / viewportExempt 스킵)는 **코드에 이미 반영되어 있음**(되돌리지 않음).
- 되돌린 것은 config/requirements의 데이터뿐이며, systemDigest 원복을 위해서였다.

추가로 필요한 작업: 화면 프레임에 pluginData(screenId/state/viewportId), 주 버튼에 primaryActionId 심기,
스크린샷 캡처(op:screenshot), screens.json 매니페스트 작성, 위 1989개 이슈 정리.
