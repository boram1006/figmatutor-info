# Figma 작성·추출 계약

이 문서는 프로젝트의 산출물 계약이다. API 호출 방법은 설치된 공식 Figma 스킬을 먼저 읽는다.
아래 Figma 호출·캡처·추출은 [전담 에이전트](figma-delegation.md)가 수행한다. 메인은 원문 도구 응답을 받지 않고 저장된 결과 요약과 로컬 게이트를 확인한다.
기본 페이지는 01 Concepts / 02 Components / 03 Screens. 토큰 문서는 별도 페이지에 둘 수 있다.
토큰 라이브러리와 문서는 [지정 가이드](token-library-guide.md)의 정보 구성·실제 변수 견본·표기 및 검증 절차를 적용한다.
use_figma에서 호출당 페이지 하나만 다룬다. 스크립트 응답의 잘린 JSON을 손으로 보완하지 않는다.

## 메타데이터

레이어 이름에서 Primary/버튼을 추측하지 않는다. 실제 의미를 PluginData에 기록한다.
현재 use_figma는 setPluginData를 지원하지 않으므로, 같은 JSON을
`node.setSharedPluginData('designHarness', 'metadata', JSON.stringify(meta))`로 저장한다.
추출기는 공유 저장소와 기존 로컬 저장소를 모두 읽으며 두 값이 충돌하면 실패한다.
노드 의미만 저장하며 작업 진행 상태나 검사 결과를 메타데이터로 대체하지 않는다.

```js
frame.setPluginData('designHarness', JSON.stringify({
  role: 'screen', screenId: 'home', state: 'default', viewportId: 'mobile'
}));
cardInstance.setPluginData('designHarness', JSON.stringify({
  componentId: 'MissionCard', reusable: true, tapTarget: true, primaryActionId: 'home-primary'
}));
imageSlot.setPluginData('designHarness', JSON.stringify({role:'image',slotId:'home-hero'}));
```

캐릭터 슬롯은 공유 메타데이터에 `role:'image', assetId:'buddy-front', slotId:'home-skill-meeting'`처럼 실제 자산 ID를 함께 기록한다. 이미지 paint는 FIT, 슬롯 바탕은 color-character-bg를 사용한다. 원본에 이미 포함된 배경은 FIT 여백과 별개다.

