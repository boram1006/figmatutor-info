# 기존 화면 토큰 바인딩(rebind) 워크플로우

이 문서는 **이미 그려져 있으나 raw 값(생짜 hex 색·스타일 없는 텍스트)이 박힌 기존 화면을,
추출한 semantic 토큰·`Text/*` 스타일에 바인딩(rebind)하는** 실전 절차다.

`new-screen-workflow.md`가 "새로 그리는 화면"을 다룬다면, 이 문서는 **"이미 있는 화면을 정돈"**한다.
v5 「최종보고서 제출」 섹션(화면 5개)을 이 절차로 바인딩했고, 그 과정을 재현 가능하게 정리한 것이다.

> 원칙(harness): 값을 발명하지 않는다. 기존 colorMap/`Text/*` 스타일에 매핑만 한다.
> 없는 값이 정말 필요하면 `token-extensions.json`에 추가만 하고 근거를 남긴다.
> 폴더·체크표시·리포트 존재로 완료 판정하지 않는다. **재추출(재측정) 숫자로 판정한다.**

---

## 0. 전제

- extract-system PASS: `primitives`/`semantic` 변수, `Text/*`(20) 텍스트 스타일이 파일에 존재
- 기존 rebind 매핑 자산 재사용: `design/operations/rebind-01/spec-design-batch-1.json`의
  `colorMap`(128키)·`textStyleMap`(38키)·`ensure`(변수/텍스트스타일 보장)
- Figma 플러그인 왕복 방식(`docs/kiro-figma-plugin.md`, `docs/figma-delegation.md`)
- 작업 산출물은 대화에 붙이지 않고 `design/operations/<task>/`에 파일로 저장

---

## 1. 함정 먼저 (이번에 실제로 겪은 것들)

이 순서로 실패했고, 아래 규칙으로 해결했다. 다음에 시간 낭비하지 않도록 맨 앞에 둔다.

1. **파일이 다름 (fileKey)**
   - 증상: extract 결과에 목표 화면이 없고, 이전 파일과 프레임 세트가 동일.
   - 원인: 플러그인은 **현재 열린 파일**에서 실행된다. 스펙의 `fileKey`는 결과에 복사만 되고,
     `figma.fileKey`가 빈 값이면 불일치 검증도 통과해 버린다.
   - 규칙: **목표 파일을 실제로 연 창에서** 플러그인을 실행한다. `harness.config.json`의
     `figma.fileKey`도 목표 파일로 맞춘다.

2. **SECTION 안에 묶인 화면은 최상위 순회에서 빠진다 (가장 큰 함정)**
   - 증상: 릴리즈 단위로 프레임을 "섹션(Section)"으로 묶으면, extract 최상위 목록에 안 잡힌다.
   - 원인: Figma Section은 `FRAME`이 아니라 **`SECTION` 타입**인데, 플러그인 필터가 이를 제외했었다.
   - 규칙: 플러그인 `code.js`의 extract/screenshot 최상위 필터에 `'SECTION'`이 포함돼야 한다(수정 완료).
     섹션 ID를 `frameIds`로 주면 그 안 화면·노드가 전부 자식으로 딸려 나온다.

3. **인스턴스 내부의 raw 값은 rebind로 못 고친다**
   - Figma API 제약. 마스터 컴포넌트를 바인딩하면 인스턴스가 상속한다. 인스턴스 오버라이드면 리셋/수동.
   - 판별: extract는 인스턴스 경계에서 멈춘다(내부 자식 미포함). 인스턴스 수가 적고 독립 요소에
     raw가 많으면 rebind 대상이 맞다.

4. **스타일 없는 텍스트는 이름 기반 스왑으로 안 붙는다**
   - `textStyleMap`은 "기존 스타일명 → 새 스타일명" 교체라, 스타일이 아예 없는 텍스트는 매칭 대상이 없다.
   - 규칙: **size 기반 배정**(`textSizeMap`)을 쓴다. 아래 4단계 참조.

