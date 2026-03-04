#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="/home/ubuntu/nas/home/Repo/Urion_Coder"
BUILD_DIR="/home/ubuntu/apps/urion-phaser-runtime"
WEB_APP="urion-phaser"
API_APP="urion-phaser-api"
WEB_PORT="4173"
API_PORT="4174"

cd "$SRC_DIR"
if [ -d .git ]; then
  git pull --ff-only
else
  echo "[skip] git pull (.git not found)"
fi

rsync -a --delete --exclude node_modules --exclude dist "$SRC_DIR"/ "$BUILD_DIR"/

cd "$BUILD_DIR"
npm install
npm run build

pm2 delete "$WEB_APP" >/dev/null 2>&1 || true
pm2 serve "$BUILD_DIR/dist" "$WEB_PORT" --name "$WEB_APP" --spa

pm2 delete "$API_APP" >/dev/null 2>&1 || true
PORT="$API_PORT" pm2 start server/index.mjs --name "$API_APP"

pm2 save
pm2 status
