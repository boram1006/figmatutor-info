# 피그마 재편 + 재추출 실행 가이드 (extract-system 통과용)

이 문서대로 **피그마 데스크탑 앱 + 설치한 하네스 플러그인**에서 순서대로 실행하면
Design System 페이지가 게이트 규격(primitives/semantic 2컬렉션 + semantic 바인딩 + Text/ 텍스트스타일)에 맞게 정리된다.
Kiro가 만든 스펙 JSON을 플러그인 입력창에 붙여넣고 Run만 하면 된다.

- 대상 파일: fileKey `HscNdM20Gvs2hBwSjU5OBc`
- 현재 systemDigest: `df6a4ee58922902c079dae55aa16c9d24daa549d4131cf6870c9d9daa2ad39a8`
  (config/requirements/PRD/tokens가 바뀌면 이 값이 달라진다. 그때는 Kiro에게 스펙 재생성을 요청.)

> **dryRun은 쓰지 않는다.** rebind는 (1)변수 생성 → (2)그 변수에 바인딩의 2단계인데
> dryRun=true면 변수를 실제로 안 만들어서 바인딩 대상이 없어 counts가 전부 0으로 나온다(허수).
> 그래서 이 가이드는 apply만 사용한다. `spec-*-dryrun.json`은 무시한다.

---

## 준비: 안전을 위해 파일 복제(권장)

rebind는 변수·바인딩·텍스트스타일을 실제로 바꾼다. 되돌리기 어려울 수 있으니
피그마에서 **파일을 Duplicate**해서 사본에서 먼저 돌려보길 권한다. (원치 않으면 생략)

플러그인은 manifest 변경이 없으므로 재설치가 필요 없다. 이미 열려 있던 플러그인 창은 닫고 다시 Run하면 최신 code.js가 로드된다.

---

## 1단계 — Design System 페이지 적용

컴포넌트가 있는 **Design System 페이지**부터 정리한다.

1. 피그마에서 **Design System 페이지**를 연다.
2. 플러그인 실행 → 입력창에 `design/operations/rebind-01/spec-system-apply.json` 내용을 붙여넣고 Run.
3. 이때 실제로 일어나는 일:
   - `primitives` / `semantic` 컬렉션이 새로 생기고 최종 토큰(primitives 55 / semantic 57)이 add-only로 채워짐
   - `Text/` 계열 텍스트 스타일 20개 생성 + 기존 텍스트가 새 스타일로 전환
   - 노드의 색·치수가 semantic 변수에 바인딩 (색은 최근접 통합 매핑, 알파는 opacity로 보존, 이미 바인딩된 건 건너뜀)
4. 완료 리포트를 텍스트로 복사해 `design/operations/extract-system-02/report-system-apply.json`으로 저장(또는 Kiro에게 붙여주면 판단).
   - `counts` — 실제 바인딩된 개수(0이 아니어야 정상)
   - `unmappedColors` — 매핑 안 된 색. **비어 있어야 정상**(생성기가 128종 전부 매핑함). 뭔가 남으면 Kiro에게 알려주면 colorMap 보강.
   - `unsnappable` — 4px 그리드로 못 붙이는 치수(소수점·비그리드 큰 값). 자동 안 됨 → 나중에 수동 처리 대상.

---

## 2단계 — design(화면) 페이지 적용 (배치로 나눠서)

화면 페이지는 프레임이 무겁다(총 ~2500 노드, 큰 랜딩 프레임 4개). 한 번에 돌리면
플러그인이 몇 분씩 멈춘 것처럼 보이므로, **프레임을 나눈 배치 스펙 6개**를 순서대로 돌린다.
각 배치는 몇 개 프레임만 처리해서 훨씬 빨리 끝나고 진행 상황도 눈에 보인다.

1. **design 페이지**를 연다. (아래 배치는 전부 이 페이지에서 실행)
배치는 프레임 **이름**으로 대상을 고른다(ID는 추출 시점마다 달라서 신뢰 불가).

2. 배치를 순서대로 하나씩 Run한다. 각 배치가 끝나면(결과 JSON이 나오면) 다음 배치로.

   | 배치 | 스펙 파일 | 내용 |
   | --- | --- | --- |
   | 1 | `spec-design-batch-1.json` | 폼 조각들 + 공지 화면(1_Notice) |
   | 2 | `spec-design-batch-2.json` | 플로팅바 확장 + 합격팀 발표 |
   | landing | `spec-design-batch-landing.json` | 이름이 "Frame"인 랜딩 변형 4개 (제일 무거움) |
   | card | `spec-design-batch-card.json` | 카드 리디자인 |

   (경로: `design/operations/rebind-01/`)

