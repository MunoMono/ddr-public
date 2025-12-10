#!/bin/bash

# DDR Development Server Startup Script
# Starts both frontend (Vite) and backend (FastAPI/Strawberry GraphQL)

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting DDR Development Servers...${NC}\n"

# Get the project root directory (parent of scripts folder)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}⚠️  Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start GraphQL backend server
echo -e "${GREEN}📡 Starting GraphQL backend (port 8000)...${NC}"
cd "$PROJECT_ROOT/server"
"$PROJECT_ROOT/.venv/bin/uvicorn" server:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start Vite frontend
echo -e "${GREEN}🎨 Starting Vite frontend (port 5173)...${NC}"
cd "$PROJECT_ROOT"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${BLUE}✅ Development servers running:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:5173/ddr-public/${NC}"
echo -e "   GraphQL:  ${GREEN}http://localhost:8000/graphql${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}\n"

# Wait for both processes
wait
