#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Micro Frontend with Kafka - Startup Script ===${NC}\n"

# Function to check if Docker is running
check_docker() {
  echo -e "${YELLOW}Checking if Docker is running...${NC}"
  if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Docker is not running. Please start Docker and try again.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Docker is running!${NC}\n"
}

# Function to check if a port is in use
check_port() {
  local port=$1
  local service=$2
  echo -e "${YELLOW}Checking if port $port is available for $service...${NC}"
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${RED}Port $port is already in use. Please free up this port for $service.${NC}"
    return 1
  fi
  echo -e "${GREEN}Port $port is available for $service!${NC}"
  return 0
}

# Check if all required ports are available
check_ports() {
  local all_ports_available=true
  
  if ! check_port 3000 "Main App Frontend"; then all_ports_available=false; fi
  if ! check_port 3001 "Main App Backend"; then all_ports_available=false; fi
  if ! check_port 4000 "Feature App Frontend"; then all_ports_available=false; fi
  if ! check_port 4001 "Feature App Backend"; then all_ports_available=false; fi
  
  if [ "$all_ports_available" = false ]; then
    echo -e "${RED}Some required ports are not available. Please free them up and try again.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}All required ports are available!${NC}\n"
}

# Function to start Docker containers
start_docker_containers() {
  echo -e "${YELLOW}Starting Kafka and PostgreSQL containers...${NC}"
  docker-compose up -d
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start Docker containers. Please check the error message above.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Docker containers started successfully!${NC}"
  echo -e "${BLUE}Kafka UI is available at: ${YELLOW}http://localhost:8080${NC}"
  echo -e "${BLUE}PostgreSQL is running on port: ${YELLOW}5432${NC}\n"
  
  # Wait for Kafka to be fully up
  echo -e "${YELLOW}Waiting for Kafka to be fully up (30 seconds)...${NC}"
  sleep 30
  echo -e "${GREEN}Kafka should be ready now!${NC}\n"
}

# Function to install dependencies
install_dependencies() {
  echo -e "${YELLOW}Installing dependencies for all services...${NC}"
  
  echo -e "${BLUE}Installing API Gateway dependencies...${NC}"
  cd api-gateway
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install API Gateway dependencies.${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Installing Main App Backend dependencies...${NC}"
  cd ../main-app/backend
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Main App Backend dependencies.${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Installing Main App Frontend dependencies...${NC}"
  cd ../frontend
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Main App Frontend dependencies.${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Installing Feature App Backend dependencies...${NC}"
  cd ../../feature-app/backend
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Feature App Backend dependencies.${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Installing Feature App Frontend dependencies...${NC}"
  cd ../frontend
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install Feature App Frontend dependencies.${NC}"
    exit 1
  fi
  
  # Go back to the root directory
  cd ../../
  
  echo -e "${GREEN}All dependencies installed successfully!${NC}\n"
}

# Function to start all services
start_services() {
  echo -e "${YELLOW}Starting all services...${NC}"
  
  # Start Main App Backend
  echo -e "${BLUE}Starting Main App Backend on port 3001...${NC}"
  cd main-app/backend
  npm run dev > ../../logs/main-app-backend.log 2>&1 &
  MAIN_BACKEND_PID=$!
  
  # Start Main App Frontend
  echo -e "${BLUE}Starting Main App Frontend on port 3000...${NC}"
  cd ../frontend
  npm run dev > ../../logs/main-app-frontend.log 2>&1 &
  MAIN_FRONTEND_PID=$!
  
  # Start Feature App Backend
  echo -e "${BLUE}Starting Feature App Backend on port 4001...${NC}"
  cd ../../feature-app/backend
  npm run dev > ../../logs/feature-app-backend.log 2>&1 &
  FEATURE_BACKEND_PID=$!
  
  # Start Feature App Frontend
  echo -e "${BLUE}Starting Feature App Frontend on port 4000...${NC}"
  cd ../frontend
  npm run dev > ../../logs/feature-app-frontend.log 2>&1 &
  FEATURE_FRONTEND_PID=$!
  
  # Go back to the root directory
  cd ../../
  
  echo -e "${GREEN}All services started successfully!${NC}\n"
}

# Function to display access information
display_access_info() {
  echo -e "${BLUE}=== Access Information ===${NC}"
  echo -e "${BLUE}Main App: ${YELLOW}http://localhost:3000${NC}"
  echo -e "${BLUE}Feature App: ${YELLOW}http://localhost:4000${NC}"
  echo -e "${BLUE}Kafka UI: ${YELLOW}http://localhost:8080${NC}"
  echo -e "\n${BLUE}Login Credentials:${NC}"
  echo -e "${BLUE}Username: ${YELLOW}user1${NC}"
  echo -e "${BLUE}Password: ${YELLOW}\$2b\$10\$1234567890123456789012${NC}"
  echo -e "\n${BLUE}Log Files:${NC}"
  echo -e "${BLUE}API Gateway: ${YELLOW}logs/api-gateway.log${NC}"
  echo -e "${BLUE}Main App Backend: ${YELLOW}logs/main-app-backend.log${NC}"
  echo -e "${BLUE}Main App Frontend: ${YELLOW}logs/main-app-frontend.log${NC}"
  echo -e "${BLUE}Feature App Backend: ${YELLOW}logs/feature-app-backend.log${NC}"
  echo -e "${BLUE}Feature App Frontend: ${YELLOW}logs/feature-app-frontend.log${NC}"
  echo -e "\n${GREEN}The application is now running! Press Ctrl+C to stop all services.${NC}"
}

# Function to clean up on exit
cleanup() {
  echo -e "\n${YELLOW}Stopping all services...${NC}"
  kill $MAIN_BACKEND_PID $MAIN_FRONTEND_PID $FEATURE_BACKEND_PID $FEATURE_FRONTEND_PID
  
  echo -e "${YELLOW}Do you want to stop the Docker containers as well? (y/n)${NC}"
  read -r stop_docker
  if [[ $stop_docker =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping Docker containers...${NC}"
    docker-compose down
    echo -e "${GREEN}Docker containers stopped.${NC}"
  fi
  
  echo -e "${GREEN}All services stopped. Goodbye!${NC}"
  exit 0
}

# Create logs directory
mkdir -p logs

# Run the functions
check_docker
check_ports
start_docker_containers
install_dependencies
start_services
display_access_info

# Set up trap for cleanup on exit
trap cleanup SIGINT

# Keep the script running
while true; do
  sleep 1
done 