5. **소수점 폰트 크기 = 스케일 왜곡**
   - 13.6px, 16.9px 등은 프레임이 축소/확대된 흔적. raw 크기로 매핑하지 말고 **정규 스텝으로 반올림**해서 배정한다.

---

## 2. 진단 — 무엇이 왜 안 붙었나 (재추출로 측정)

값을 추측하지 않고 스냅샷 숫자로 판단한다.

1. **폰트 포함 extract** 스펙 작성 → 실행 → `snapshot.json` 저장
   ```json
   { "op":"extract", "fileKey":"<목표파일>", "pageName":"<페이지>",
     "stage":"explore", "inputDigest":"explore-<task>", "frameIds":["<섹션 또는 프레임 ID>"] }
   ```
   - `code.js` extract는 텍스트 노드에 `font{size,family,style,weight,lineHeight,mixed}`를 담는다(수정 완료).
2. **바인딩 집계**(로컬 node 스크립트):
   - fill/stroke: `binding.name`이 있으면 bound, 없으면 raw
   - text: `textStyle`이 있으면 styled, null이면 unstyled
   - INSTANCE 수 (rebind 불가 대상 규모 파악)
3. **raw 색 목록 ↔ 기존 colorMap 대조**: 전부 있으면 rebind만으로 색 해결. 없으면 그 값만 새로 매핑.
4. **unstyled 텍스트 폰트 분포**: `snapSize`(정규 스텝 반올림) + weightClass로 (size,weight)별 개수 집계.

정규 스텝(이 시스템의 `Text/*` 크기): `10,12,14,15,16,18,20,24,36,40,54,64`

---

## 3. 색·stroke·치수 rebind (1차)

이미 검증된 `colorMap`을 재사용하므로 리스크가 낮다. **항상 dryRun 먼저.**

1. `rebind-01/spec-design-batch-1.json`을 복제 → 다음만 교체:
   - `fileKey` = 목표 파일
   - `frameNames` 삭제, **`frameIds` = [대상 섹션/프레임 ID]** (동명 프레임이 많으면 이름 매칭 금지, ID로)
   - `dryRun: true`
2. 실행 → 리포트 저장 → 확인: `fillsBound`/`strokesBound`가 기대치, **`unmappedColors`가 비었는지**, `warnings` 0
3. `unmappedColors`에 값이 남으면 그 hex만 `colorMap`에 semantic 이름으로 추가 후 재-dryRun
4. 통과하면 `dryRun:false`로 실제 적용 → 리포트 저장

---

## 4. 타이포 rebind — size 기반 배정 (2차)

스타일 없는 텍스트에 `Text/*`를 배정한다. `code.js` rebind가 `textSizeMap`을 지원한다(수정 완료).

**동작**: unstyled 텍스트 → `fontSize`를 정규 스텝으로 반올림 → weight class(Regular/Medium/SemiBold/Bold) 판정
→ 매핑표에서 스타일 선택. styled 텍스트는 기존 `textStyleMap` 이름 스왑 유지. **mixed 폰트는 자동 스킵.**

