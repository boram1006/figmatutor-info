---
name: create-figma
description: "추출한 기존 컴포넌트를 재사용해 컴포넌트 카탈로그를 확정하고, 기존 화면 + 새 화면을 조립·확장할 때 사용한다."
---

# Figma 컴포넌트와 화면 확장

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다. 이 단계는 extract-system에서 추출한
기존 시스템을 **재사용**하는 것이 기본이며, 새 화면에 필요한 것만 추가한다.

Figma 작업은 [플러그인 방식](../../../docs/kiro-figma-plugin.md)의 `op:create`/`op:extract`를 쓴다. MCP를 쓰지 않는다.
컴포넌트 라이브러리는 [지정 컴포넌트 가이드](../../../docs/component-library-guide.md)의 카테고리·마스터·상태 검증을 따른다.
브랜드 헤더에는 [헤더 로고 계약](../../../docs/figma-contract.md#헤더-로고)의 `design/characters/Logo.svg` 원본을 사용한다.

1. `npm run status`로 components와 screens 중 다음 단계를 확인한다. docs/contracts.md, docs/figma-contract.md와 extract-system 산출물(tokens.json, catalog.json, system/snapshot.json)을 읽는다.
   - **신규 화면 생성 전 `harness.config.json.fig​ma.fileKey`와 `design/03-design-rules/components/snapshot.json.fileKey`가 같은지 확인한다. 다르면 컴포넌트 snapshot을 신뢰하지 말고 `docs/design-system-refresh-workflow.md`의 수동 extract를 먼저 수행한다.**
   - 사용자가 Design System을 수정했다고 알린 경우에도 동일하게 refresh를 먼저 수행한다. 요약 메모만으로 canonical snapshot을 대체하지 않는다.
2. components 단계: extract-system에서 채운 catalog.json이 요구사항의 componentIds를 모두 덮는지 확인한다. 기존 컴포넌트를 우선 재사용하고, 새 화면에만 필요한 새 컴포넌트만 추가한다.
3. 새 컴포넌트에 필요한 새 토큰은 design/03-design-rules/components/token-extensions.json에 **추가만** 한다. 추출한 시스템 토큰을 덮어쓰지 않는다(덮어쓰려면 피그마 원본을 고치고 재추출). catalog.json에 실제 nodeId, states, height, semanticTokens를 기록하고 components 지문(`npm run fingerprint -- --scope components`)으로 snapshot.json을 추출한 뒤 `npm run check:components`를 실행한다.
4. screens 단계: requirements의 screens × states × viewportIds를 채운다. origin:existing 화면은 기존 프레임을 갱신·정리하고, origin:new 화면은 기존 컴포넌트 인스턴스로 조립한다.
   - `type:"INSTANCE"`의 `componentNodeId`는 반드시 최신 `catalog.json`에 등록된 실제 nodeId만 사용한다.
   - COMPONENT_SET은 `variantName` 또는 `variantProperties`로 정확히 1개 variant를 고른다.
   - 상태 변화는 `variantProperties/componentProperties`로 처리한다. fill을 직접 칠하지 않는다.
   - 컴포넌트가 text property를 노출하지 않는 경우에만 `INSTANCE.patches`로 **텍스트/visible 최소 override**를 허용하며, sourceNodeId 또는 strict nodeName+expectedMatches를 사용한다. visual override는 금지한다. 상태별 primaryRequired를 지키고 각 화면·상태의 실제 스크린샷을 저장한다.
5. 이미지 슬롯에는 npm run assets:list의 보유 캐릭터만 FIT로 넣고 부모 배경을 color-character-bg에 바인딩한다. assets.json에 원본 경로, SHA256, Figma imageHash를 기록한다.
6. screens.json에 실제 frameId와 스크린샷을 연결하고 metadata의 primaryActionId, tapTarget, reusable을 의미대로 지정한다. 새 화면도 기존 재사용률(minimumReuseRate)을 만족해야 한다.
7. screens 지문으로 snapshot.json을 추출하고 `npm run check:screens`를 실행한다. 실패는 실제 캔버스나 원본 명세를 고친 뒤 재추출한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [figma contract](../../../docs/figma-contract.md), [tool adapters](../../../docs/tool-adapters.md).
