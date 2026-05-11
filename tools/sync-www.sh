#!/usr/bin/env bash
# Copy the latest book.html + cms.html into www/ for Capacitor packaging.
# Run: bash tools/sync-www.sh   (or: npm run sync:www)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p www

# Entry point: index.html in the APK's webview is book.html
cp book.html www/index.html
cp cms.html  www/cms.html

# Make sure the assets symlink exists (so we don't bloat with double copies during dev)
if [ ! -e www/assets ]; then
  ln -s ../assets www/assets
fi

echo "✓ www/ synced — index.html, cms.html, assets/"
echo "  Now: npx cap sync android  (then ./gradlew assembleDebug from ./android/)"
