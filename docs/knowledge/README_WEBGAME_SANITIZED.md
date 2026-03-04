# URION WebGame 프로젝트 요약

## 프로젝트 개요
- 엔진/스택: **Phaser 3 + TypeScript + Vite**
- 서버: `<TAILNET_HOST>`
- 배포: **PM2**
- 게임: **Neon Drift: Core Survivor**

## 현재 기능
- 난이도 선택(EASY/NORMAL/HARD)
- 키보드 + 터치 입력
- 코어 수집/적 회피 기반 서바이벌 루프
- 파워업: Shield, Magnet
- 점수/생존시간/HP UI
- 게임오버/재시작
- 랭킹 저장 API 연동
- SFX + BGM(바리에이션 포함), `M`으로 사운드 토글

## 서버 구성
- 소스 원본: `/home/ubuntu/nas/home/Repo/Urion_Coder`
- 런타임 빌드: `/home/ubuntu/apps/urion-phaser-runtime`
- 웹 서버(PM2): `urion-phaser` (4173)
- API 서버(PM2): `urion-phaser-api` (4174)

## 실행/배포
```bash
ssh <USER>@<TAILNET_HOST> 'cd /home/ubuntu/nas/home/Repo/Urion_Coder && ./deploy.sh'
```

## 상태 확인
```bash
ssh <USER>@<TAILNET_HOST>
pm2 status
pm2 logs urion-phaser --lines 50
pm2 logs urion-phaser-api --lines 50
```

## 접속 주소
- 게임: `http://<TAILNET_HOST>:4173`
- API 헬스체크: `http://<TAILNET_HOST>:4174/health`
