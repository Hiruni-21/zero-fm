#!/bin/sh
# Builds the plain-files copy of the site for Hostinger into hostinger-site.zip.
# The /api routes stay on Cloudflare, so they are set aside during this build.
set -e
API_BASE="${API_BASE:-https://zero-fm.zerofm.workers.dev}"
ASIDE="$(mktemp -d)"
mv app/api "$ASIDE/api"
trap 'mv "$ASIDE/api" app/api; rmdir "$ASIDE"' EXIT
rm -rf out
STATIC_EXPORT=1 NEXT_PUBLIC_API_BASE="$API_BASE" npx next build
rm -f hostinger-site.zip
(cd out && zip -qr ../hostinger-site.zip .)
echo "Done: hostinger-site.zip"