3. 각 배치 결과를 대응 파일에 저장한다:
   batch-1 → `report-design-batch-1.json`, batch-2 → `report-design-batch-2.json`,
   landing → `report-design-batch-landing.json`, card → `report-design-batch-card.json`.
   (경로: `design/operations/extract-system-02/`)

> - **결과에서 먼저 볼 것**: `counts.nodesTouched`가 0이 아니어야 한다. 0이면 그 배치가 대상 프레임을 못 찾은 것 —
>   이때 `warnings`에 `ROOTS_EMPTY: ... page.children 이름=[...]`가 찍힌다. 그 이름 목록을 붙여주면
>   스펙의 프레임 이름을 실제와 맞춰 고쳐준다(대시·공백 차이 등).
> - ensure는 add-only라, 배치마다 반복돼도 변수·스타일을 다시 만들지 않는다(중복 없음). 색·치수 바인딩만 채워진다.
> - `batch-landing`이 너무 오래 걸리면 알려주면 실제 프레임 ID로 하나씩 쪼개준다.
> - 플러그인 코드가 바뀌었으니(이름 필터 추가) 열려 있던 창은 닫고 다시 열어 최신 code.js를 로드한다.

---

## 3단계 — 기존 파편 컬렉션 정리 (선택)

기존 `colors` / `spacing` / `radius` / `Collection 1` / `lg.*` 등 파편 컬렉션은
이제 아무 노드도 참조하지 않으면 게이트에 영향이 없다(게이트는 primitives/semantic만 읽음).
깔끔하게 하려면 피그마 변수 패널에서 수동 삭제해도 되고, 그대로 둬도 통과에는 지장 없다.

> 삭제는 되돌리기 어렵다. 1~2단계 적용이 잘 됐는지 확인한 뒤에만 진행.

---

## 4단계 — Design System 페이지 재추출

정리된 상태를 스냅샷으로 다시 뜬다.

1. **Design System 페이지**를 연다.
2. 입력창에 `design/operations/extract-system-02/spec-extract.json` 붙여넣고 Run.
3. 플러그인이 스냅샷 JSON을 클립보드로 내보낸다(또는 결과 영역에 표시).
4. 그 JSON을 `design/operations/extract-system-02/snapshot.json`으로 저장.

> 이 스펙의 `inputDigest`는 위 systemDigest(`df6a4ee5…`)와 같아야 한다. 다르면 "입력 변경" 오류가 난다.

---

## 5단계 — 정식 경로에 저장 + 게이트 판정

터미널(프로젝트 루트)에서:

```
node scripts/harness.mjs save-snapshot --stage extract-system --from design/operations/extract-system-02/snapshot.json
node scripts/harness.mjs check --phase extract-system
```

- `save-snapshot`이 스냅샷을 `design/03-design-rules/system/snapshot.json`에 복사한다.
- `check --phase extract-system`이 PASS면 목표 달성.
- 남는 오류가 있으면 그 내용을 Kiro에게 알려주면 원인별로 처리한다
  (색 바인딩 누락 → colorMap 보강 후 재적용, 치수 그리드 위반 → unsnappable 수동 처리, 텍스트 스타일 누락 → textStyleMap 보강 등).

---

## 알아둘 점 (자동으로 100%가 안 되는 부분)

- **unsnappable 치수**: `itemSpacing=185.17`, `paddingTop=0.75`, 음수 spacing 같은 소수점·비그리드 값은 4px 토큰으로 못 붙인다.
  이건 레이아웃 실측값이라, 게이트를 통과하려면 해당 프레임의 오토레이아웃/수동 배치를 손봐야 한다.
  적용 리포트의 `unsnappable` 목록으로 위치를 좁힌 뒤 개별 처리한다.
- **스타일 없는 텍스트**: 원래 텍스트 스타일이 안 걸린 텍스트는 textStyleMap이 자동 전환하지 못한다.
  어떤 텍스트를 어느 `Text/` 스타일로 볼지는 판단이 필요하다(대부분 크기로 유추 가능).
- **색 공격적 통합**: 유사한 색은 하나의 대표 토큰으로 흡수했다(예: `#E5E5E5`·`#D4D4D4` → `neutral-100`).
  게이트는 색값 일치를 검사하지 않으므로 통과에는 문제없고, 시각적으로도 거의 구분되지 않는다.
  파랑 계열은 primitive가 `accent-indigo` 하나뿐이라 파랑/보라 화면 색이 모두 그리로 모인다(의도된 통합).
- 이 항목들은 적용 리포트를 보고 Kiro와 함께 정리한다. 색·기존스타일 전환은 자동으로 처리된다.
