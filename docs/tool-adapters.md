# 런타임 도구 연결

이 프로젝트는 MCP 클라이언트를 직접 띄우지 않는다. Kiro가 만든 스펙을 사용자가 Figma
데스크탑 플러그인에서 실행하는 방식으로 캔버스를 다룬다.
`npm run doctor`와 실제 도구 목록은 서로 다른 검사다. 도구 제공·인증·파일 편집 권한을 구분해 보고한다.

## Figma

이 워크스페이스는 Figma 무료 계정 + 데스크탑 플러그인을 쓴다. Dev Mode MCP를 쓰지 않는다.
캔버스 생성·스냅샷 추출·캡처는 Kiro가 만든 스펙을 사용자가 [플러그인](../scripts/figma-plugin/)에서
실행하는 방식이다. 전체 방식은 [플러그인 방식 문서](kiro-figma-plugin.md), 실행 계약은
[플러그인 실행 계약](figma-delegation.md)을 따른다.

- 시안/화면/토큰/컴포넌트 생성: `op:create` 스펙을 만들어 플러그인이 캔버스를 그린다. MCP 스킬(use_figma 등)이나 skill:// URI를 쓰지 않는다.
- 새 페이지가 필요하면 create 스펙의 `pageName`으로 지정한다. 플러그인이 없는 페이지만 새로 만든다. 매번 수동으로 빈 페이지를 만들라고 요구하지 않는다.
- 파일 키는 harness.config.json의 figma.fileKey에 기록한다. 무료 계정에서는 파일 URL(`/design/<fileKey>/...` 또는 `/file/<fileKey>/...`)의 fileKey를 그대로 쓰고, 플러그인이 읽은 `figma.fileKey`를 스냅샷에 기록해 게이트가 config와 대조한다.
- 승인된 컴포넌트·화면의 추출은 `op:extract` 스펙 + 플러그인이다. 추출 로직은 `scripts/figma/extract-snapshot.js`와 동일하며 결과 스키마도 같다. 자세한 절차는 figma-contract.md.
- 플러그인 없이(또는 캔버스 착수 전) 로컬 시안 검토 자료까지 진행할 수 있으나 실제 Figma 빌드 완료로 기록하지 않는다.

## 레퍼런스

uibowl의 search_ui_patterns / search_components / filter_by_app 등이 제공되면 우선 활용한다.
도구가 없으면 사용자가 제공한 로컬 이미지나 허용된 브라우저 캡처로 근거를 확보한다.
reference index에 출처와 경로를 남기고, 얻지 못한 핵심 과업은 coverage 갭으로 명시한다.
단순히 3장/9개 패턴을 채우기 위해 관련 없는 화면을 수집하지 않는다.

## 캐릭터 이미지

`design/characters/Logo.svg`는 캐릭터 이미지가 아닌 브랜드 로고다. SVG 로고의 가져오기·배치·검증은 [헤더 로고 계약](figma-contract.md#헤더-로고)을 따르며 아래 래스터 캐릭터 정책과 구분한다.

이미지 생성·작업 제출·대기 단계는 사용하지 않는다. `npm run assets:list`로
`harness.config.json`의 imagePolicy.directory에 있는 원본을 확인한다.
기본 소스는 `design/characters`의 프로젝트 보유 에셋이다.

- 원본 PNG/JPEG/WebP를 수정하거나 새 이미지로 생성하지 않고 재사용한다.
- Figma upload_assets로 업로드하고 실제 imageHash를 assets.json에 기록한다.
- scaleMode는 FIT. 이미지 원본 비율을 유지하고 부모 슬롯의 배경을 color-character-bg에 바인딩한다.
- 슬롯에 role:image, assetId, slotId를 명시한다. 여백 배경은 imagePolicy.backgroundColor와 같아야 한다.
- 원본 자체의 배경색은 FIT 여백과 다르다. 배경 제거 요청이 없다면 원본을 그대로 사용한다.
- 컴포넌트 단계부터 원본 경로·SHA256·Figma imageHash·FIT·배경색을 실제 캔버스와 대조한다.
- 등록되지 않은 이미지와 생성 서비스 결과는 활성 컴포넌트/화면에 넣지 않는다.
