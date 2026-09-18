---
name: create-figma
description: "선택한 디자인 방향으로 Figma 컴포넌트를 정리하고 전체 화면과 필요한 상태를 확장할 때 사용한다."
---

# Figma 컴포넌트와 화면 생성

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

Figma MCP가 필요한 작업은 메인에서 직접 호출하지 않고 `figma-worker`에 위임한다.
[작업 계약](../../../docs/figma-delegation.md)에 따라 원본 응답·이미지는 전담 에이전트가 파일로 보존하고 메인에는 요약만 반환한다.
메인은 로컬 게이트와 사용자 선택을 관리하며 전담 자식은 재위임하지 않는다.

브랜드 헤더 컴포넌트와 해당 화면 인스턴스에는 [헤더 로고 계약](../../../docs/figma-contract.md#헤더-로고)의 `design/characters/Logo.svg`를 사용한다. 원본 비율·색상을 유지하고 캐릭터용 하늘색 배경을 강제하지 않는다.

토큰 라이브러리를 정리할 때 [지정 토큰 문서 가이드](../../../docs/token-library-guide.md)를 적용한다. 실제 변수·스타일과 함께 계열별 견본·이름·값 문서를 만들고 바인딩 검사 및 실제 캡처 관찰을 작업 결과에 기록한다.

1. npm run status로 components와 screens 중 가장 앞선 미완료 단계를 확인한다. docs/contracts.md, docs/figma-contract.md, docs/tool-adapters.md와 Figma 호출에 필요한 설치 스킬을 먼저 읽는다.
2. components 단계에서는 npm run check:direction을 확인하고 선택된 시안과 실제 토큰으로 요구사항의 componentIds를 만든다. 쓰이지 않는 기본 컴포넌트를 채우지 않는다.
3. 부족한 새 토큰은 design/03-design-rules/components/token-extensions.json에 추가한다. 선택된 토큰을 덮어쓰지 않는다. catalog.json에 실제 nodeId, states, height, semanticTokens를 기록하고 components 지문으로 snapshot.json을 추출한 뒤 npm run check:components를 실행한다.
4. screens 단계에서는 requirements의 screens × states × viewportIds를 기준으로 인스턴스를 조립한다. 상태별 primaryRequired를 지키고 각 화면·상태의 실제 스크린샷을 저장한다.
5. 이미지 슬롯에는 npm run assets:list의 보유 캐릭터만 FIT로 넣고 부모 배경을 color-character-bg에 바인딩한다. assets.json에 원본 경로, SHA256, Figma imageHash를 기록한다.
6. screens.json에 실제 frameId와 스크린샷을 연결하고 metadata의 primaryActionId, tapTarget, reusable을 의미대로 지정한다.
7. screens 지문으로 snapshot.json을 추출하고 npm run check:screens를 실행한다. 실패는 실제 캔버스나 원본 명세를 고친 뒤 재추출한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [figma contract](../../../docs/figma-contract.md), [tool adapters](../../../docs/tool-adapters.md).
