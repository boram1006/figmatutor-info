---
name: extract-system
description: "기존 피그마 파일의 디자인 시스템(변수·텍스트 스타일·컴포넌트)을 플러그인으로 추출해 tokens.json/catalog.json으로 정형화하고, 정형화가 실제 캔버스와 일치하는지 검증할 때 사용한다."
---

# 기존 디자인 시스템 추출·정형화

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다. 이 단계는 값을 발명하는 게 아니라
**이미 존재하는 시스템을 읽어 계약 JSON으로 옮기고, 옮긴 게 원본과 같은지 검증**하는 단계다.

Figma 작업은 [플러그인 방식](../../../docs/kiro-figma-plugin.md)과 [실행 계약](../../../docs/figma-delegation.md)을 따른다.
Kiro가 스펙을 만들고 사용자가 플러그인에서 실행한다. MCP를 쓰지 않는다.

1. `npm run status`로 extract-system이 다음 단계인지 확인한다. `harness.config.json`의 `figma.fileKey`와 `extractPages`(추출할 페이지 목록: 디자인시스템 페이지 + 관련 화면 페이지)를 확인한다. 비어 있으면 사용자에게 페이지 이름을 물어 채운다.
2. `op:extract` 스펙을 페이지 단위로 만든다. `stage:"extract-system"`, `inputDigest`는 `npm run fingerprint -- --scope system` 출력. 페이지가 크면(컴포넌트 30~40개) `frameIds`로 나눠 여러 번 추출하고 `scripts/merge-snapshots.mjs`로 병합한다.
3. 사용자가 플러그인에서 실행해 돌려준 스냅샷을 `npm run save-snapshot -- --stage extract-system --from <경로>`로 저장한다.
4. 스냅샷의 실제 변수·텍스트 스타일을 읽어 `design/03-design-rules/tokens/tokens.json`에 **역방향으로** 채운다. primitive에는 실제 값, semantic에는 primitive ref만. Figma의 실제 fontFamily/fontStyle을 그대로 옮긴다. 없는 값을 지어내지 않는다.
5. 추출된 컴포넌트 마스터(COMPONENT/COMPONENT_SET)의 실제 nodeId·states·height·semanticTokens를 `catalog.json`에 옮긴다. (components 단계에서 이 카탈로그가 검증된다.)
6. `npm run check -- --phase extract-system`을 실행한다. tokens.json이 스냅샷의 실제 변수·스타일과 불일치하면 실패한다. 불일치는 tokens.json을 원본에 맞게 고치거나, 원본을 피그마에서 수정 후 재추출해서 해결한다. 스냅샷을 손으로 조작하지 않는다.
7. 시스템이 불완전한 부분(토큰 없이 하드코딩된 값, 컴포넌트화 안 된 반복 UI 등)은 `design/03-design-rules/system/notes.md`에 기록해 이후 확장 단계가 참고하게 한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [figma contract](../../../docs/figma-contract.md), [tool adapters](../../../docs/tool-adapters.md).
