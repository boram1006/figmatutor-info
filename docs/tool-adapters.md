# 런타임 도구 연결

이 프로젝트는 MCP 클라이언트를 직접 띄우지 않는다. Codex 세션에 노출된 도구를 사용한다.
`npm run doctor`와 실제 도구 목록은 서로 다른 검사다. 도구 제공·인증·파일 편집 권한을 구분해 보고한다.

## Figma

- 모든 Figma MCP 호출은 `figma-worker` 자식 에이전트에서 수행한다. 메인은 [위임 계약](figma-delegation.md)에 따라 요청을 전달하고 요약·로컬 파일만 확인한다.
- 아래 도구 절차와 필수 Figma 스킬 로드는 전담 에이전트에 적용된다. 읽기 전용 참고 가이드 조사도 같은 방식으로 위임한다.

- 시안/화면 생성: 설치된 figma-use 및 figma-generate-design 스킬을 읽고 use_figma.
- 토큰/컴포넌트 생성: figma-use + figma-generate-library.
- 새 파일이 필요한 경우 사용자의 생성 요청 범위가 있으면 설치된 figma-create-new-file 스킬부터 읽는다.
  기존 파일이 주어졌으면 그 파일을 쓴다. 매번 수동으로 빈 파일을 만들라고 요구하지 않는다.
- 결과 파일 키는 harness.config.json의 figma.fileKey에 기록하고 metadata로 대상을 확인한다.
- 스킬은 설치된 위치/도구 메타데이터로 발견한다. 존재를 확인하지 않은 skill:// URI를 호출하지 않는다.
- 승인된 컴포넌트·화면의 추출은 scripts/figma/extract-snapshot.js 사용. 자세한 절차는 figma-contract.md.
- 외부 도구 연결이 없으면 로컬 시안 검토 자료까지 진행 가능. 실제 Figma 빌드 완료로 기록하지 않는다.

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
