---
name: audit-design
description: "생성된 Figma UI를 구조 검사와 실제 스크린샷 관찰로 검증하고 결함 수정 후 재검증할 때 사용한다."
---

# 디자인 검증

컴포넌트 라이브러리를 제작·수정한 작업은 [컴포넌트 가이드](../../../docs/component-library-guide.md)의 카테고리 매핑·마스터/상태·실제 캡처 검증도 수행한다. 자동 게이트 PASS로 문서 시각 검토를 대신하지 않는다.

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

Figma 캡처·추출은 [플러그인 방식](../../../docs/kiro-figma-plugin.md)의 `op:screenshot`/`op:extract`를 쓴다. Kiro가 스펙을 만들고 사용자가 플러그인에서 실행하며, 원본 응답·이미지는 `design/operations/<task-id>/`에 보존한다. MCP를 쓰지 않는다.

브랜드 헤더는 [헤더 로고 계약](../../../docs/figma-contract.md#헤더-로고)에 따라 원본 SVG 경로·해시와 실제 로고 노드·캡처를 대조한다. 텍스트 대체, 비율/색상 변경, 잘림을 확인하며 자동 게이트 PASS만으로 로고 검토를 대신하지 않는다.

토큰 문서를 제작·수정한 작업은 [지정 가이드의 검증 항목](../../../docs/token-library-guide.md)에 따라 실제 바인딩과 캡처를 확인하고 작업 결과에 기록한다. 자동 게이트 PASS만으로 문서 시각 검토를 대신하지 않는다.

1. npm run check:screens로 구조를 검사한다. 실패하면 해당 캔버스나 원본 계약을 고친 뒤 재추출한다.
2. 모든 화면·상태·viewport 스크린샷을 직접 보고 위계, 가독성, 정렬, 브랜드 일관성, 액션 명확성을 판단한다.
3. 각 화면 contentCases를 별도 테스트 프레임에서 재현하고 실제 캡처를 design/04-screens/verification/evidence에 저장한다.
4. npm run fingerprint -- --scope review로 지문을 구해 docs/contracts.md 형식으로 visual-review.json을 기록한다. 검사하지 않은 사례를 pass로 쓰지 않는다.
5. 결함을 수정하면 영향받은 화면을 재캡처하고 지문과 리뷰를 갱신한다. 같은 결함이 3회 반복되면 원인과 필요한 결정을 사용자에게 설명한다.
6. npm run audit와 npm run check가 모두 통과하면 실제 검토 범위와 제외 사항을 포함해 완료를 보고한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [figma contract](../../../docs/figma-contract.md), [tool adapters](../../../docs/tool-adapters.md).
