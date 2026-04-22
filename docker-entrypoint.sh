#!/bin/sh
set -e

# Apply pending Prisma migrations at container start.
# Idempotent: Prisma skips migrations already recorded in _prisma_migrations.
# Fails fast on migration error — we do NOT want Next.js serving against an
# out-of-date schema.
if [ -z "${DATABASE_URL:-}" ]; then
  echo "[entrypoint] DATABASE_URL is not set — skipping migrate deploy"
else
  echo "[entrypoint] prisma migrate deploy"
  node node_modules/prisma/build/index.js migrate deploy
fi

echo "[entrypoint] starting: $*"
exec "$@"
