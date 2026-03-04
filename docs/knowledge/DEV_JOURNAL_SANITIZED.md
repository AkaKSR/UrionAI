# DEV_JOURNAL.md

이 문서는 앞으로 진행하는 개발 작업을 누적 기록하는 로그입니다.

## 기록 원칙
- 날짜/시간(Asia/Seoul)
- 무엇을 구현/수정했는지
- 왜 변경했는지(배경/문제)
- 검증 결과(빌드/배포/테스트)
- 다음 할 일(TODO)

---

## 2026-02-23

### 완료
- 서버 신규 프로젝트 구축(Phaser3 + TS + Vite)
- PM2 배포 파이프라인 구성
- 게임 핵심 루프 + 난이도 + 파워업 + 랭킹 API 구현
- UI 개선 및 클릭/씬 전환 이슈 대응
- SFX + BGM + BGM 바리에이션 적용

### 운영 메모
- NAS 경로는 소스 원본으로 사용
- 런타임 빌드/실행은 `/home/ubuntu/apps/urion-phaser-runtime` 사용(안정성)

### 다음 TODO
- 보스 웨이브/이벤트 시스템
- 랭킹 전용 UI 페이지
- 사운드 프리셋(신남/차분) 선택 옵션

## 2026-02-23 (신규 게임 2차)

### 프로젝트
- 이름: **Skyline Rush**
- 장르: 하이퍼캐주얼 레인 회피 러너
- 리서치 기반: 브라우저게임의 즉시접속/짧은 루프 강점 + 아케이드 스타일의 명확한 스킬 루프

### 구현 내용
- 새 프로젝트 생성: `/home/ubuntu/nas/home/Repo/Urion_SkylineRush`
- 스택: Phaser3 + TypeScript + Vite
- 핵심 메커닉:
  - 좌/우 레인 변경(키보드/터치)
  - 장애물 회피
  - 별 수집 보너스
  - 시간 경과에 따른 속도/스폰 난이도 증가
  - 충돌 시 게임오버 + R 재시작

### 배포
- 런타임: `/home/ubuntu/apps/urion-skylinerush-runtime`
- PM2 앱: `urion-skylinerush`
- 포트: `4273`
- 접속: `http://<TAILNET_HOST>:4273`

### 이슈/해결
- `setAllowGravity` 타입 오류(TS2551)
  - 해결: body를 `Phaser.Physics.Arcade.Body`로 캐스팅 후 `allowGravity=false` 설정

### Highway Rush 리브랜딩/연출 업데이트
- 게임명 변경: Skyline Rush → Highway Rush
- 차량 디자인 개선: 플레이어/적 차량 텍스처 디테일 업(유리/라이트)
- 사운드 추가:
  - 이동 SFX
  - 수집 SFX
  - 충돌 SFX
  - BGM 루프 + 섹션 바리에이션
- 사운드 제어: `M` 토글
- 진입 시 사용자 제스처 기반 오디오 unlock 처리

## 2026-02-23 (Highway Rush 고도화)

### 완료
- Skyline Rush를 **Highway Rush**로 리브랜딩
- 차량 디자인 강화 (플레이어/적 차량 디테일 텍스처)
- 오디오 시스템 추가
  - 이동/수집/충돌 SFX
  - BGM 루프 + 바리에이션
  - `M` 키 사운드 토글
- 입력/조작 안정화
  - 방향키 `JustDown` 적용으로 1칸 이동 보장
- 재시작 안정화
  - 게임오버 후 `R` 재시작 상태 초기화 로직 추가
- 난이도 재튜닝
  - 속도/스폰 증가 커브 강화
  - HUD에 Speed 표시 추가

### 운영 상태
- 앱: `urion-skylinerush`
- 포트: `4273`
- URL: `http://<TAILNET_HOST>:4273`
- 상태: PM2 online

### 교훈
- SSH 인라인 heredoc/python은 quoting 충돌 위험이 커서 단순한 파일 교체 방식 우선
- 런타임 이슈는 사용자 체감(조작감/재시작/난이도 가시화) 중심으로 빠르게 검증하는 게 효율적

## 2026-02-23 (신규 고난도 프로젝트: Metroidvania)

### 리서치 기반 기획 요약
- Metroidvania 핵심: 비선형 탐험 + 능력 획득에 따른 영역 개방 + 백트래킹 루프
- 레벨 디자인 핵심: 점진 난이도, 이동 퍼즐/동선 설계, 재방문 동기

### 프로젝트
- 제목: **Echo of Ruins**
- 장르: 2D 메트로바니아(프로토타입)
- 서버 경로: `/home/ubuntu/nas/home/Repo/Urion_MetroidEcho`
- 런타임: `/home/ubuntu/apps/urion-metroidecho-runtime`
- PM2 앱: `urion-metroidecho`
- 포트: `4373`

### 구현 내용
- 탐험형 맵(연결 구역 + 플랫폼 + 함정)
- 능력 게이팅
  - Wings(더블 점프)
  - Dash(대시)
- 백트래킹 목표: 두 유물을 얻고 시작 제단으로 복귀하면 클리어
- 커스텀 도트풍 캐릭터 텍스처 제작(참고 이미지와 동일 복제 금지 원칙 준수)
- 8-bit PCM 스타일 BGM
  - WebAudio AudioBuffer를 직접 샘플 생성
  - square/triangle/noise 레이어 합성
  - 8-bit quantization 적용

### 메모
- 기존 프로젝트들과 병행 운영(포트 분리)
- 이후 단계: 적 AI/공격 애니메이션/타격 판정, 맵 아트 고도화, 보스 구역
