# Micro-Frontend Architecture with Module Federation

This project demonstrates a micro-frontend architecture using Webpack Module Federation to share components and state between independent applications.

## Why Module Federation?

Module Federation is a powerful approach to micro-frontends that allows:

1. **Runtime Integration**: Applications can load and execute code from other applications at runtime
2. **Shared Dependencies**: Common libraries can be shared to reduce bundle sizes
3. **Independent Deployment**: Teams can deploy their applications independently
4. **Granular Code Sharing**: Specific components or modules can be exposed and consumed

This approach is ideal for organizations with multiple teams working on different parts of a larger application, enabling parallel development while maintaining a cohesive user experience.

## Technology Stack

### Frontend
- **React**: UI library
- **Vite**: Build tool with Module Federation plugin
- **Redux/Redux Toolkit**: State management
- **React Router**: Client-side routing

### Backend
- **Express.js**: Node.js web framework
- **PostgreSQL**: Relational database

### Development Tools
- **Webpack Module Federation**: For micro-frontend architecture
- **@originjs/vite-plugin-federation**: Vite plugin for Module Federation

## Project Structure

```
micro-frontend-federation/
│── main-app/                # Host application
│   ├── frontend/            # React + Vite frontend (port 5000)
│   │   ├── src/store/       # Redux store exposed to remote apps
│   ├── backend/             # Express API (port 3001)
│── feature-app/             # Remote application
│   ├── frontend/            # React + Vite frontend (port 5001)
│   ├── backend/             # Express API (port 3002)
```

## How It Works

1. **Main App (Host)**: 
   - Exposes its Redux store via Module Federation
   - Loads the Feature App component dynamically
   - Provides shared dependencies

2. **Feature App (Remote)**:
   - Exposes components via Module Federation
   - Consumes the Main App's Redux store
   - Can update the shared state

3. **State Sharing**:
   - Redux store is shared between applications
   - State changes in one app are reflected in the other

## Key Benefits

- **Shared State**: Applications share a single source of truth
- **Runtime Integration**: No need to rebuild the entire application for changes
- **Team Autonomy**: Teams can work independently on their own applications
- **Optimized Loading**: Only load what's needed when it's needed
- **Consistent UI**: Shared dependencies ensure consistent look and feel

## Challenges and Considerations

- **Build Configuration**: Module Federation requires specific Webpack/Vite configuration
- **Versioning**: Shared dependencies must be version-compatible
- **Initial Setup Complexity**: More complex initial setup than other approaches
- **Browser Support**: Requires modern browsers that support ES Modules

## Getting Started

See the [Setup and Running](#setup-and-running) section for instructions on how to run this project.

## Setup and Running

### 1. Install Dependencies

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

```bash
cd feature-app/frontend
npm run build
```

### 3. Start the Servers

```bash
# Start all services with the provided script
./start-all.sh

# Or start services individually:
# Main App Backend
cd main-app/backend
npm run dev

# Feature App Backend
cd feature-app/backend
npm run dev

# Feature App Frontend (preview mode)
cd feature-app/frontend
npm run preview

# Main App Frontend
cd main-app/frontend
npm run dev
```

### 4. Access the Applications

- Main App: http://localhost:5000
- Feature App (standalone): http://localhost:5001

## Conclusion

Module Federation provides a powerful approach to micro-frontend architecture, enabling runtime integration and state sharing between independent applications. This project demonstrates how to implement this approach using React, Redux, and Vite. 