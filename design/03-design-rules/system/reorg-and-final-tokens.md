# 변수 컬렉션 재편 + 최종 토큰 세트 (확정본)

옵션 A(게이트 100% PASS) 기준. 이 문서가 tokens.json과 rebind 스펙(ensure/colorMap/spacingTokens/radiusTokens/textStyleMap)의 근거다.

---

## 1. 게이트가 요구하는 구조 (scripts/lib/snapshot.mjs 근거)

- 변수는 **컬렉션명이 정확히 `primitives`와 `semantic`** 두 개여야 판정 대상이 된다. (변수 이름의 `primitives/` 접두는 무관 — 컬렉션 *이름*을 본다.)
- `primitives`: alias 없는 실제 값(COLOR 또는 FLOAT). `valuesByMode`에 값 존재.
- `semantic`: **alias 전용**. `valuesByMode`는 비어야 하고, 각 alias는 `collection==='primitives'` 이면서 `name===tokens.semantic[x].ref`.
- 모든 SOLID 채움/선은 `semantic` 컬렉션의 COLOR 변수에 바인딩.
- 0이 아닌 모든 metric(padding/itemSpacing/radius)은 `semantic` 컬렉션의 FLOAT 변수에 바인딩 + 값 일치 + padding/spacing은 `%grid(4)==0`.
- TEXT 노드의 textStyle은 `tokens.textStyles`에 존재해야 하고, 하네스 규칙상 이름은 `Text/`로 시작.
- 게이트는 **추가 컬렉션을 금지하지 않는다.** primitives/semantic만 읽으므로, 다른 컬렉션이 남아 있어도 *어떤 노드도 그걸 바인딩하지 않으면* 통과에 지장 없다.

## 2. 현재 상태 (system/snapshot.json 실측)

컬렉션 7개: `colors`(34, semantic alias 14개 포함), `spacing`(20, semantic alias 8개 포함), `radius`(5), `font-size`(24), `line-height`(22), `letter-spacing`(3), `font-weight`(4, STRING).

두 가지가 게이트와 어긋난다:
1. **컬렉션명**: `primitives`/`semantic` 컬렉션이 없다. 값들이 `colors`/`spacing`/`radius`...에 들어있고, `primitives/`·`semantic/`은 변수 *이름* 접두일 뿐이다.
2. **alias 대상 컬렉션**: 기존 semantic(`semantic/text/primary` 등)은 `{collection:"colors"}`를 가리킨다. 게이트는 `collection==='primitives'`를 요구한다.

즉 기존 시스템은 primitives/semantic *설계 의도*는 있으나, 컬렉션 구조가 게이트 계약과 다르다.

## 3. 재편 전략 (확정): 새 2컬렉션 구축 + rebind

Figma Plugin API는 컬렉션 rename은 되지만 **변수를 컬렉션 간 이동은 불가**(재생성 필요). 따라서:

1. rebind `ensure`로 **새 컬렉션 `primitives`와 `semantic`을 구축**한다. 여기에 최종 토큰 세트(기존 + 다크/골드 추가)를 전부 add-only로 생성.
2. rebind가 화면·컴포넌트·Design System 페이지의 모든 노드를 **새 `semantic` 변수로 재바인딩**(색 colorMap, 치수 spacingTokens/radiusTokens, 텍스트 textStyleMap).
3. 기존 `colors`/`spacing`/`radius`/`font-*`/`line-*`/`letter-*` 컬렉션은 **orphan으로 남긴다.** 어떤 노드도 더 이상 참조하지 않으면 게이트에 영향 없음. (원하면 마지막에 수동 삭제 — 선택.)

> 왜 rename 대신 새 구축인가: 기존 `colors`에는 primitive와 semantic이 섞여 있어 rename만으로는 분리 불가. semantic alias의 대상 컬렉션도 바꿔야 하는데 그건 재생성이 필요. 새로 2개를 짓고 rebind로 옮기는 게 가장 깨끗하고 자동화가 된다.

## 4. 최종 primitives (COLOR)

