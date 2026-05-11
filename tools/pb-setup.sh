#!/usr/bin/env bash
# Idempotent setup for the Άγιος Ανδρέας PocketBase collections.
# Run once: bash tools/pb-setup.sh
# Re-running is safe — it skips existing collections.

set -euo pipefail
PB_URL="${PB_URL:-https://yms.galerra.art}"
PB_TOKEN="${PB_TOKEN:?must set PB_TOKEN env}"

auth() { echo "Authorization: $PB_TOKEN"; }

exists() {
  local name="$1"
  curl -sf -H "$(auth)" "$PB_URL/api/collections/$name" > /dev/null 2>&1
}

create_collection() {
  local payload="$1"
  curl -sf -X POST -H "$(auth)" -H 'Content-Type: application/json' \
    --data "$payload" "$PB_URL/api/collections" \
    | python3 -c "import sys,json; r=json.load(sys.stdin); print('  ✓ created:', r['name'])"
}

# NOTE: CMS authentication uses the existing `users` collection on the PB
# instance. No church-specific auth collection is created here.
# Write rules on church_pages / church_animations restrict mutations to
# tokens issued from `users` only.

# ---------------------------------------------------------------------------
# 1) church_pages — content per logical page (16 entries; 2 sides × 8 sheets)
# ---------------------------------------------------------------------------
if exists church_pages; then
  echo "• church_pages already exists — skipping"
else
  echo "• creating church_pages"
  create_collection "$(cat <<'JSON'
{
  "name": "church_pages",
  "type": "base",
  "fields": [
    { "name": "order",         "type": "number", "unique": true, "min": 0, "onlyInt": true },
    { "name": "type",          "type": "select", "maxSelect": 1, "values": ["cover","page","back-cover"] },
    { "name": "label",         "type": "text",   "required": true, "max": 100 },
    { "name": "eyebrow",       "type": "text",   "max": 100 },
    { "name": "title",         "type": "text",   "max": 200 },
    { "name": "date",          "type": "text",   "max": 100 },
    { "name": "lead",          "type": "editor"  },
    { "name": "body",          "type": "editor"  },
    { "name": "photo",         "type": "file",   "maxSelect": 1, "maxSize": 15728640, "mimeTypes": ["image/jpeg","image/png","image/webp","image/gif"] },
    { "name": "photo_title",   "type": "text",   "max": 200 },
    { "name": "photo_cap",     "type": "text",   "max": 200 },
    { "name": "photo_desc",    "type": "editor"  },
    { "name": "photo_italic",  "type": "text",   "max": 200 },
    { "name": "narration",     "type": "file",   "maxSelect": 1, "maxSize": 20971520, "mimeTypes": ["audio/mpeg","audio/mp3","audio/wav","audio/ogg"] },
    { "name": "photo_audio",   "type": "file",   "maxSelect": 1, "maxSize": 20971520, "mimeTypes": ["audio/mpeg","audio/mp3","audio/wav","audio/ogg"] },
    { "name": "locked_fields", "type": "json"    }
  ],
  "listRule":   "",
  "viewRule":   "",
  "createRule": "@request.auth.collectionName = 'users'",
  "updateRule": "@request.auth.collectionName = 'users'",
  "deleteRule": "@request.auth.collectionName = 'users'"
}
JSON
)"
fi


echo
echo "Done."
