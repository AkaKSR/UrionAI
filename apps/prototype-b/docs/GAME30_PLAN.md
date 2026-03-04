# GAME30 PLAN (Phaser / Mobile+PC Web / Publishing Hub :4473)

진행 기준: **B안** = 10개 완성도 높게 + 20개 프로토타입

## 장르 리서치 기반 30개 라인업

### 완성도 높게 개발할 10개 (Tier A)
1. Neon Dodger (생존 회피)
2. Brick Pulse (브레이크아웃 변형)
3. Dungeon Sprint (탑다운 로그라이트 액션)
4. Sky Hook (물리 스윙 액션)
5. Merge Alchemy (머지 퍼즐)
6. Rail Defender (라인 디펜스)
7. Orbit Miner (증분/아케이드 하이브리드)
8. Tiny Tactics (턴제 미니 전략)
9. Drift Loop (탑뷰 드리프트 레이서)
10. Rhythm Tap Runner (리듬+러너)

### 프로토타입 20개 (Tier B)
11. One-Button Ninja
12. Gravity Flip Maze
13. Color Chain Match
14. Pixel Fishing Idle
15. Shadow Stealth Rooms
16. Boss Pattern Trainer
17. Bullet Garden
18. Tower Stack Physics
19. Word Spell Blitz
20. Card Duel Lite
21. Portal Sokoban
22. Ice Slide Puzzles
23. Frog Hop Cross
24. Meteor Harvest
25. Robo Factory Conveyor
26. Hex Territory Grab
27. City Signal Control
28. Mini Golf Angles
29. Cannon Curve Shot
30. Cooking Rush Queue

---

## 구현 정책
- 공통 엔진: Phaser 3 (CDN)
- 입력: 터치 + 키보드 동시 지원
- 화면: 모바일 세로 우선 + PC 반응형
- 배포: Publishing Hub(로컬 4473)에서 읽기 쉬운 정적 구조

## 폴더 컨벤션
- `/game_factory/games/<slug>/index.html`
- `/game_factory/games/<slug>/game.js`
- `/game_factory/publishing/index.html` (허브에 수록할 메타 페이지)

## 현재 진행
- [x] 30개 기획 라인업 초안
- [x] 퍼블리싱 페이지 뼈대 생성
- [x] Tier A #1 Neon Dodger 구현
- [x] Tier A #2 Brick Pulse 구현
- [x] Tier A #3 Dungeon Sprint 구현
- [x] Tier A #4 Sky Hook 구현
- [x] Tier A #5 Merge Alchemy 구현
- [x] Tier A #6 Rail Defender 구현
- [x] Tier A #7 Orbit Miner 구현
- [x] Tier A #8 Tiny Tactics 구현
- [x] Tier A #9 Drift Loop 구현
- [x] Tier A #10 Rhythm Tap Runner 구현
- [x] Tier B #11 One-Button Ninja 구현
- [x] Tier B #12 Gravity Flip Maze 구현
- [x] Tier B #13 Color Chain Match 구현
- [x] Tier B #14 Pixel Fishing Idle 구현
- [x] Tier B #15 Shadow Stealth Rooms 구현
- [x] Tier B #16 Boss Pattern Trainer 구현
- [x] Tier B #17 Bullet Garden 구현
- [x] Tier B #18 Tower Stack Physics 구현
- [x] Tier B #19 Word Spell Blitz 구현
- [x] Tier B #20 Card Duel Lite 구현
- [x] Tier B #21 Portal Sokoban 구현
- [x] Tier B #22 Ice Slide Puzzles 구현
- [x] Tier B #23 Frog Hop Cross 구현
- [x] Tier B #24 Meteor Harvest 구현
- [x] Tier B #25 Robo Factory Conveyor 구현
- [x] Tier B #26 Hex Territory Grab 구현
- [x] Tier B #27 City Signal Control 구현
- [x] Tier B #28 Mini Golf Angles 구현
- [x] Tier B #29 Cannon Curve Shot 구현
- [x] Tier B #30 Cooking Rush Queue 구현

## 퍼블리싱/폴리싱 진행
- [x] 허브 UI 고도화(필터: 전체/TierA/TierB/완료)
- [x] 게임 카드 설명/통계/뱃지 추가
- [x] 배포 메타 파일 `publishing/games.json` 생성
- [x] 상위 10개 게임 난이도 밸런싱 1차 (6종 우선 적용)
- [x] 상위 10개 게임 모바일 UX 1차 개선 (터치 가이드/입력 안내)
- [x] 상위 10개 게임 밸런싱 2차 (잔여 4종)
- [x] 상위 10개 게임 터치 입력 하드닝 (스크롤/제스처 간섭 완화)
- [x] 퍼블리싱 가이드 문서(GAME_GUIDES.md) 추가
