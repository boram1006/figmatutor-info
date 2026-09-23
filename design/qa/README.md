# QA 산출물 폴더

이 폴더는 **PRD 기반 QA 케이스와 coverage matrix**를 버전별로 보관한다.

## 구조

```
design/qa/
  README.md              ← 이 파일. 진입점.
  qa-schema.md           ← QA case 필드 정의 및 판정 기준
  releases/
    v1/
      qa-cases.yaml
      state-matrix.md
      permission-matrix.md
      open-questions.md
    v2/
    v3/
    v4/
    v5/
    ...
```

## 이 폴더와 design/operations/qa/ 의 차이

| 구분 | 이 폴더 (`design/qa/`) | `design/operations/qa/` |
|---|---|---|
| 목적 | PRD 기반 케이스 정의 · source traceability | 실제 QA 실행 결과 기록 (Pass/Fail/Skip) |
| 형식 | YAML + Markdown | Markdown 테이블 |
| 생성 시점 | PRD 확정 후 | QA 실행 전 |
| 주체 | Kiro (docs/qa-workflow.md 절차) | 사람 QA 담당 |

## 케이스 생성 방법

`docs/qa-workflow.md`의 절차를 따른다.
케이스 필드 정의는 `design/qa/qa-schema.md`를 참조한다.

## Source of Truth

모든 케이스는 아래 우선순위의 source를 가진다.

1. `design/operations/prd-*/PRD.md` — 릴리즈 PRD (역방향 복원 포함)
2. Figma 실제 화면
3. `design/02-structure/SITEMAP.md` — 권한·상태·의존관계
4. 명시적으로 확정된 프로젝트 문서

source 없는 케이스는 작성하지 않는다.
