---
name: analyze-references
description: "수집한 기존 화면 캡처를 보고 기존 시스템의 UX·시각·컴포넌트 패턴을 분석해 확장 화면 설계 근거로 정리할 때 사용한다."
---

# 기존 화면 분석 (선택)

이 프로젝트 루트에서 실행한다. 공통 규칙은 AGENTS.md를 따른다. 근거 화면을 수집했을 때만 수행한다.

1. design/01-references/index.json과 raw/의 실제 이미지를 모두 대조한다.
2. 이미지를 직접 보고 화면 유형, 주요 과업, 정보 위계, 밀도, 타이포, 컴포넌트 패턴을 분석한다. 이는 기존 시스템의 관습을 파악해 새 화면을 그 관습에 맞추기 위한 것이다.
3. 반복되는 패턴과 예외를 출처 id로 뒷받침하고, 새 화면에 재사용할 결정과 벗어나야 할 이유를 구분한다.
4. 결과를 design/01-references/analysis.md에 기록한다. 파일명이나 설명만 보고 시각 분석을 대신하지 않는다.
5. 기존 시스템과 확장 목표 사이의 공백, 화면별로 추가 확인이 필요한 사항을 build-structure가 사용할 수 있게 명시한다.

계약 및 절차: [contracts](../../../docs/contracts.md), [tool adapters](../../../docs/tool-adapters.md).
