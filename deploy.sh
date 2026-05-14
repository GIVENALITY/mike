#!/bin/bash
set -e

GREEN='\033[1;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

MIKE_DIR="/var/www/mike"

# ── 1. Node.js ────────────────────────────────────────────────────────────────
printf "${GREEN}Checking Node.js...${NC}\n"
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  printf "${YELLOW}Installing Node.js 20...${NC}\n"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v && npm -v

# ── 2. PM2 ────────────────────────────────────────────────────────────────────
printf "${GREEN}Checking PM2...${NC}\n"
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi

# ── 3. Clone / pull ───────────────────────────────────────────────────────────
printf "${GREEN}Cloning Mike...${NC}\n"
if [ -d "$MIKE_DIR" ]; then
  cd "$MIKE_DIR" && git pull
else
  sudo git clone https://github.com/GIVENALITY/mike.git "$MIKE_DIR"
  sudo chown -R "$USER:$USER" "$MIKE_DIR"
  cd "$MIKE_DIR"
fi

# ── 4. Install dependencies ───────────────────────────────────────────────────
printf "${GREEN}Installing backend dependencies...${NC}\n"
npm install --prefix "$MIKE_DIR/backend"

printf "${GREEN}Installing frontend dependencies...${NC}\n"
npm install --prefix "$MIKE_DIR/frontend"

# ── 5. Build frontend ─────────────────────────────────────────────────────────
printf "${GREEN}Building frontend...${NC}\n"
npm run build --prefix "$MIKE_DIR/frontend"

# ── 6. PM2 services ───────────────────────────────────────────────────────────
printf "${GREEN}Starting services with PM2...${NC}\n"
pm2 delete mike-backend 2>/dev/null || true
pm2 delete mike-frontend 2>/dev/null || true

pm2 start npm --name mike-backend  -- --prefix "$MIKE_DIR/backend"  run start
pm2 start npm --name mike-frontend -- --prefix "$MIKE_DIR/frontend" run start
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || true

printf "${GREEN}Mike is running:${NC}\n"
printf "  Backend:  http://localhost:3001\n"
printf "  Frontend: http://localhost:3000\n"
printf "\n${YELLOW}Next: configure nginx (see mike-integration/nginx.conf)${NC}\n"
