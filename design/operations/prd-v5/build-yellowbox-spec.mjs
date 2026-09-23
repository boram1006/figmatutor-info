// Assembles an op:create spec that draws the v5 PRD yellow box as a child of the v5 section.
import { writeFileSync } from 'node:fs';

const SECTION_ID = '1:23008';
const FILE_KEY = 't00UvcVe1M6llSJFyXcDkG';

// helper builders --------------------------------------------------------
const T = (characters, textStyle, name) => ({ type: 'TEXT', name: name || textStyle, textStyle, characters });

// A heading + body paragraph group
function block(heading, body) {
  return [T(heading, 'Text/h3-bold', 'h:' + heading), T(body, 'Text/body-sm', 'b:' + heading)];
}

const children = [];
// Title
children.push(T('v5 릴리즈 PRD — 최종보고서 제출 (Final Report Submission)', 'Text/title', 'title'));
children.push(T('본선 진출 팀이 최종 기획·개발 보고서를 8개 섹션 단계별 폼으로 작성하고, 마지막 9번째 단계에서 발표자료·데모·소스코드를 하나의 패키지로 최종 제출하는 흐름. 화면: A-30 내 지원 현황 / A-31 최종보고서 스텝 폼 / A-32 최종 심사 제출 패키지. 선행 의존: v3 지원 흐름·상태 머신, v4 1차 합격 발표(본선 진출 판정).', 'Text/body', 'lead'));

// A-30
children.push(T('A-30 · 내 지원 현황 (최종보고서 진입점)', 'Text/h2', 'a30'));
children.push(...block('진입/개요', '마이페이지 → 내 지원 현황 탭. 본선 진출 지원서가 있으면 최종보고서 작성 카드 노출. 상단 안내 배너: "10월 16일까지 제출을 완료해주세요. 제출완료 이후에도 접수 마감 전까지는 수정 가능합니다."'));
children.push(...block('상태 머신', '최종보고서 제출은 명시적 완결 이벤트다. 상태: 본선 진행중·작성중(Red, 진행률 1/8) / 제출완료(Green, 제출일시) / 제출완료·수정사항 미반영(Green+Red 보조칩, 재제출 필요) / 본선 미진출(Gray). 전이: 1차 합격 발표→작성중, 일괄 제출→제출완료, 제출 후 수정→수정사항 미반영, 재제출→제출완료(일시 갱신), 마감(10/16 24:00)→전체 잠금. 자동 반영 아님.'));
children.push(...block('상태별 UI', '본선 진행중: [이어 작성하기 →]. 제출완료: [제출 내용 보기 →]. 수정사항 미반영: [수정사항 제출하기 →] + "재제출 필요". 본선 미진출: [제출 지원서 보기 →]. (배지 라벨은 잠정값)'));
children.push(...block('표기/레이아웃', '상대시간 "N시간 전"(7일↑ YYYY.MM.DD), 제출일시 YY.MM.DD HH:MM:SS, 진행률 배지 현재/전체(1/8). 카드형 리스트, 우상단 [⋯], 우하단 진입 CTA.'));

// A-31
children.push(T('A-31 · 최종보고서 스텝 폼', 'Text/h2', 'a31'));
children.push(...block('개요/진입', '좌: "지원서 항목" 스텝 네비(9개) + "8개 항목을 빠짐없이 작성해 주세요." / 우: 현재 섹션 폼(헤더 "SECTION n / 8"). A-30 [이어 작성하기]로 마지막 위치 진입, [← 내 지원 현황] 복귀.'));
children.push(...block('스텝 상태', '아이콘 3종: 완료=보라 ✔ / 미완료·현재=회색 번호 / 9단계=회색 9 + "4종 통합"(Red)와 하위 4항목 상태. 9개 스텝: 1 기본 정보 · 2 서비스 정의 · 3 문제정의 · 4 AI서비스 구성계획 · 5 신규 메뉴 · 6 활용 Data 및 연동시스템 · 7 확대전개 가능성 · 8 기대효과 · 9 최종 심사 제출 패키지.'));
children.push(...block('표기/레이아웃', '섹션 헤더 "SECTION n / 8"(Red). 팀원 테이블 컬럼: 구분/이름/직급/본부/팀/이메일/역할. 구분=리더(Red)/팀원1/팀원2, 역할 배지=기획/개발. 2단 레이아웃(좌 네비 고정 + 우 폼). 우하단 [다음 →](Red).'));
children.push(...block('스코프 노트', 'SECTION 2~8 내부 폼 필드 구성은 디자인에서 스킵(스텝 네비 섹션명·상태만 다룸). 항목별 필수/선택 규칙도 스킵하며 별도 전달. 화면엔 "8개 항목 빠짐없이 작성" 안내만 유지.'));

