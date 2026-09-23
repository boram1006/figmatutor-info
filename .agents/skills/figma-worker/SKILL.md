---
name: figma-worker
description: "Figma 캔버스 생성·스냅샷 추출·캡처가 필요할 때 사용한다. Kiro가 플러그인 스펙 JSON을 만들고, 사용자가 Figma 데스크탑 플러그인에서 실행한 뒤, Kiro가 결과를 로컬 게이트로 검증한다."
---

# Figma 플러그인 실행

이 워크스페이스는 Figma 무료 계정 + 데스크탑 플러그인을 쓴다. MCP도 자식 에이전트 위임도 없다.
전체 방식은 [플러그인 방식 문서](../../../docs/kiro-figma-plugin.md)와 [실행 계약](../../../docs/figma-delegation.md)이 원본이다.

1. [tool adapters](../../../docs/tool-adapters.md)와 [Figma 계약](../../../docs/figma-contract.md), 해당 단계 지침을 읽는다. 컴포넌트/토큰 라이브러리 작업이면 [컴포넌트 가이드](../../../docs/component-library-guide.md)·[토큰 가이드](../../../docs/token-library-guide.md)의 배치·검증 절차를 적용한다.
2. `harness.config.json`의 `figma.fileKey`와 대상 페이지를 확인한다. 이미 있는 노드는 재생성하지 않고 갱신하는 스펙을 만든다.
3. 작업에 맞는 스펙 JSON(`op`: create/extract/screenshot)을 `design/operations/<task-id>/request.json`에 작성하고 사용자에게 경로를 알린다. 스펙 필드는 플러그인 문서를 따른다. 승인 범위를 임의로 확장하지 않는다.
4. 사용자가 Figma 플러그인(Design Flow Harness)에 스펙을 붙여넣고 실행한 결과 JSON을 저장한다. 원문·캡처·스냅샷은 대화에 붙이지 않고 `design/operations/<task-id>/`에 보존한다.
5. create 결과의 실제 노드 ID를 catalog/screens 등 계약 JSON에 기록한다. extract 결과는 `npm run save-snapshot -- --stage <components|screens> --from <경로>`로 정식 스냅샷 경로에 저장한다.
6. 해당 `npm run check -- --phase <stage>`(또는 `npm run audit`)로 판정한다. 완료하지 않은 게이트를 통과로 기록하지 않고, 스냅샷·검사 결과를 손으로 조작하지 않는다. 실제 검사·관찰과 미해결 사항을 구분한다.
