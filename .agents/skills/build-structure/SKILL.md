---
name: build-structure
description: "PRD와 레퍼런스 분석을 화면·상태·흐름·컴포넌트 구조로 정리하고 입력 게이트를 완성할 때 사용한다."
---

# 화면과 흐름 구조 정의

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

1. PRD.md, design/01-references/index.json, analysis.md와 기존 design/02-structure를 읽는다.
2. 기존 갭, 파일명 오기, 내비게이션 모순을 먼저 확인한다.
3. docs/contracts.md의 입력 계약에 따라 requirements.json을 갱신한다.
4. 각 화면의 목적, primaryAction, referenceIds, referenceCoverage, states, viewportIds, componentIds, contentCases를 작성한다.
5. 직접 근거가 약한 부분은 referenceDecision에 PRD 기반 결정과 제약을 기록한다. 설계 판단은 decisions.md에도 사람이 읽을 수 있게 남긴다.
6. imageSlots는 imagePolicy.directory의 보유 캐릭터 assetId에만 연결한다. 새 이미지 생성 계획을 만들지 않는다.
7. 실제 blocker만 질문한다. openQuestions가 해결되면 status를 ready로 바꾸고 npm run check:inputs를 실행한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
