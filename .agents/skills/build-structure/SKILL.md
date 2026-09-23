---
name: build-structure
description: "PRD와 기존 시스템을 화면·상태·흐름·컴포넌트 구조로 정리하고 입력 게이트를 완성할 때 사용한다. 각 화면이 기존(existing) 화면인지 새(new) 화면인지 구분한다."
---

# 화면과 흐름 구조 정의

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다.

1. PRD.md, harness.config.json(`extractPages`), design/01-references(있으면), 기존 design/02-structure를 읽는다.
2. 기존 갭, 파일명 오기, 내비게이션 모순을 먼저 확인한다.
3. docs/contracts.md의 입력 계약에 따라 requirements.json을 갱신한다.
4. 각 화면의 목적, primaryAction, states, viewportIds, componentIds, contentCases를 작성한다. 각 화면에 `origin`을 지정한다:
   - `existing`: 기존 피그마 파일에 있는 화면. `sourceFrame`에 원본 프레임 식별자(예: 프레임명@페이지명)를 기록한다.
   - `new`: 새로 추가할 화면. `rationale`에 추가 근거(PRD 어느 요구, 왜 필요)를 기록한다.
5. referenceIds는 선택이다. 근거 캡처가 있으면 연결하고, 없으면 생략한다. 설계 판단은 decisions.md에도 사람이 읽을 수 있게 남긴다.
6. componentIds는 가능한 한 기존 catalog의 컴포넌트를 재사용한다. 새 화면에만 필요한 새 컴포넌트는 components 단계에서 token-extensions/catalog로 추가한다.
7. imageSlots는 imagePolicy.directory의 보유 캐릭터 assetId에만 연결한다. 새 이미지 생성 계획을 만들지 않는다.
8. 실제 blocker만 질문한다. openQuestions가 해결되면 status를 ready로 바꾸고 npm run check:inputs를 실행한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