### 기존 유지 (라이트 테마 base)
| name | value |
| --- | --- |
| primitives/primary/main | #FD312E |
| primitives/primary/light | #FFE0E0 |
| primitives/primary/lighter | #FFF0F0 |
| primitives/neutral/white | #FFFFFF |
| primitives/neutral/10 | #F9FAFB |
| primitives/neutral/30 | #F3F4F6 |
| primitives/neutral/100 | #E5E7EB |
| primitives/neutral/200 | #D1D5DB |
| primitives/neutral/300 | #9CA3AF |
| primitives/neutral/500 | #6B7280 |
| primitives/neutral/600 | #4B5563 |
| primitives/neutral/700 | #374151 |
| primitives/neutral/800 | #1F2937 |
| primitives/neutral/900 | #111111 |
| primitives/neutral/black | #000000 |
| primitives/accent/indigo | #6366F1 |
| primitives/accent/yellow | #FFCC00 |
| primitives/status/high | #22C55E |
| primitives/status/medium | #F59E0B |
| primitives/status/low | #EF4444 |

### 다크+골드 추가 (근접 변형을 대표값으로 통합 — 결정1)
골드/브론즈는 각 1개로 통합. 화면의 근접 변형(#C9A84C·#D4A017 등)은 rebind colorMap에서 전부 아래 대표 토큰으로 매핑된다(→ 화면 색이 대표값으로 스냅됨).

| name | value | 통합되는 화면 raw 색 |
| --- | --- | --- |
| primitives/award/gold | #D4AF37 | #D4AF37, #C9A84C, #D4A017 |
| primitives/award/silver | #9AACBC | #9AACBC |
| primitives/award/bronze | #B46E32 | #B46E32, #B07840, #C9845A |
| primitives/award/amber | #F5A623 | #F5A623 |
| primitives/dark/bg | #080808 | #080808, #0A0A0A |
| primitives/dark/surface | #0D1014 | #0D1014 |
| primitives/dark/surface-2 | #141414 | #141414 |
| primitives/dark/warm | #14100A | #14100A |
| primitives/dark/warm-2 | #0E0B06 | #0E0B06 |
| primitives/slate/100 | #C8D0D8 | #C8D0D8, #CBD0D6 |
| primitives/slate/200 | #B4C0CD | #B4C0CD |
| primitives/slate/300 | #A8B5C2 | #A8B5C2, #A8A8B8 |
| primitives/slate/500 | #8C9BAF | #8C9BAF |
| primitives/warm/100 | #E5E5E1 | #E5E5E1 |
| primitives/warm/500 | #64615C | #64615C |
| primitives/warm/gray | #888888 | #888888 |
| primitives/status/success | #10B881 | #10B881, #047857 |
| primitives/status/pending | #B45309 | #B45309 |

> 결정2(상태색): 다크 서브테마 상태색(#10B881 성공 / #B45309 대기)은 라이트의 high/medium과 값이 달라, **다크 전용 새 primitive로 추가**한다(기존 high/medium으로 강제 remap하면 다크 화면 색이 눈에 띄게 틀어지므로). #047857은 #10B881로 통합.

## 5. 최종 primitives (FLOAT)

### spacing (기존 그대로)
0,4,8,12,16,20,24,32,48,64,80,120 → primitives/spacing/0..11

### radius (기존 그대로)
| name | value |
| --- | --- |
| primitives/radius/sm | 8 |
| primitives/radius/md | 12 |
| primitives/radius/lg | 16 |
| primitives/radius/xl | 24 |
| primitives/radius/full | 999 |

> 화면의 pill radius(100/200/999/9999/99 등)는 rebind에서 `radiusFullThreshold=48` 규칙으로 전부 `radius/full`(999)로 스냅. 그 외(4,20 등)는 가장 가까운 토큰으로 스냅(오차>2px는 unsnappable로 리포트→수동).

## 6. 최종 semantic (alias 전용, → primitives)

색 semantic(기존 유지, 단 ref 컬렉션을 primitives로):
```
semantic/text/primary      -> neutral/black
semantic/text/secondary    -> neutral/700
semantic/text/disabled     -> neutral/300
semantic/text/inverse      -> neutral/white
semantic/text/accent       -> primary/main
semantic/border/default    -> neutral/200
semantic/border/focus      -> neutral/900
semantic/border/disabled   -> neutral/100
semantic/border/error      -> primary/main
semantic/background/primary -> neutral/white
semantic/background/surface -> neutral/30
semantic/background/subtle  -> primary/lighter
semantic/background/inverse -> neutral/800
semantic/background/accent  -> primary/main
```
다크/골드 semantic(신규):
```
semantic/dark/background       -> dark/bg
semantic/dark/surface          -> dark/surface
semantic/dark/surface-raised   -> dark/surface-2
semantic/dark/surface-warm     -> dark/warm
semantic/dark/border           -> slate/200
semantic/dark/border-subtle    -> slate/500
semantic/dark/text-primary     -> warm/100
semantic/dark/text-muted       -> warm/gray
semantic/dark/text-slate       -> slate/100
semantic/award/first           -> award/gold
semantic/award/second          -> award/silver
semantic/award/third           -> award/bronze
semantic/award/amber           -> award/amber
semantic/status/success        -> status/success
semantic/status/pending        -> status/pending
```
치수 semantic(기존 유지 + 확장 — rebind spacingTokens/radiusTokens가 참조):
```
semantic/gap/sm  -> spacing/2   semantic/gap/md -> spacing/3   semantic/gap/lg -> spacing/5
semantic/padding/xs -> spacing/1  ...sm->2 md->3 lg->4 xl->5
semantic/radius/sm -> radius/sm  md->md lg->lg xl->xl full->radius/full
```
> spacingTokens는 화면이 실제로 스냅될 대표값(4/8/12/16/20/24/32/48/64/80/120)마다 semantic이 하나씩 있어야 바인딩 가능. gap/padding 이름만으로는 12종 값을 다 못 덮으므로, rebind용으로 **값 기준 semantic(semantic/space/4, /8, /12 ...)을 추가로 정의**한다(§7 참고).

## 7. rebind 스펙에서 쓸 값-기준 spacing/radius semantic

게이트는 "값 일치 + semantic 바인딩"만 보므로, 스냅 대상 값마다 semantic이 있으면 된다. 이름 충돌을 피하려고 값-기준 별칭을 둔다:
```
semantic/space/4->spacing/1  /8->2  /12->3  /16->4  /20->5  /24->6  /32->7  /48->8  /64->9  /80->10  /120->11
semantic/radius/8->radius/sm  /12->md  /16->lg  /24->xl  /999->full
```
rebind의 spacingTokens = [{name:"semantic/space/4",value:4}, ... ], radiusTokens = [{name:"semantic/radius/8",value:8}, ..., {name:"semantic/radius/999",value:999}], radiusFullName="semantic/radius/999".

## 8. 텍스트 스타일 (전면 정리 필요)

현재 38개가 두 계열(`Typography/*` 20개 + 무접두 `Display/*` 등 18개)로 중복. 다수 fontStyle 버그(예: `Title/SemiBold`가 실제 Regular, `Body L SemiBold`가 Medium).

정리: **`Text/` 접두의 단일 계열**로 통합하고 fontStyle을 이름과 일치시킨다. textStyleMap으로 기존 이름→새 이름 일괄 전환.
```
Text/display        Inter Bold 64/72
Text/title          Inter SemiBold 54/60
Text/h1             Inter SemiBold 40/48
Text/h1-bold        Inter Bold 36/44
Text/h2             Inter SemiBold 24/36   (Heading 2 Regular의 실제 SemiBold를 이름과 일치)
Text/h3-bold        Inter Bold 20/28
Text/h3-medium      Inter Medium 20/28
Text/h3             Inter Regular 20/28
Text/h4             Inter SemiBold 18/28
Text/h4-medium      Inter Medium 18/28
Text/body-lg-bold   Inter Bold 16/24
Text/body-lg-medium Inter Medium 16/24
Text/body-lg        Inter Regular 16/24
Text/body           Inter Regular 15/20
Text/body-sm-semibold Inter SemiBold 14/20
Text/body-sm-medium Inter Medium 14/20
Text/body-sm        Inter Regular 14/20
Text/caption-medium Inter Medium 12/16
Text/caption        Inter Regular 12/16
Text/micro          Inter Medium 10/15
```
> lineHeight는 px. Inter SemiBold의 Figma fontStyle 문자열은 "Semi Bold".

## 결정 요약 (사용자 확인 불필요, 근거와 함께 확정)
- 결정1: 근접 골드/브론즈/다크/슬레이트 변형을 대표값으로 **통합**. 화면 색은 rebind가 대표값으로 스냅. (팔레트 정리 + 게이트 값일치 동시 충족)
- 결정2: 다크 상태색은 라이트 high/medium과 별개로 **다크 전용 status/success·pending 추가**. (다크 화면 시각 보존)
- 재편: 기존 파편 컬렉션은 건드리지 않고 **새 primitives/semantic 2개를 구축 후 rebind**. 파편 컬렉션은 orphan(선택적 수동 삭제).
