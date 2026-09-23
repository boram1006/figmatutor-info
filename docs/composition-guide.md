# 컴포지션 가이드 — 기존 화면에서 추출한 배치 규칙

토큰(색·타이포·스페이싱)과 컴포넌트(Button/Tag)는 "단어"다. 이 문서는 그 단어로 **문장을 쓰는 법**,
즉 카드·배지·버튼 같은 조합 단위를 **기존 화면과 동일한 규칙으로** 구성하는 방법을 정리한다.

> 원칙: 값을 발명하지 않는다. 규칙은 **기존에 그려진(그리고 토큰에 바인딩된) 화면을 실측**해서 도출한다.
> 근거: `design/operations/rebind-v5/snapshot-v5.json`의 A-30 카드 `Card-PENDING`(1:23081)·`Card-SUBMITTED`(1:23104) 실측.
> 새로 그리는 조합은 raw hex를 쓰지 않고 **전부 semantic 토큰**에 바인딩한다(기존 화면엔 raw가 섞여 있으나 답습하지 않는다).

---

## 1. 지원서 카드 (A-30 "내 지원 현황")

기존 카드 실측 규칙. 모든 상태 변형이 이 골격을 공유한다.

### 컨테이너
- 크기: 폭 855(리스트 폭에 FILL), 높이 HUG(내용에 맞춤; 실측 ~154)
- auto-layout: **VERTICAL**, `padding 24`(전 방향), `itemSpacing 12`
- 모서리: `radius 16`
- 배경: `text-inverse`(흰색) — 카드 배경 토큰

### 4행 구조 (위→아래)
1. **Top** (HORIZONTAL): `Title`(제목, 강조색) + 우측 `⋯`(lucide/ellipsis 24×24 더보기)
2. **Metadata** (HORIZONTAL, `gap 8`, `padding-bottom 8`):
   - `Status Pill`: HORIZONTAL, `padding 4/8`, `radius 4`. 상태 배지.
   - 팀명 텍스트(`text-tertiary`)
   - 구분점 `·`(`text-disabled`)
   - 시간/일시 텍스트(`text-disabled`)
3. **Divider**: 높이 1, `background-surface`, 상하 `padding 12`(또는 위아래 여백으로 분리)
4. **Bottom** (HORIZONTAL): 좌측 상태 정보(진행률/문구) + 우측 진입 CTA(텍스트 링크형 `text-tertiary`, "… →")

### 상태별 변형 (Status Pill + Metadata 시간 + Bottom)
| 상태 | Status Pill | 보조칩 | Metadata 시간 | Bottom |
| --- | --- | --- | --- | --- |
| 본선 진행중·작성중 | "본선 진행중" (글자 `text-accent`, 배경 `background-subtle`) | — | "최종 수정 N시간 전" | 진행률 문구 + Step Badge "1/8"(글자 text-accent, 배경 background-subtle, r4) + Progress Bar(폭 120, h5, r3, 트랙 background-surface / fill text-accent) + "이어 작성하기 →" |
| 제출완료 | "제출완료" (글자 `status-success-s`, 배경 `background-surface`) | — | "제출일시 YY.MM.DD HH:MM:SS" | "제출 지원서에서 보기 →" |
| **제출완료·수정사항 미반영** (신규) | "제출완료" (글자 `status-success-s`, 배경 `background-surface`) | **"수정사항 미반영"** (글자 `text-accent`, 배경 `background-subtle`, r4, pad 4/8) | "최종 수정 N시간 전 · 재제출 필요" | "수정사항 제출하기 →" |
| 본선 미진출 | "본선 미진출" (글자 `text-disabled`, 배경 `background-surface`) | — | "제출일시 YY.MM.DD HH:MM:SS" | "제출 지원서 보기 →" |

- 배지·칩 텍스트는 작은 크기(`Text/caption` 또는 `Text/caption-medium`).
- Title은 `Text/body-lg`~`Text/h4` 계열(제목 강조), 메타/시간은 `Text/body-sm`~`Text/caption`.

---

## 2. 배지 / 칩 (Pill)

- 형태: HORIZONTAL auto-layout, `padding 4/8`, `radius 4`, HUG.
- 색 조합(상태색 규칙, SITEMAP §5와 일치):
  - 완료/성공 = 글자 `status-success-s`(Green) / 배경 `background-surface`(neutral surface, 현재 토큰 `#F3F4F6`)
  - 강조/경고/재제출 = 글자 `text-accent` / 배경 `background-subtle`(연적)
  - 진행중 = 글자 `text-accent`(Red 계열) / 배경 `background-subtle`
  - 미진출/비활성 = 글자 `text-disabled` / 배경 `background-surface`
- **주의:** 상태 의미는 badge의 semantic text/status token + label 조합으로 전달한다. `background-surface` 자체를 성공/Green 배경으로 해석하지 않는다.
- 텍스트 스타일: `Text/caption` 또는 `Text/caption-medium`.

---

## 3. 하단 제출 버튼 · 액션바 (A-32)

액션바: HORIZONTAL, 좌측 [← 이전] · 가운데 안내문 · 우측 [임시 저장](outline) + [주 CTA](primary).
주 CTA(제출 버튼) 상태값:

| 상태 | 라벨 | 배경/글자 | 활성 |
| --- | --- | --- | --- |
| 4종 미충족 | 최종 패키지 일괄 제출하기 → | 배경 `text-disabled` 계열 / 글자 `text-inverse` | 비활성 |
| 4종 충족 | 최종 패키지 일괄 제출하기 → | 배경 `text-accent`(Red primary) / 글자 `text-inverse` | 활성 |
| 제출완료·변경 없음 | 제출 완료됨 ✓ | 배경 `background-surface` / 글자 `status-success-s` | 비활성 + "N에 제출됨" |
| 제출 후 수정 (신규) | 변경사항 다시 제출하기 → | 배경 `text-accent` / 글자 `text-inverse` | 재활성 |
| 마감 이후 (신규) | 제출 마감됨 | 배경 `background-surface` / 글자 `text-disabled` + 잠금 아이콘 | 비활성 |

- 버튼: HORIZONTAL auto-layout, `padding 12/20` 내외, `radius`는 시스템 버튼 토큰(pill/r8~12), 텍스트 `Text/body-sm-semibold`.
- 상태색은 §2 조합 규칙을 그대로 따른다.

---

## 4. 새 조합을 그릴 때 절차

1. 같은 종류의 기존 요소를 `snapshot`에서 실측한다(`inspect-card.mjs`류 스크립트로 padding/gap/radius/스타일/색 바인딩 확인).
2. 골격(컨테이너 레이아웃·간격·라운드)은 그대로 재사용한다.
3. 상태가 바뀌는 부분(배지 색/문구·CTA·보조칩)만 §1~§3 표대로 교체한다.
4. 색은 raw hex 금지, **semantic 토큰**에 바인딩. 타이포는 `Text/*` 스타일.
5. `op:create`로 그리되, 기존 프레임에 붙일 땐 `parentId`로 섹션/부모를 지정한다.
6. 그린 뒤 재추출로 raw 잔존·미스타일이 없는지 검증한다(`rebind-existing-screen-workflow.md` 6절).
