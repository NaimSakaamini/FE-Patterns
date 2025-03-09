# Micro Frontend Example with Module Federation

This project demonstrates a micro frontend architecture using Webpack Module Federation with React, Redux, and Express backends.

## Project Structure

```
micro-frontend-example/
│── main-app/                # Main host app (React + Express)
│   ├── frontend/            # React frontend (Vite)
│   ├── backend/             # Express API
│── feature-app/             # Remote micro frontend (React + Express)
│   ├── frontend/            # React frontend (Vite)
│   ├── backend/             # Express API
```

## Features

- Main App (Host)
  - React (Vite) frontend + Express backend
  - Loads feature-app dynamically using Module Federation
  - Shares Redux store and React dependencies
  - Calls API endpoints on the feature app

- Feature App (Micro Frontend)
  - React (Vite) frontend + Express backend
  - Exposes a UI component via Module Federation
  - Uses the shared Redux store from the main app
  - Calls its own API server

- Shared Dependencies
  - react, react-dom, redux, react-redux
  - Shared versioning controlled via Module Federation

## Setup and Running

### 1. Install Dependencies

First, install all dependencies for both apps:

```bash
# Install dependencies for main app
cd main-app/frontend
npm install
cd ../backend
npm install

# Install dependencies for feature app
cd ../../feature-app/frontend
npm install
cd ../backend
npm install
```

### 2. Build the Feature App

The feature app needs to be built first so that the main app can consume it:

```bash
cd feature-app/frontend
npm run build
```

### 3. Start the Servers

Start all servers in separate terminal windows:

```bash
# Start main app backend
cd main-app/backend
npm run dev

# Start feature app backend
cd feature-app/backend
npm run dev

# Start feature app frontend in preview mode (to serve the built files)
cd feature-app/frontend
npm run preview

# Start main app frontend
cd main-app/frontend
npm run dev
```

### 4. Access the Application

- Main App: http://localhost:5000
- Feature App (standalone): http://localhost:5001

## How It Works

1. The main app loads and initializes the Redux store
2. When the user clicks "Show Category Manager", the feature app component is dynamically loaded
3. The feature app uses the Redux store from the main app
4. Both apps can update the same Redux store, sharing state
5. Each app has its own Express backend API

## Module Federation Configuration

- The main app is configured as a host in `main-app/frontend/vite.config.js`
- The feature app is configured as a remote in `feature-app/frontend/vite.config.js`
- Shared dependencies are specified in both configurations to ensure consistent versions

## Development Notes

- When developing, any changes to the feature app require rebuilding and restarting the preview server
- The main app can be developed with hot module reloading without rebuilding
- Both Express servers can be restarted independently 