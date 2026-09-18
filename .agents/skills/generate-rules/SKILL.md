---
name: generate-rules
description: "최소 토큰을 만들고 대표 화면 시안 2~3개를 비교한 뒤 사용자의 실제 방향 선택을 기록할 때 사용한다."
---

# 디자인 규칙과 대표 시안 확정

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

Figma MCP가 필요한 작업은 메인에서 직접 호출하지 않고 `figma-worker`에 위임한다.
[작업 계약](../../../docs/figma-delegation.md)에 따라 원본 응답·이미지는 전담 에이전트가 파일로 보존하고 메인에는 요약만 반환한다.
메인은 로컬 게이트와 사용자 선택을 관리하며 전담 자식은 재위임하지 않는다.

대표 시안의 브랜드 헤더는 [헤더 로고 계약](../../../docs/figma-contract.md#헤더-로고)에 따라 `design/characters/Logo.svg` 원본을 사용한다. 브랜드명을 텍스트로 재현하지 않는다.

[토큰 문서 가이드](../../../docs/token-library-guide.md)의 primitive→semantic 원칙을 적용한다. 이 단계에는 대표 시안용 최소 토큰만 만들고 전체 라이브러리 문서는 방향 선택 후 create-figma에서 정리한다.

1. npm run status로 tokens, concepts, direction 중 가장 앞선 미완료 단계를 확인한다.
2. tokens 단계에서는 npm run check:inputs와 docs/contracts.md를 확인하고 design/03-design-rules/tokens/tokens.json에 대표 화면용 최소 토큰만 둔다. primitive에는 실제 값, semantic에는 ref만 사용한다. npm run check:tokens와 npm run tokens:export를 실행한다.
3. concepts 단계에서는 config.representativeScreenId의 같은 콘텐츠와 viewport로 구조·밀도·타이포가 다른 2~3개 시안을 만든다. 색만 바꾼 복제본은 만들지 않는다. Figma 작업 전 관련 필수 스킬과 docs/tool-adapters.md를 읽는다.
4. 시안 이미지 영역에는 보유 캐릭터만 FIT로 넣고 남는 영역은 color-character-bg로 채운다. concepts.json에 layoutStrategy, rationale, tradeoffs, primitiveOverrides와 실제 프리뷰 경로를 기록하고 npm run check:concepts를 실행한다.
5. 실제 프리뷰와 장단점을 사용자에게 보여준다. 아직 선택하지 않은 결과를 승인으로 기록하거나 대신 선택하지 않는다.
6. 사용자가 명확히 선택한 경우에만 npm run select -- --concept ID --user-message '실제 선택 발언'을 실행한다. 이미 받은 선택은 다시 묻지 않는다.
7. npm run check:direction과 npm run tokens:export를 실행한다. 입력 변경으로 선택이 stale이면 영향 설명 후 실제 재확인을 기록하며 selection.json 해시를 손으로 바꾸지 않는다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
