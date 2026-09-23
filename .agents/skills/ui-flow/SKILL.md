---
name: ui-flow
description: "기존 피그마 시스템을 추출·정형화하고 그 위에 새 화면을 확장하는 이 프로젝트의 UI 흐름을 시작하거나 이어서 진행할 때 사용한다."
---

# UI 디자인 파이프라인 시작·재개 (extract-extend)

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

Figma 작업은 [플러그인 방식](../../../docs/kiro-figma-plugin.md)을 쓴다. Kiro가 스펙을 만들고 사용자가 플러그인에서 실행한다.
원본 응답·대용량 데이터는 `design/operations/<task-id>/`에 파일로 보존한다. MCP를 쓰지 않는다.

1. AGENTS.md와 harness.config.json을 읽고 `npm run status`를 실행한다.
2. 가장 앞선 미완료 단계에 대응하는 스킬만 읽고 진행한다.
3. 파이프라인(5단계): inputs → extract-system → components → screens → verification.
4. 게이트 ↔ 스킬 매핑:
   - inputs = build-structure (+ 선택적으로 collect-references → analyze-references)
   - extract-system = extract-system
   - components / screens = create-figma
   - verification = audit-design
5. 이 하네스는 컨셉 탐색·방향 선택 단계가 없다. 기존 시스템을 추출한 뒤 재사용해 확장한다. 새 화면 레이아웃 초안이 필요하면 `op:create`로 그려주되, 그것을 게이트 통과 조건으로 삼지 않는다.
6. 미완료 단계나 도구 부재를 완료로 표시하지 않는다. 실제 산출물 경로와 다음 작업을 알려준다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
