# WebGame Development Experience Log (2026-02-23)

## 1) 프로젝트 개요
- 목표: 서버에서 **Phaser 3 + TypeScript + Vite** 기반 웹게임 신규 구축 및 배포
- 서버: `<TAILNET_HOST>`
- 프로젝트 소스 경로(원본): `/home/ubuntu/nas/home/Repo/Urion_Coder`
- 런타임/빌드 경로(안정 운영): `/home/ubuntu/apps/urion-phaser-runtime`
- 프로세스 매니저: `pm2`

---

## 2) 구현/배포 결과

### 게임 컨셉
- 제목: **Neon Drift: Core Survivor**
- 장르: 아케이드 서바이벌 + 로그라이트 요소
- 핵심 루프: 이동 → 코어 수집 → 적 회피 → 생존 시간/점수 경쟁

### 주요 기능
- 난이도 선택(EASY/NORMAL/HARD)
- 키보드 + 터치 입력 지원
- 점수/시간/HP UI
- 파워업 2종
  - Shield: 피격 무효 시간
  - Magnet: 코어 흡착
- 게임오버/재시작
- 랭킹 API 저장 및 조회(난이도별)

### 사운드/이펙트
- SFX: 코어 획득, 피격, 파워업, 게임오버
- BGM: WebAudio 기반 루프 + 바리에이션(섹션 전환)
- 사운드 토글: `M`

### 서비스 구성
- Web: `urion-phaser` (4173)
- API: `urion-phaser-api` (4174)
- 배포 스크립트: `deploy.sh` (소스 동기화 → install/build → pm2 재기동)

---

## 3) 트러블슈팅 기록 (핵심)

### A. NAS 경로 파일시스템 이슈
- 증상: `Resource temporarily unavailable`, `TAR_ENTRY_ERROR EAGAIN`
- 원인: NAS 마운트 경로에서 대량 파일(`node_modules`) 처리 불안정
- 해결: 소스 원본은 NAS 유지, 빌드/실행은 로컬 디스크 런타임 경로 사용

### B. 메뉴 난이도 선택 후 검은 화면
- 증상: 난이도 클릭 시 게임 진입 실패
- 원인 후보: Scene key/입력 이벤트/인터랙션 처리 불안정
- 해결:
  - `GameScene` key 명시
  - 버튼 인터랙션 강화(박스+텍스트, down/up 처리)
  - 단축키 우회 및 쿼리 진입(`?play=...`) 제공

### C. BGM 미재생 (Chrome)
- 증상: 효과음은 나오나 배경음악이 안 나오는 케이스
- 원인: 브라우저 autoplay/unlock 타이밍 + 낮은 BGM 레벨
- 해결:
  - 사용자 제스처 시점에 오디오 unlock
  - BGM start safeguard 추가
  - 볼륨/패턴 조정 및 바리에이션 확장

### D. 작업 중 쉘 파싱 에러
- 증상: `zsh: parse error near ')'`
- 원인: SSH 문자열 내 heredoc/python 인라인 조합 시 quoting 충돌
- 개선 원칙:
  - 복잡한 패치는 `cat <<'EOF'` 전체 파일 교체 우선
  - 인라인 python/heredoc 최소화

---

## 4) 운영 체크리스트

### 상태 확인
```bash
ssh <USER>@<TAILNET_HOST>
pm2 status
pm2 logs urion-phaser --lines 50
pm2 logs urion-phaser-api --lines 50
```

### 수동 배포
```bash
ssh <USER>@<TAILNET_HOST> 'cd /home/ubuntu/nas/home/Repo/Urion_Coder && ./deploy.sh'
```

### 접속
- 게임: `http://<TAILNET_HOST>:4173`
- API 헬스: `http://<TAILNET_HOST>:4174/health`

---

## 5) 회고
- 초기 구축부터 배포 자동화, 입력/씬 버그, NAS 이슈, 오디오 정책 이슈까지 실제 운영형 문제를 빠르게 순차 해결함.
- 현재는 **실행 안정성 + 플레이성 + 사운드 연출 + 랭킹 연동**까지 갖춘 상태.
- 다음 확장 후보: 보스 웨이브, 정식 BGM 파일(OGG/MP3) 파이프라인, 랭킹 UI 전용 페이지.
