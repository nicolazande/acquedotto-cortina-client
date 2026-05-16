#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOCAL_NODE="$ROOT_DIR/.tools/node-v20.18.1-linux-x64/bin"

if [[ -d "$LOCAL_NODE" ]]; then
    export PATH="$LOCAL_NODE:$PATH"
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "npm non trovato. Installa Node.js oppure usa il Node locale in $LOCAL_NODE." >&2
    exit 1
fi

cd "$SCRIPT_DIR"

if [[ ! -d node_modules ]]; then
    echo "Dipendenze client mancanti: eseguo npm install..."
    npm install
fi

echo "Avvio client su http://localhost:${PORT:-3000}"
npm start
