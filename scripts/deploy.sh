#!/usr/bin/env bash
set -euo pipefail

SERVER="${SERVER:-ubuntu@arm4core.tail85f433.ts.net}"
A_RUNTIME="/home/ubuntu/apps/urion-gamehub-runtime"
B_RUNTIME="/home/ubuntu/apps/game-factory-runtime"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[1/3] Sync prototype publishing + A -> ${SERVER}:${A_RUNTIME}"
rsync -az --delete "${ROOT_DIR}/apps/prototype-a/" "${SERVER}:${A_RUNTIME}/"
scp "${ROOT_DIR}/apps/prototype-publishing/index.html" "${SERVER}:${A_RUNTIME}/prototypes.html"

echo "[2/3] Sync prototype B -> ${SERVER}:${B_RUNTIME}"
rsync -az --delete "${ROOT_DIR}/apps/prototype-b/" "${SERVER}:${B_RUNTIME}/"

echo "[3/3] Restart PM2 services"
ssh "${SERVER}" '
  pm2 restart urion-gamehub >/dev/null
  pm2 restart game-factory-4573 >/dev/null
  pm2 save >/dev/null
  echo "A:" $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4473/index.html)
  echo "Publishing:" $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4473/prototypes.html)
  echo "B:" $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4573/publishing/index.html)
'

echo "Done."
