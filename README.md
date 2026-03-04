# Prototype Monorepo

`프로토타입 퍼블리싱`, `프로토타입 A`, `프로토타입 B`를 **한 개 Git 저장소**에서 관리하기 위한 구조입니다.

## 구조

```text
prototype-monorepo/
  apps/
    prototype-publishing/   # 4473의 prototypes.html 대응
      index.html
    prototype-a/            # 4473 허브 + 프로토타입 A 게임 소스
      index.html
      games/
        neon-drift-core-survivor/
        highway-rush/
        echo-of-ruins/
    prototype-b/            # 4573 허브(30개 게임) 대응
      publishing/
      games/
      docs/
      tools/
  scripts/
    deploy.sh               # 서버 동기화 + pm2 재기동
```

## 매핑 규칙

- **프로토타입 퍼블리싱**: `:4473/prototypes.html` ← `apps/prototype-publishing/index.html`
- **프로토타입 A**: `:4473/index.html` ← `apps/prototype-a/index.html`
- **프로토타입 B**: `:4573/publishing/index.html` ← `apps/prototype-b/publishing/index.html`

## 사용법

### 1) Git 초기화

```bash
cd prototype-monorepo
git init
git add .
git commit -m "init: monorepo for prototype publishing/A/B"
```

### 2) 서버 반영

```bash
cd prototype-monorepo
bash scripts/deploy.sh
```

> 기본 타겟 서버: `<USER>@<HOST>`

## 참고

- 4473은 `urion-gamehub` 런타임(/home/ubuntu/apps/urion-gamehub-runtime) 기준
- 4573은 `game-factory-4573` 런타임(/home/ubuntu/apps/game-factory-runtime) 기준
- 개발 노하우/운영 문서는 `docs/knowledge/*_SANITIZED.md`에 정리 (민감정보 마스킹본)
