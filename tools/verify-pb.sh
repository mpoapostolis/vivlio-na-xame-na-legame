#!/usr/bin/env bash
# Health check for the Άγιος Ανδρέας PocketBase integration.
#
# Verifies that the collections /book and /admin depend on are wired correctly:
#   • /api/health is reachable
#   • church_pages + church_animations are publicly readable and well-shaped
#   • file URLs for page photos serve actual image bytes
#   • (with PB_TOKEN) the `users` collection authenticates and authed reads work
#
# Usage:
#     bash tools/verify-pb.sh                 # public checks only
#     PB_TOKEN=… bash tools/verify-pb.sh      # + admin/auth checks
#     PB_URL=https://staging.example.com \
#         PB_TOKEN=… bash tools/verify-pb.sh  # custom instance
#
# Pure reads. No side effects on the PB instance. Idempotent.
#
# Exits 0 if every check passed, 1 otherwise.

set -uo pipefail

PB_URL="${PB_URL:-https://yms.galerra.art}"
PB_TOKEN="${PB_TOKEN:-}"

# Cloudflare in front of PB blocks default curl/python UAs (error 1010);
# pose as a real browser, same as tools/pb-seed.py.
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

# ANSI colors — disable if stdout is not a tty (e.g. piped to a file).
if [ -t 1 ]; then
  C_GREEN=$'\033[0;32m'
  C_RED=$'\033[0;31m'
  C_DIM=$'\033[2m'
  C_BOLD=$'\033[1m'
  C_RESET=$'\033[0m'
else
  C_GREEN='' C_RED='' C_DIM='' C_BOLD='' C_RESET=''
fi

PASS=0
FAIL=0
TOTAL=0

ok()   { printf '  %s✓%s %s\n'           "$C_GREEN" "$C_RESET" "$1"; PASS=$((PASS+1)); TOTAL=$((TOTAL+1)); }
bad()  { printf '  %s✗%s %s%s%s\n'        "$C_RED"   "$C_RESET" "$1" "${2:+ ${C_DIM}— $2${C_RESET}}" ""; FAIL=$((FAIL+1)); TOTAL=$((TOTAL+1)); }
hdr()  { printf '\n%s%s%s\n' "$C_BOLD" "$1" "$C_RESET"; }

# ---------------------------------------------------------------------------
# Low-level fetch helpers. We write the body to a temp file and capture the
# HTTP status + content-type from a header file, so a single curl invocation
# gives us everything we need to assert on.
# ---------------------------------------------------------------------------
TMPDIR_="$(mktemp -d -t verify-pb.XXXXXX)"
trap 'rm -rf "$TMPDIR_"' EXIT

# fetch <slot> <url> [auth?]   → writes body to $TMPDIR_/<slot>.body
#                                writes headers to $TMPDIR_/<slot>.headers
#                                echoes HTTP status code (000 on transport error)
fetch() {
  local slot="$1" url="$2" auth="${3:-}"
  local body="$TMPDIR_/$slot.body"
  local hdrs="$TMPDIR_/$slot.headers"
  local args=(-sS -L -o "$body" -D "$hdrs" -w '%{http_code}'
              -A "$UA"
              --max-time 15)
  [ -n "$auth" ] && args+=(-H "Authorization: $auth")
  # shellcheck disable=SC2086
  curl "${args[@]}" "$url" 2>/dev/null || echo 000
}

content_type() {
  # Grab the LAST content-type header (handles redirects), lowercase it.
  awk 'BEGIN{IGNORECASE=1} /^Content-Type:/ {v=$0} END{sub(/^[Cc]ontent-[Tt]ype:[ \t]*/,"",v); sub(/\r$/,"",v); print tolower(v)}' \
    "$TMPDIR_/$1.headers" 2>/dev/null
}

body_path() { echo "$TMPDIR_/$1.body"; }

# Pretty-print JSON path lookups via python3 — accepts dotted paths and
# [index] subscripts. Echoes the value (json-encoded for objects/arrays) or
# empty string + nonzero exit on miss.
jq_get() {
  local file="$1" path="$2"
  python3 - "$file" "$path" <<'PY'
import json, sys, re
path = sys.argv[2]
try:
    with open(sys.argv[1]) as f:
        data = json.load(f)
except Exception:
    sys.exit(1)
cur = data
for part in re.findall(r'[^.\[\]]+|\[[^\]]+\]', path):
    if part.startswith('['):
        idx = int(part[1:-1])
        if not isinstance(cur, list) or idx >= len(cur):
            sys.exit(1)
        cur = cur[idx]
    else:
        if not isinstance(cur, dict) or part not in cur:
            sys.exit(1)
        cur = cur[part]
if isinstance(cur, (dict, list)):
    print(json.dumps(cur, ensure_ascii=False))
else:
    print('' if cur is None else cur)
PY
}

# Predicate: does the JSON at $1 contain the substring $2 anywhere?
body_contains() { grep -Fq "$2" "$(body_path "$1")"; }

# Predicate: is the JSON value at <path> a non-empty list?
json_list_nonempty() {
  python3 - "$(body_path "$1")" "$2" <<'PY'
import json, sys, re
try:
    with open(sys.argv[1]) as f:
        data = json.load(f)
except Exception:
    sys.exit(1)
cur = data
for part in re.findall(r'[^.\[\]]+|\[[^\]]+\]', sys.argv[2]):
    if part.startswith('['):
        cur = cur[int(part[1:-1])]
    else:
        cur = cur[part]
sys.exit(0 if isinstance(cur, list) and len(cur) > 0 else 1)
PY
}