componentId는 catalog의 ID다. semantic variable로 색·padding·spacing·radius를 바인딩하고,
타이포는 Text/* 스타일을 사용한다. 카드·리스트 등 가변 콘텐츠 컨테이너는 HUG.
고정 높이는 catalog.height의 토큰으로 선언하며 실제 높이도 일치해야 한다.
기기 크롬/아이콘/이미지/구분선은 role: device-chrome/icon/image/divider로 명시한다.
이는 실제 의미의 예외이지 일반 컨테이너의 검사를 피하기 위한 표식이 아니다.

반복 UI의 최상위 노드에 reusable:true를 표시한다. 화면의 section/layout wrapper는
반복 컴포넌트가 아니면 false. INSTANCE 내부 FRAME은 재사용률 분모에서 제외된다.
primaryActionId는 카드·버튼 중 실제 주 액션 한 곳에 기록하고 자식 라벨에는 기록하지 않는다.

스크롤 영역은 실제 overflowDirection과 clipsContent로 선언한다. 탭 타겟의 최소 크기는
원래 경계로 검사하고, safe area는 스크롤 조상에 의해 잘린 뒤 보이는 세로 영역으로 검사한다.
클리핑이 없는 화면 밖 액션이나 safe area를 침범하는 스크롤 영역은 계속 실패한다.

## 헤더 로고

브랜드 로고가 표시되는 헤더는 `design/characters/Logo.svg`를 원본으로 사용한다.
브랜드명을 TEXT 노드로 입력하거나 다른 글꼴로 재현하지 않는다. 일반 화면 제목이나
뒤로가기 헤더에는 일률적으로 로고를 추가하지 않는다. 시안부터 적용하고, 방향 선택 후에는
로고가 필요한 공통 헤더 컴포넌트에 반영하여 해당 인스턴스에 재사용한다.

- 제작 전 파일 존재와 SVG 내용을 확인하고 원본을 벡터로 가져온다. 원본 viewBox 비율·색상·형태를 유지하며 균일하게 축소/확대한다. 비균일 늘리기, 자르기, 재색칠, 텍스트 대체를 하지 않는다.
- 로고는 캐릭터와 같은 폴더에 있어도 별도 브랜드 자산이다. 캐릭터용 FIT paint·하늘색 배경·`role:image`·local-character 등록을 적용하지 않는다. 기존 `assets.json`은 래스터 캐릭터 전용으로 유지한다.
- 원본 벡터의 색은 같은 실제 값의 semantic 변수에 연결해 색상 검증과 원본 보존을 함께 만족시킨다. 필요한 토큰은 시안 단계의 최소 토큰, 선택 이후에는 추가 전용 token-extensions.json에 정의한다. 원본 색을 기존 브랜드색으로 바꾸거나 검사에서 노드를 숨기지 않는다.
- 파일이 없거나 SVG를 정상적으로 가져올 수 없으면 해당 로고 배치의 미완료 사유를 알리고 임의 대체하지 않는다. 로고와 무관한 작업은 계속할 수 있다.
- 작업 결과에 원본 상대 경로·SHA256·실제 Figma 로고/헤더 nodeId·캡처 경로를 기록한다. 실제 캡처를 원본과 대조해 형태·비율·색상·잘림·정렬을 확인한다. 일반 제목 TEXT를 로고 대체로 오인하지 않는다.

현재 자동 게이트는 SVG 원본의 동일성이나 Logo.svg 변경 지문을 검사하지 않는다.
따라서 `npm run check` PASS만으로 로고 준수를 보고하지 않는다. 로고 원본이 변경되면
관련 헤더를 동기화하고 영향받은 캡처·스냅샷·리뷰를 새로 검증한다.

## 캔버스 생성

1. Figma 인증/대상 fileKey/기존 페이지를 확인한다. 이미 있는 노드를 재생성하지 않고 갱신한다.
2. npm run tokens:export 후 generated/tokens.resolved.json에서 실제 토큰을 읽는다.
3. primitives 값 → semantic alias → text style 순서로 만든다. 변수 scopes를 지정하고 폰트는 목록에서 확인.
4. 라이브러리 정리는 방향 선택 후 진행. 실제 컴포넌트 노드 ID를 catalog.json에 기록한다.
5. 크기 조정은 sizing 설정보다 먼저 하고, appendChild 이후 HUG/FILL 제약을 확인한다.
6. 화면은 component 인스턴스로 조립하고 콘텐츠 상태별로 다른 프레임을 만든다.
7. Figma screenshot 도구의 실제 결과를 로컬 파일로 저장해 매니페스트와 연결한다.

## 스냅샷

1. `npm run fingerprint -- --scope components` 또는 `screens`로 입력 지문을 얻는다.
2. scripts/figma/extract-snapshot.js의 CONFIG를 실제 fileKey, pageName, stage, inputDigest로 치환한다.
3. 설치된 figma-use 스킬을 로드하고 스크립트를 use_figma에 전달한다. 로컬 Node 실행용 파일이 아니다.
4. 반환 객체를 design/03-design-rules/components/snapshot.json 또는 design/04-screens/snapshot.json으로 저장한다.
5. 해당 check 명령을 실행한다. 토큰/입력 변경 시 캔버스도 동기화하고 다시 추출한다.

응답이 크면 CONFIG.frameIds에 해당 페이지의 top-level 프레임 ID 일부를 넣어 여러 번 추출한다.
호스트가 응답을 20KB로 자르면 CONFIG에 실제 추출 시작 시각 `capturedAt`과
`outputOffset: 0`을 지정한다. `chunk-v1` 응답을 10000자씩 증가시켜 받아,
모든 응답의 total/checksum이 같은지 확인하고 연결된 문자열의 길이와 FNV-1a
체크섬을 다시 확인한 뒤 JSON으로 파싱한다. 이 전송 분할 중에는 캔버스를 수정하지 않는다.
이는 추출 JSON의 무손실 전송이며 필드 삭제나 검사 결과 수기 보완이 아니다.
각 응답을 batch-N.json에 저장한 뒤 아래 명령으로 병합한다:

```sh
node scripts/merge-snapshots.mjs batch-1.json batch-2.json --output design/04-screens/snapshot.json
```

중복·누락 프레임, 배치 사이 토큰·입력 차이가 있으면 병합 실패. 병합 도중 캔버스를 수정하지 않는다.
현재 추출기는 visible 노드, 변수 값/모드별 alias, 텍스트 스타일 수치, 수치 속성 바인딩,
이미지 hash, parentId, 레이아웃·의미 메타데이터를 수집한다. 그림자·모션·혼합 텍스트 범위별
스타일·복잡한 회전/마스크의 정확한 시각적 경계는 자동 검증 범위 밖이며 실제 캡처로 검토한다.
