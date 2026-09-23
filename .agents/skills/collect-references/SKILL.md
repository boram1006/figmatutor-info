---
name: collect-references
description: "기존 피그마 화면을 근거 자료로 캡처해 design/01-references에 정리할 때 사용한다. 외부 참고앱이 아니라 사용자의 실제 양산 화면이 소스다."
---

# 기존 화면 근거 수집 (선택)

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다. 이 하네스는 맨땅 컨셉 탐색이 아니라
**기존 시스템 추출·확장**을 목표로 한다. 레퍼런스는 필수가 아니며, 확장할 화면의 근거가 되는
기존 화면 캡처를 모을 때만 사용한다.

Figma 캡처는 [플러그인 방식](../../../docs/kiro-figma-plugin.md)의 `op:screenshot`을 쓴다. MCP·외부 이미지 생성 도구를 쓰지 않는다.

1. PRD.md, harness.config.json(`extractPages`), 기존 design/01-references를 읽고, 확장하려는 메뉴/화면에 필요한 근거 화면을 정한다.
2. 근거가 필요한 기존 화면을 `op:screenshot`으로 캡처한다. 결과 PNG를 design/01-references/raw/에 저장한다.
3. docs/contracts.md 계약에 맞춰 index.json을 갱신한다. 각 항목에 고유 id, sourceApp(예: 프로젝트명/페이지명), 실제 파일 경로를 기록한다. 파일이 없거나 이미지가 아닌 항목은 등록하지 않는다.
4. 새 이미지 생성 도구는 사용하지 않는다. 캐릭터 에셋은 harness.config.json의 imagePolicy 경로만 사용한다.
5. 근거가 필요 없으면 이 단계를 건너뛴다. requirements의 screen.referenceIds는 선택 항목이다.
6. 수집 결과와 남은 근거 공백을 raw/README.md에 기록하고 analyze-references 또는 build-structure로 이어간다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