# ---------------------------------------------------------------------------
# Run.
# ---------------------------------------------------------------------------
printf '%sverify-pb%s  PB_URL=%s\n' "$C_BOLD" "$C_RESET" "$PB_URL"
if [ -n "$PB_TOKEN" ]; then
  printf '            PB_TOKEN=%s (auth checks enabled)\n' "***provided***"
else
  printf '            PB_TOKEN=%s (auth checks will be skipped)\n' "(unset)"
fi

# ──────────────────────────────────────────────────────────────────────────
hdr "PUBLIC HEALTH"

code=$(fetch health "$PB_URL/api/health")
if [ "$code" = "200" ] && body_contains health '"message":"API is healthy."'; then
  ok "GET /api/health → 200, message present"
else
  bad "GET /api/health → 200 with healthy message" "got HTTP $code"
fi

code=$(fetch pages "$PB_URL/api/collections/church_pages/records?perPage=1")
if [ "$code" = "200" ] && json_list_nonempty pages items; then
  ok "GET /collections/church_pages/records → 200 with ≥1 item"
else
  bad "GET /collections/church_pages/records → 200 with ≥1 item" "HTTP $code or empty items[]"
fi

code=$(fetch anims "$PB_URL/api/collections/church_animations/records?perPage=1")
if [ "$code" = "200" ] && json_list_nonempty anims items; then
  ok "GET /collections/church_animations/records → 200 with ≥1 item"
else
  bad "GET /collections/church_animations/records → 200 with ≥1 item" "HTTP $code or empty items[]"
fi

# Schema sanity on the first page record (only if the fetch above succeeded).
if json_list_nonempty pages items; then
  missing=""
  for field in order type label; do
    if ! jq_get "$(body_path pages)" "items[0].$field" > /dev/null 2>&1; then
      missing="$missing $field"
    fi
  done
  if [ -z "$missing" ]; then
    ok "church_pages[0] has order, type, label"
  else
    bad "church_pages[0] schema" "missing fields:$missing"
  fi
else
  bad "church_pages[0] schema" "no records to inspect"
fi

# Schema sanity on the first animation record.
if json_list_nonempty anims items; then
  missing=""
  for field in anim_name duration; do
    if ! jq_get "$(body_path anims)" "items[0].$field" > /dev/null 2>&1; then
      missing="$missing $field"
    fi
  done
  if ! json_list_nonempty anims 'items[0].tracks'; then
    missing="$missing tracks(array)"
  fi
  if [ -z "$missing" ]; then
    ok "church_animations[0] has anim_name, duration, tracks[]"
  else
    bad "church_animations[0] schema" "missing:$missing"
  fi
else
  bad "church_animations[0] schema" "no records to inspect"
fi

# ──────────────────────────────────────────────────────────────────────────
hdr "FILE URLS"

# Look for the first page that has a non-empty `photo` field. We fetch up to
# 50 records, since photos are only attached after admin uploads them and
# may not be on record #1.
code=$(fetch pages_for_photo "$PB_URL/api/collections/church_pages/records?perPage=50&fields=id,collectionId,photo")
if [ "$code" != "200" ]; then
  bad "page-with-photo lookup" "HTTP $code"
else
  read -r PHOTO_COLL PHOTO_REC PHOTO_FILE < <(python3 - "$(body_path pages_for_photo)" <<'PY'
import json, sys
with open(sys.argv[1]) as f:
    data = json.load(f)
for item in data.get("items", []):
    photo = item.get("photo")
    if photo:
        # PB returns single-file fields as a string filename.
        if isinstance(photo, list):
            photo = photo[0] if photo else ""
        if photo:
            print(item.get("collectionId",""), item.get("id",""), photo)
            break
PY
)
  if [ -z "${PHOTO_FILE:-}" ]; then
    ok "no page has a photo yet — file-URL check skipped (informational)"
  else
    code=$(fetch photo "$PB_URL/api/files/$PHOTO_COLL/$PHOTO_REC/$PHOTO_FILE")
    ct=$(content_type photo)
    case "$ct" in
      image/*)
        if [ "$code" = "200" ]; then
          ok "GET /api/files/.../$PHOTO_FILE → 200, Content-Type: $ct"
        else
          bad "GET /api/files/.../$PHOTO_FILE → 200" "HTTP $code, ct=$ct"
        fi
        ;;
      *)
        bad "GET /api/files/.../$PHOTO_FILE → image/*" "HTTP $code, ct=${ct:-<missing>}"
        ;;
    esac
  fi
fi

# ──────────────────────────────────────────────────────────────────────────
hdr "AUTH"

if [ -z "$PB_TOKEN" ]; then
  printf '  %s· skipping — PB_TOKEN not set%s\n' "$C_DIM" "$C_RESET"
else
  code=$(fetch users "$PB_URL/api/collections/users/records?perPage=1" "$PB_TOKEN")
  if [ "$code" = "200" ]; then
    ok "GET /collections/users/records (auth) → 200"
  else
    bad "GET /collections/users/records (auth) → 200" "HTTP $code"
  fi

  code=$(fetch pages_auth "$PB_URL/api/collections/church_pages/records?perPage=1" "$PB_TOKEN")
  if [ "$code" = "200" ] && json_list_nonempty pages_auth items; then
    ok "GET /collections/church_pages/records (auth) → 200 with items"
  else
    bad "GET /collections/church_pages/records (auth) → 200 with items" "HTTP $code"
  fi
fi

# ──────────────────────────────────────────────────────────────────────────
printf '\n%s%d of %d checks passed%s\n' \
  "$( [ "$FAIL" -eq 0 ] && echo "$C_GREEN" || echo "$C_RED" )" \
  "$PASS" "$TOTAL" \
  "$C_RESET"

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
