# TB-01 Visual Rule Analysis

Source: `snapshot-tb01.json`  
Frame: `TB-01_team-list__recruiting_H2`  
Resolved nodeId: `1:21543`  
Archetype: A3 / 탐색형

## 공통 visual composition rule

A-30/31/32에서 보인 규칙과 TB-01에서도 반복되는 것:

- 주요 desktop content rail은 1440 화면에서 좌우 120px을 기준으로 1200px 폭을 사용한다.
- 큰 정보 단위는 단순 텍스트 나열보다 surface/outline으로 grouping한다.
- 외곽 카드 radius는 주로 16px.
- 카드 내부 secondary block은 12px radius + subtle background를 사용한다.
- 주요 카드 padding은 24px.
- 카드/그룹 사이 vertical/horizontal gap은 20~24px 계열이 반복된다.
- badge/tag는 4px/8px padding의 작은 pill 형태를 사용한다.
- 흰 surface + border-default 계열을 기본으로 쓰고, 내부 grouping에서 subtle background를 사용한다.
- Header/navigation은 별도 white surface + border로 화면 본문과 분리한다.
- 정보 hierarchy는 title/lead → grouped summary/notice → main content cards → internal secondary blocks 순서로 만든다.

## TB-01 특화 규칙

- Header는 1440px 폭, 실제 높이 81px. 내부 좌우 padding은 120px.
- Hero 영역은 별도 white section이며 중앙 정렬.
  - top padding 80px
  - title은 54/60/600의 큰 display/title 스타일
  - intro copy는 중앙 정렬
- 본문 주요 rail은 1200px.
- benefit summary section:
  - 1200px 폭
  - padding 32px 40px
  - radius 16px
- team card grid:
  - 3 columns
  - card width 384px
  - column gap 24px
- team card:
  - white surface
  - 24px padding
  - radius 16px
  - default border
  - selected/active state는 accent/negative 계열 stroke로 강조
- team card 내부 모집 포지션 block:
  - subtle background
  - padding 20px 12px 12px
  - radius 12px
  - gap 12px
- top status/category tags:
  - 4px 8px padding
  - full pill radius
  - caption 12/16
- action buttons:
  - 8px 16px padding
  - full pill radius
  - 14px medium text

## A-30/31/32와 비교

### 공통
- 1200px content rail
- 24px 전후의 main grouping spacing
- 16px outer card radius
- 12px internal block radius
- 24px card padding
- white outlined surface를 기본 container로 사용
- subtle background는 nested grouping에 사용
- small badge/pill은 4/8 padding 계열

### 화면군 특화
- A3(TB-01): hero + summary + multi-column browse cards
- A4(A-30): sidebar + body의 status/workflow layout
- A5(A-31): large editing surface
- A9(A-32): submission/package 내부 block 중심

## Harness implication

Stitch composition을 기존 자산 문법으로 변환할 때 A-30의 sidebar 구조를 일반화하면 안 된다.

대신 공통 규칙은 다음 레이어로 취급해야 한다:

1. page/content rail
2. primary white outlined surface
3. nested subtle block
4. 16 / 12 radius hierarchy
5. 24px primary padding
6. 20~24px section/card gap
7. 4/8 badge/tag padding

그리고 archetype별 composition은 별도로 유지한다.

TB-01은 A-30/31/32 편향을 깨는 첫 증거이며, 기존 자산의 공통 rule이 특정 마이페이지 layout이 아니라 surface/grouping hierarchy에 있다는 것을 확인한다.