`textSizeMap` 형태:
```json
"textSizeMap": {
  "steps":[10,12,14,15,16,18,20,24,36,40,54,64],
  "map":{
    "10":{"Regular":"Text/micro","Medium":"Text/micro","SemiBold":"Text/micro","Bold":"Text/micro"},
    "12":{"Regular":"Text/caption","Medium":"Text/caption-medium","SemiBold":"Text/caption-medium","Bold":"Text/caption-medium"},
    "14":{"Regular":"Text/body-sm","Medium":"Text/body-sm-medium","SemiBold":"Text/body-sm-semibold","Bold":"Text/body-sm-semibold"},
    "15":{"Regular":"Text/body","Medium":"Text/body","SemiBold":"Text/body","Bold":"Text/body"},
    "16":{"Regular":"Text/body-lg","Medium":"Text/body-lg-medium","SemiBold":"Text/body-lg-medium","Bold":"Text/body-lg-bold"},
    "18":{"Regular":"Text/h4","Medium":"Text/h4-medium","SemiBold":"Text/h4","Bold":"Text/h4"},
    "20":{"Regular":"Text/h3","Medium":"Text/h3-medium","SemiBold":"Text/h3","Bold":"Text/h3-bold"},
    "24":{"Regular":"Text/h2","Medium":"Text/h2","SemiBold":"Text/h2","Bold":"Text/h2"},
    "36":{"Regular":"Text/h1-bold","Medium":"Text/h1-bold","SemiBold":"Text/h1-bold","Bold":"Text/h1-bold"},
    "40":{"Regular":"Text/h1","Medium":"Text/h1","SemiBold":"Text/h1","Bold":"Text/h1"},
    "54":{"Regular":"Text/title","Medium":"Text/title","SemiBold":"Text/title","Bold":"Text/title"},
    "64":{"Regular":"Text/display","Medium":"Text/display","SemiBold":"Text/display","Bold":"Text/display"}
  }
}
```

절차:
1. 텍스트 전용 rebind 스펙 작성: `colorMap:{}`(색은 1차에서 끝), `textStyleMap` 유지, `ensure.textStyles` 유지
   (대상 스타일이 파일에 없으면 생성), `textSizeMap` 위 표, `dryRun:true`
2. 실행 → `textStylesSwapped` 개수·`warnings` 확인. "전환 대상 스타일 없음" 경고가 있으면 그 스타일을 `ensure`에 추가
3. `dryRun:false`로 적용

**주의(배정 규칙)**: 12px에는 Bold 스타일이 없어 `caption-medium`으로 내려 배정한다(굵기 한 단계 약화, 크기 유지).
필요하면 이 매핑을 릴리즈 특성에 맞게 조정한다.

---

## 5. mixed 폰트 텍스트 (수동)

한 텍스트에 여러 폰트가 섞인 노드(예: 본문 + "→", 강조 구간)는 자동 배정에서 제외된다.
개수가 적으므로(이번엔 3개) **Figma에서 수동으로 스타일 지정**한다.
색은 자동 rebind로 이미 붙어 있으니 스타일만 맞추면 된다.

---

## 6. 최종 검증 (완료 판정)

리포트 숫자가 아니라 **재추출 후 재측정**으로 판정한다.

1. 검증 extract 실행 → 새 `snapshot-verify.json` 저장
2. 집계 재실행 → 목표:
   - raw fill / raw stroke ≈ **0**
   - unstyled 텍스트 = **mixed 개수만** (그 외 0)
3. 목표 미달이면 남은 raw 색은 colorMap 보완, 남은 unstyled는 textSizeMap 보완 후 3~4단계 반복

---

## 산출물 배치 (이번 작업 예시: `design/operations/rebind-v5/`)

| 파일 | 용도 |
| --- | --- |
| `request.json` | 작업 목표·근거·단계 메모 |
| `spec-extract-*.json` / `snapshot-*.json` | 진단·검증용 추출 스펙과 결과 |
| `spec-rebind-color-*.json` / `rebind-*-report.json` | 색·stroke·치수 rebind(1차) dryRun/apply |
| `spec-rebind-typo-*.json` / `typo-*-report.json` | 타이포 rebind(2차) dryRun/apply |

---

## 코드 의존 (플러그인 `scripts/figma-plugin/code.js`)

이 워크플로우는 아래 수정에 의존한다(이미 반영·회귀 테스트 통과):

- extract/screenshot 최상위 필터에 `'SECTION'` 포함
- extract 텍스트 노드에 `font{size,family,style,weight,lineHeight,mixed}` 수집
- rebind에 `textSizeMap` 기반 unstyled 텍스트 스타일 배정(`snapSize`/`weightClass`/`assignBySize`)

`code.js`를 고친 뒤에는 **Figma에서 플러그인을 반드시 재로드**한 후 실행한다.
