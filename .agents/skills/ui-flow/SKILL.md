---
name: ui-flow
description: "기존 단계와 같은 역할 이름으로 구성된 이 프로젝트의 UI 디자인 흐름을 시작하거나 이어서 진행할 때 사용한다."
---

# UI 디자인 파이프라인 시작·재개

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

Figma MCP가 필요한 작업은 메인에서 직접 호출하지 않고 `figma-worker`에 위임한다.
[작업 계약](../../../docs/figma-delegation.md)에 따라 원본 응답·이미지는 전담 에이전트가 파일로 보존하고 메인에는 요약만 반환한다.
메인은 로컬 게이트와 사용자 선택을 관리하며 전담 자식은 재위임하지 않는다.

1. AGENTS.md와 harness.config.json을 읽고 npm run status를 실행한다.
2. 가장 앞선 미완료 단계에 대응하는 스킬만 읽고 진행한다.
3. 순서: collect-references → analyze-references → build-structure → generate-rules → create-figma → audit-design.
4. 내부 게이트 매핑은 inputs=앞의 세 역할, tokens·concepts·direction=generate-rules, components·screens=create-figma, verification=audit-design이다.
5. 사용자가 요청한 범위에서 연속 진행한다. 방향 선택만 실제 시안을 보여준 뒤 사용자의 선택을 기록한다.
6. 미완료 단계나 도구 부재를 완료로 표시하지 않는다. 실제 산출물 경로와 다음 작업을 알려준다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
