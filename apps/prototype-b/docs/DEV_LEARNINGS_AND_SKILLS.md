# DEV LEARNINGS & SKILLS LOG

작성일: 2026-02-27  
프로젝트: `game_factory` (Phaser 기반 30개 웹게임 + 퍼블리싱 허브)

---

## 1) 이번 개발에서 습득한 핵심 정보

### 프로젝트 구조 패턴
- 게임 단위 기본 구조:
  - `games/<slug>/index.html`
  - `games/<slug>/game.js`
- 퍼블리싱 단위 구조:
  - `publishing/index.html` (허브 UI)
  - `publishing/games.json` (메타 데이터)
  - `publishing/GAME_GUIDES.md` (게임별 1줄 가이드)
- 진행/기획 문서:
  - `docs/GAME30_PLAN.md`

### 운영/배포 정보
- 로컬 허브 포트: **4473**
- 정적 서빙 명령 예시:
  - `python3 -m http.server 4473 --directory /Users/harrykim/.openclaw/workspace-urioncoder/game_factory`
- 허브 접속 경로:
  - `/publishing/index.html`

### 안정성 관련 실전 포인트
- 일부 404(`apple-touch-icon*`)는 치명 오류가 아닐 수 있음.
- 치명 이슈는 보통 **프로세스 종료(SIGKILL)** 또는 **JS 문법 오류**.
- “게임이 안 된다” 이슈의 1차 점검 순서:
  1. 서버가 살아있는지(포트 응답)
  2. `index.html` 접근 200 여부
  3. `game.js` 문법 검사(`node --check`)

---

## 2) 개발 스킬(이번 세션에서 사용/강화)

### Phaser 3 빠른 프로토타이핑
- `Scene` 기반 게임 루프 구성 (`create/update`)
- Arcade Physics로 충돌/중력/속도 제어
- 그룹(`physics.add.group/staticGroup`)으로 적/오브젝트 관리
- 입력 통합:
  - 키보드(`createCursorKeys`, key binding)
  - 터치/포인터(`pointerdown`, `pointermove`, `pointerup`)

### 장르별 미니 구현 역량
- 회피/러너/브릭브레이커/탑다운 생존
- 간단 전략/디펜스/퍼즐/타이핑/아이들
- 각 장르별 “최소 재미 루프(MVP loop)”를 빠르게 구현

### 밸런싱 역량
- 난이도 곡선 조절 변수 분리:
  - 초반 속도, 증가량, 최대치(cap)
  - 보상 점수/자원 회복량
  - 클리어 목표치
- 체감 난이도 조정 원칙:
  - 초반 진입 장벽 완화
  - 후반 긴장감 유지(상한/가속 제어)

### 모바일 UX/입력 하드닝
- `touch-action:none`로 제스처 간섭 완화
- 터치 조작 가이드 오버레이 추가
- 포인터+키보드 동시 지원

### 퍼블리싱 허브 설계
- 카드형 목록 + 필터(전체/Tier A/Tier B/완료)
- 상태 배지(done/wip/todo), 티어 배지
- 통계(총 개수/완료 개수/티어 분포)
- 메타 파일(`games.json`) 분리로 자동화 확장 준비

### 디버깅/복구 스킬
- 다수 파일 문법 점검 자동화:
  - `for f in */game.js; do node --check "$f"; done`
- 일괄 치환 시 스크립트 파싱 리스크 인지
- 실패 시 빠르게 **파일 단위 재작성**으로 회복

---

## 3) 실제로 겪은 오류와 교훈

### 오류 A: 치환 스크립트 파싱 오류
- 증상: `Bareword found where operator expected ... near "6px"`
- 원인: `perl -pe` 인라인 치환 중 CSS 문자열 이스케이프/구문 충돌
- 교훈:
  - HTML/CSS 대량 수정은 복잡한 원라이너보다 파일 단위 `write/edit`가 안전

### 오류 B: 식별자 충돌로 JS 실행 실패
- 증상: `Identifier 'S' has already been declared`
- 원인: 상수 `S`(tile size)와 `class S` 이름 충돌
- 교훈:
  - 상수 네이밍은 `TILE/CELL`처럼 의미형으로 표준화
  - 배포 전 `node --check` 전체 자동 검사 필수

### 오류 C: 허브 프로세스 종료
- 증상: 허브 접속 불가, 세션 SIGKILL
- 교훈:
  - 앱 문제와 서버 프로세스 문제를 분리해서 점검해야 함
  - 접속 장애 시 서버 재기동 + HTTP 200 확인까지 한 세트로 처리

---

## 4) 표준 운영 체크리스트(재사용)

### 개발 완료 직후
1. `game.js` 문법 전체 검사
2. 허브 페이지 링크 유효성 확인
3. 최소 2~3개 대표 게임 실제 접속 테스트

### 장애 대응
1. 포트/서버 상태 확인
2. 문제 파일 문법/콘솔 오류 확인
3. 수정 후 재검증
4. 결과 리포트(원인/영향/조치/재발방지)

### 커뮤니케이션 원칙(이번 세션 반영)
- 오류 발생 시 기존 메시지 수정 금지
- 오류는 별도 리포트로 발행
- 완료 즉시 결과 중심 보고

---

## 5) 다음 개선 아이템(스킬 확장)
- 공통 유틸 레이어 분리 (`input`, `ui`, `difficulty`)
- 게임 공통 HUD 컴포넌트화
- 썸네일 자동 생성 파이프라인
- 빌드/테스트 자동화 스크립트 도입
- 허브에서 게임별 품질 지표(난이도, 세션 길이, 조작 난도) 시각화

---

## 6) 한 줄 요약
이번 작업으로 **Phaser 기반 대량 미니게임 제작 + 허브 퍼블리싱 + 운영/복구 자동 점검**까지 가능한 실전형 워크플로를 확립했다.
