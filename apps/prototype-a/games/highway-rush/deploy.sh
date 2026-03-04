#!/usr/bin/env bash
set -euo pipefail
SRC="/home/ubuntu/nas/home/Repo/Urion_SkylineRush"
RUN="/home/ubuntu/apps/urion-skylinerush-runtime"
APP="urion-skylinerush"
PORT="4273"
rsync -a --delete --exclude node_modules --exclude dist "$SRC"/ "$RUN"/
cd "$RUN"
npm install
npm run build
pm2 delete "$APP" >/dev/null 2>&1 || true
pm2 serve "$RUN/dist" "$PORT" --name "$APP" --spa
pm2 save
pm2 status "$APP"
