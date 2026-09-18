---
name: collect-references
description: "PRD를 기준으로 UI 레퍼런스를 수집하고 출처와 로컬 원본을 design/01-references에 정리할 때 사용한다."
---

# 레퍼런스 수집

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

1. PRD.md, harness.config.json, 기존 design/01-references를 읽고 핵심 과업별로 필요한 근거를 정한다.
2. docs/tool-adapters.md의 레퍼런스 절차를 따른다. 이미지를 직접 확인하고 실제 출처와 화면 용도를 기록한다.
3. 원본은 design/01-references/raw/에 두고 docs/contracts.md 계약에 맞춰 index.json을 갱신한다.
4. 각 항목에 고유 id, sourceApp, 실제 파일 경로를 기록한다. 파일이 없거나 이미지가 아닌 항목은 등록하지 않는다.
5. 새 이미지 생성 도구는 사용하지 않는다. 캐릭터 에셋은 harness.config.json의 imagePolicy 경로만 사용한다.
6. 수집 결과와 남은 근거 공백을 raw/README.md에 기록하고 analyze-references로 이어간다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
