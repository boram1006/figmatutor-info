# 다크+골드 서브테마 토큰 정리안 (초안)

해커톤 화면(`design` 페이지)이 실제로 쓰는데 기존 디자인시스템에 없는 색 49종을,
사용 맥락 기준으로 의미 있는 토큰으로 묶은 제안이다. 알파 변형은 대부분 같은 base 색의
불투명도 조절이므로 **base 색만 primitive로 정의**하고, 화면에서 opacity로 조절한다.

기존 시스템(밝은 테마: neutral/primary-red/accent)은 그대로 두고, 아래는 **추가(add-only)**다.
게이트 규칙상 새 토큰은 `token-extensions.json`에 추가하거나, 원본 피그마 변수에 추가 후 재추출한다.

---

## 1. 시상/순위 (Award) — 화면의 핵심 액센트

수상작 발표·시상 카드에서 1~3위를 금·은·동으로 표현. 골드가 압도적으로 많이 쓰임(#D4AF37 52회).

| 제안 토큰명 | base hex | 실제 쓰임 | 사용처 |
| --- | --- | --- | --- |
| `award-gold` | `#D4AF37` | 1위/금, 대표 골드 액센트, 디바이더·텍스트 | Horizontal Divider, Visit, 1위 |
| `award-gold-deep` | `#C9A84C` | 골드 계열 변주(카드 배경/보더) | 🥇 1위 카드, 해커톤 타이틀 |
| `award-silver` | `#9AACBC` | 2위/은 (블루그레이 톤 은색) | 🥈 2위·상금 |
| `award-bronze` | `#B46E32` | 3위/동 | 🥉 3위·상금 |
| `award-amber` | `#F5A623` | 1st Place 강조(앰버) | 1st Place, Rectangle |

> 참고: `#C9A84C`, `#D4A017`, `#B07840`, `#C9845A`는 위 base들의 근접 변형이다.
> 실제로는 gold/bronze 각 1개로 통합 가능하나, 화면이 미세하게 다른 값을 쓰고 있어
> 통합하려면 화면 쪽 값을 base로 맞춰야 한다(=화면 수정). 우선 대표 5개로 제안.

## 2. 다크 배경 (Dark surface) — 다크 테마 캔버스

| 제안 토큰명 | base hex | 실제 쓰임 |
| --- | --- | --- |
| `dark-bg` | `#080808` | 최하단 배경, Background 프레임 |
| `dark-surface` | `#0D1014` | 텍스트/표면 (수상작 바로가기 등) |
| `dark-surface-2` | `#141414` | 카드 표면 레이어 |
| `dark-warm` | `#14100A` | 골드톤에 어울리는 웜 다크(상금 텍스트 배경) |
| `dark-warm-2` | `#0E0B06` | Background+Border+Shadow 프레임 |

> `#0A0A0A`도 다크 배경 변형. dark-bg로 통합 가능.

## 3. 블루그레이 UI (Slate) — 다크 위 중간톤

카드 보더·구분선·비활성 텍스트 등 다크 UI의 중간 톤. neutral(웜 그레이)과 다른 **쿨 블루그레이** 계열.

| 제안 토큰명 | base hex | 실제 쓰임 |
| --- | --- | --- |
| `slate-100` | `#C8D0D8` | 밝은 블루그레이 텍스트(Visit 등) |
| `slate-200` | `#B4C0CD` | 카드 보더·표면(Frame 다수) |
| `slate-300` | `#A8B5C2` | 우수상 카드 |
| `slate-400` | `#9AACBC` | (award-silver와 동일값 — silver로 통합 검토) |
| `slate-500` | `#8C9BAF` | 보더(저알파) |

> `#A8A8B8`, `#CBD0D6`도 블루그레이 변형.

## 4. 웜 뉴트럴 (Warm neutral) — 골드톤 텍스트

| 제안 토큰명 | base hex | 실제 쓰임 |
| --- | --- | --- |
| `warm-100` | `#E5E5E1` | 밝은 웜 텍스트(3.8k, 2026, 팀명) 34회 |
| `warm-500` | `#64615C` | Vector(아이콘) 웜 그레이 |
| `warm-gray` | `#888888` | 설명 텍스트(AI 자동 수행 등) |

## 5. 상태색 (Status) — 심사 상태

| 제안 토큰명 | base hex | 실제 쓰임 |
| --- | --- | --- |
| `status-success` | `#047857` / `#10B881` | 심사 완료(초록) |
| `status-pending` | `#B45309` | 심사 중(앰버) |

> 기존 시스템에 `high(#22C55E)/medium(#F59E0B)/low(#EF4444)` 상태색이 있으나 값이 다르다.
> 통합하려면 화면을 기존 상태색으로 바꾸거나, 이 값들을 새 상태 토큰으로 추가한다.

---

## semantic 매핑 제안 (dark 테마용)

primitive를 추가한 뒤, 화면 노드가 바인딩할 semantic:

```
semantic/dark/background      -> dark-bg
semantic/dark/surface         -> dark-surface
semantic/dark/surface-raised  -> dark-surface-2
semantic/dark/border          -> slate-200
semantic/dark/text-primary    -> warm-100
semantic/dark/text-muted      -> warm-gray
semantic/award/first          -> award-gold
semantic/award/second         -> award-silver
semantic/award/third          -> award-bronze
semantic/status/success       -> status-success
semantic/status/pending       -> status-pending
```

---

## 통합하면 실제 규모

49종 raw 색 → **primitive 약 18개 + semantic 약 11개**로 흡수 가능.
근접 변형(gold 4종, dark 6종, slate 6종)을 대표값으로 통합하면 primitive를 12~14개까지 줄일 수 있으나,
그 경우 **화면의 색 값도 대표값으로 맞춰야 한다**(화면 수정 발생).

## 결정 필요 사항 (사용자)

1. 근접 변형을 대표값으로 **통합**할지(화면 수정 필요, 팔레트 깔끔) vs 화면이 쓰는 값을 **그대로 토큰화**할지(수정 최소, 토큰 다소 많음).
2. 상태색(초록/앰버)을 기존 high/medium과 **통합**할지 별도 추가할지.
