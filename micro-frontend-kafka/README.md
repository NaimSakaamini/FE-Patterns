# Micro Frontend with Kafka and Event-Driven Architecture

This project demonstrates a micro frontend architecture using React, Node.js, Kafka, and PostgreSQL. It consists of a main app and a feature app that communicate via Kafka for event-driven state management.

## Project Structure

```
micro-frontend-kafka/
│── main-app/                # Main App
│   ├── frontend/            # React + Vite
│   ├── backend/             # Express + Kafka Producer
│── feature-app/             # Micro Frontend (Feature App)
│   ├── frontend/            # React + Vite
│   ├── backend/             # Express + Kafka Consumer
│── api-gateway/             # Reverse Proxy / API Gateway
│── kafka/                   # Kafka setup (Docker)
│── db/                      # PostgreSQL shared database
│── logs/                    # Log files directory
│── start-all.sh             # Script to start all services
```

## Features

- **Main App**: Manages todos and user authentication
- **Feature App**: Manages categories
- **API Gateway**: Routes requests and ensures session data is forwarded
- **Kafka**: Handles event-driven state management and session sharing
- **PostgreSQL**: Shared database for both apps

## Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- npm or yarn

## Quick Start

The easiest way to run the application is using the provided startup script:

```bash
# Make the script executable
chmod +x start-all.sh

# Run the script
./start-all.sh
```

The script will:
1. Check if Docker is running
2. Check if required ports are available
3. Start Kafka and PostgreSQL containers
4. Install dependencies for all services
5. Start all services
6. Display access information

Once started, you can access:
- Main App: http://localhost:4000
- Feature App: http://localhost:4000/feature
- Kafka UI: http://localhost:8080

## Manual Setup and Running

If you prefer to set up and run the services manually:

### 1. Start Kafka and PostgreSQL

```bash
# Start Kafka and PostgreSQL containers
docker-compose up -d
```

### 2. Install Dependencies

```bash
# Install API Gateway dependencies
cd api-gateway
npm install

# Install Main App Backend dependencies
cd ../main-app/backend
npm install

# Install Main App Frontend dependencies
cd ../frontend
npm install

# Install Feature App Backend dependencies
cd ../../feature-app/backend
npm install

# Install Feature App Frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Services

Start each service in a separate terminal window:

```bash
# Start API Gateway
cd api-gateway
npm run dev

# Start Main App Backend
cd main-app/backend
npm run dev

# Start Main App Frontend
cd main-app/frontend
npm run dev

# Start Feature App Backend
cd feature-app/backend
npm run dev

# Start Feature App Frontend
cd feature-app/frontend
npm run dev
```

## How It Works

1. **User Authentication**:
   - User logs into the main app
   - Main app creates a session and publishes it to Kafka
   - Feature app listens for session events from Kafka

2. **Feature App Integration**:
   - Main app loads the feature app via the API gateway
   - Feature app checks for session data before rendering
   - Feature app uses the session data to authenticate API calls

3. **Event-Driven State Management**:
   - Main app publishes state changes to Kafka
   - Feature app consumes state changes from Kafka
   - Feature app can publish events back to Kafka

## Login Credentials

For demo purposes, you can use:
- Username: `user1`
- Password: `$2b$10$1234567890123456789012`

## Logging and Alerts

The application includes extensive logging and alerts to help you understand what's happening:

- **Console Logging**: Both apps log detailed information to the console with emoji indicators:
  - ✅ Success messages
  - ❌ Error messages
  - 🔄 Process indicators
  - 📢 Kafka event notifications

- **Alert Popups**: The application shows alert popups at key points:
  - When logging in/out
  - When switching between apps
  - When Kafka events are published/consumed
  - When errors occur

- **Log Files**: When using the startup script, logs are saved to the `logs/` directory:
  - `api-gateway.log`
  - `main-app-backend.log`
  - `main-app-frontend.log`
  - `feature-app-backend.log`
  - `feature-app-frontend.log`

## Development Notes

- The API Gateway ensures that session data is properly forwarded to the feature app
- Kafka topics include: `session-events`, `todo-events`, and `category-events`
- Both apps share the same PostgreSQL database
- The feature app waits for session data before rendering UI 