// A-32
children.push(T('A-32 · 최종 심사 제출 패키지 (SECTION 9/9)', 'Text/h2', 'a32'));
children.push(...block('개요', '헤더 "SECTION 9 / 9". 설명: 최종 보고서 + 발표자료(PDF) + 데모 링크 + 소스코드를 하나의 패키지로 묶어 최종 제출. "최종 제출 패키지 4종 구성 현황" + 4개 카드(2×2) + 마감 경고 배너 + 하단 액션바.'));
children.push(...block('4종 구성', '1 기획/개발 최종 보고서: [최종 보고서 확인]=SECTION 1~8 내용을 팝업 모달 뷰어(읽기 전용)로 통합 제공 / [발표 자료 초안 생성(.pptx)]=AI가 1~8 입력 근거로 초안 생성→구성요소2 등록 후보. 2 발표 자료(PDF): 완료=파일 카드(18.4MB, 미리보기), 미완료=드롭존 "최대 50MB · PDF 파일만". 3 서비스 데모 URL: URL + [테스트 ↗]. 4 소스코드 저장소: 사내 GitLab URL + [저장소 ↗].'));
children.push(...block('제출 후 수정 정책 (확정·재제출 모델)', '최종 제출은 [최종 패키지 일괄 제출하기]라는 명시적 완결 액션으로만 이뤄진다. 제출 후에도 마감(10/16 24:00) 전까지 각 항목 수정 가능하나, 수정분은 [변경사항 다시 제출하기]로 재제출해야 심사 반영(자동 반영 아님). 재제출 전까지 "제출완료·수정사항 미반영". 마감 시 전체 잠금, 마지막 제출본이 최종본.'));
children.push(...block('하단 제출 버튼 상태값', '최초 제출 전(4종 미충족)=비활성 / 4종 충족=활성 "최종 패키지 일괄 제출하기 →". 제출 완료·변경 없음=비활성 "제출 완료됨 ✓" + "N에 제출됨". 제출 후 수정=재활성 "변경사항 다시 제출하기 →". 마감 이후=비활성 "제출 마감됨"(잠금). [임시 저장]은 항시 가능(제출완료로 안 바꿈).'));
children.push(...block('표기/레이아웃', '파일 크기 18.4MB 형식, 완료=Green "✔ 완료" / 미등록=Gray "미등록", 외부 링크 [↗]. 4종 카드 2×2, 마감 경고 배너(Red 계열, D-day). 카드별 인라인 액션.'));

// 공통/의존
children.push(T('릴리즈 공통 규칙 · 의존관계', 'Text/h2', 'common'));
children.push(...block('공통 규칙', '배지색: 완료/접수완료=Green · 진행중=Red 계열 · 미제출/미등록=Gray. 상대시간 방금 전/N분·시간·일 전/7일↑ 날짜. 상단 네비: 홈/지원하기/공지사항/FAQ/로그인·마이페이지(우측 Red CTA). 로딩=스켈레톤, 에러 문구 + [다시 시도], 빈상태 문구 + CTA.'));
children.push(...block('의존관계', '제출 마감(10/16 24:00) 변경→A-30 배너·A-32 경고·제출 활성 조건. 본선 진출 판정(v4)→A-30 카드 노출·상태. 8개 섹션 구성→A-31 네비·A-32 보고서 파트 수. 패키지 4종 요건→A-32 제출 게이트·완료 판정.'));

// note
children.push(T('※ 이 PRD는 기존 v5 화면을 근거로 역방향 복원한 것이다. 화면 확인값은 그대로, 관례 기본값은 [기본값]으로 표기했다. 화면 ID·스텝 넘버링(A-30~32)은 잠정값으로 전체 재검토 예정.', 'Text/caption', 'note'));

const spec = {
  op: 'create',
  fileKey: FILE_KEY,
  pageName: 'design',
  nodes: [
    {
      type: 'FRAME',
      name: 'v5 PRD (노란 박스)',
      parentId: SECTION_ID,
      width: 900,
      height: 3020,
      layout: { mode: 'VERTICAL', primaryAxisSizingMode: 'AUTO', counterAxisSizingMode: 'FIXED' },
      metrics: { paddingTop: 48, paddingRight: 48, paddingBottom: 48, paddingLeft: 48, itemSpacing: 20 },
      fills: [{ type: 'SOLID', color: '#FFCC00', binding: 'accent-yellow' }],
      children: children.map((c) => ({ ...c, fills: [{ type: 'SOLID', color: '#111111', binding: 'text-primary' }], layoutSizingHorizontal: 'FILL' })),
      metadata: { role: 'prd-note', release: 'v5', screenId: 'v5-prd-yellowbox' },
    },
  ],
};

writeFileSync(new URL('./spec-create-yellowbox.json', import.meta.url), JSON.stringify(spec, null, 2));
console.log('written spec-create-yellowbox.json | children', children.length);
