#!/usr/bin/env bash
set -euo pipefail

NGROK_AUTHTOKEN="${NGROK_AUTHTOKEN:-REDACTED}"
PORT="${PORT:-4096}"
URL_FILE="$HOME/.opencode-web-url"

C_INFO='\033[1;36m'; C_OK='\033[1;32m'; C_WARN='\033[1;33m'; C_ERR='\033[1;31m'; C_RST='\033[0m'
log()  { printf "${C_INFO}[start]${C_RST} %s\n" "$*"; }
ok()   { printf "${C_OK}[ ok ]${C_RST} %s\n" "$*"; }
warn() { printf "${C_WARN}[warn]${C_RST} %s\n" "$*"; }
err()  { printf "${C_ERR}[erro]${C_RST} %s\n" "$*" >&2; }

cleanup() {
  echo
  warn "encerrando serviços..."
  [ -n "${NGROK_PID:-}" ] && kill "$NGROK_PID" 2>/dev/null || true
  [ -n "${WEB_PID:-}"   ] && kill "$WEB_PID"   2>/dev/null || true
  pkill -f "ngrok " 2>/dev/null || true
  pkill -f "opencode web" 2>/dev/null || true
  rm -f "$URL_FILE"
  ok "tudo parado. até logo."
  exit 0
}
trap cleanup INT TERM

print_banner() {
  local url="$1"
  echo
  echo "==============================================================="
  printf "  ${C_OK}OPENCODE WEB ATIVO${C_RST}\n"
  echo "==============================================================="
  printf "  ${C_WARN}URL PÚBLICA:${C_RST} %s\n" "$url"
  echo "  local:        http://localhost:$PORT"
  echo "  ngrok admin:  http://localhost:4040"
  echo "  url salva em: $URL_FILE"
  echo "---------------------------------------------------------------"
  echo "  sessões salvas em ~/.local/share/opencode (persistem entre runs)"
  echo "  pra ver mesmas conversas: acesse a URL e selecione a sessão"
  echo "  pressione Ctrl+C para parar tudo"
  echo "==============================================================="
  echo
}

get_ngrok_url() {
  curl -s --max-time 2 http://localhost:4040/api/tunnels 2>/dev/null \
    | python3 -c 'import sys,json
try:
  d=json.load(sys.stdin)
  print(d["tunnels"][0]["public_url"])
except Exception:
  pass' 2>/dev/null || true
}

wait_port() {
  local port="$1" tries="${2:-20}"
  for ((i=1;i<=tries;i++)); do
    ss -tln 2>/dev/null | grep -q ":$port " && return 0
    sleep 1
  done
  return 1
}

start_web() {
  log "subindo opencode web em 0.0.0.0:$PORT..."
  nohup opencode web --hostname 0.0.0.0 --port "$PORT" \
    >/tmp/opencode-web.log 2>&1 </dev/null &
  WEB_PID=$!
  if wait_port "$PORT" 25; then
    ok "opencode web pronto (pid $WEB_PID)"
  else
    err "opencode web não subiu. veja /tmp/opencode-web.log"
    tail -20 /tmp/opencode-web.log >&2
    exit 1
  fi
}

start_ngrok() {
  log "subindo túnel ngrok para porta $PORT..."
  nohup ngrok http "$PORT" --log=/tmp/ngrok.log \
    >/tmp/ngrok.out 2>&1 </dev/null &
  NGROK_PID=$!
  local url=""
  for ((i=1;i<=20;i++)); do
    sleep 1
    url="$(get_ngrok_url)"
    [ -n "$url" ] && break
  done
  if [ -z "$url" ]; then
    err "ngrok não retornou URL pública. veja /tmp/ngrok.log"
    tail -20 /tmp/ngrok.log >&2
    exit 1
  fi
  echo "$url" > "$URL_FILE"
  ok "ngrok pronto (pid $NGROK_PID) → $url"
  PUBLIC_URL="$url"
}

# === instalação ===
log "1/4 verificando ngrok..."
if ! command -v ngrok >/dev/null 2>&1; then
  log "instalando ngrok..."
  curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
    | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
    | sudo tee /etc/apt/sources.list.d/ngrok.list >/dev/null
  sudo apt-get update -qq
  sudo apt-get install -y ngrok
fi
ok "ngrok: $(ngrok version | head -1)"

log "2/4 configurando authtoken..."
ngrok config add-authtoken "$NGROK_AUTHTOKEN" >/dev/null
ok "authtoken salvo"

log "3/4 limpando processos antigos..."
pkill -f "ngrok " 2>/dev/null || true
pkill -f "opencode web" 2>/dev/null || true
sleep 2
ok "limpo"

log "4/4 iniciando serviços..."
start_web
start_ngrok

print_banner "$PUBLIC_URL"

# === monitor ===
log "monitorando serviços (Ctrl+C para parar)..."
echo
LAST_BANNER_TS=$(date +%s)
while true; do
  if ! kill -0 "$WEB_PID" 2>/dev/null; then
    err "opencode web caiu! reiniciando..."
    start_web
  fi
  if ! kill -0 "$NGROK_PID" 2>/dev/null; then
    err "ngrok caiu! reiniciando..."
    start_ngrok
    print_banner "$PUBLIC_URL"
  fi
  # checa se URL ainda válida
  CUR_URL="$(get_ngrok_url)"
  if [ -n "$CUR_URL" ] && [ "$CUR_URL" != "$PUBLIC_URL" ]; then
    PUBLIC_URL="$CUR_URL"
    echo "$PUBLIC_URL" > "$URL_FILE"
    warn "URL mudou: $PUBLIC_URL"
  fi
  # rebanner a cada 5 min
  NOW=$(date +%s)
  if (( NOW - LAST_BANNER_TS >= 300 )); then
    print_banner "$PUBLIC_URL"
    LAST_BANNER_TS=$NOW
  fi
  sleep 10
done
