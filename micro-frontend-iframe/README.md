# Micro-Frontend Architecture with iFrames and Kafka

This project demonstrates a micro-frontend architecture using iFrames for UI composition and Kafka for event-driven state synchronization between independent applications.

## Why iFrames with Kafka?

The iFrame with Kafka approach offers several advantages:

1. **Strong Isolation**: Applications are completely isolated from each other, preventing CSS and JavaScript conflicts
2. **Technology Agnostic**: Each application can use different frameworks or versions
3. **Independent Deployment**: Teams can deploy their applications independently
4. **Event-Driven Architecture**: Kafka enables reliable, scalable communication between applications
5. **Resilience**: Applications can function independently even if others fail

This approach is ideal for organizations that prioritize isolation and independence between teams, or when integrating applications built with different technologies.

## Technology Stack

### Frontend
- **React**: UI library for both applications
- **Vite**: Build tool
- **Axios**: HTTP client for API requests

### Backend
- **Express.js**: Node.js web framework
- **PostgreSQL**: Relational database
- **Kafka**: Event streaming platform for inter-app communication
- **JWT**: Authentication mechanism

### Infrastructure
- **Docker**: Containerization for Kafka and PostgreSQL
- **Kafka UI**: Web interface for monitoring Kafka topics

## Project Structure

```
micro-frontend-iframe/
│── main-app/                # Container application
│   ├── frontend/            # React + Vite frontend (port 3000)
│   ├── backend/             # Express API + Kafka producer (port 3001)
│── feature-app/             # Embedded application
│   ├── frontend/            # React + Vite frontend (port 4000)
│   ├── backend/             # Express API + Kafka consumer (port 4001)
│── docker-compose.yml       # Docker configuration for Kafka and PostgreSQL
│── db/                      # Database initialization scripts
```

## How It Works

1. **Main App**: 
   - Serves as the container application
   - Embeds the Feature App using iFrames
   - Publishes events to Kafka when state changes

2. **Feature App**:
   - Runs as a standalone application
   - Embedded in the Main App via iFrame
   - Consumes events from Kafka to stay in sync

3. **State Synchronization**:
   - Kafka serves as the event bus between applications
   - Applications publish and subscribe to relevant topics
   - State changes are propagated through events

4. **Authentication**:
   - JWT tokens are used for authentication
   - Session information is shared via Kafka events
   - Tokens can be passed to iFrames via URL parameters

## Key Benefits

- **Complete Isolation**: No risk of CSS or JavaScript conflicts
- **Technology Freedom**: Each team can choose their own tech stack
- **Scalability**: Kafka provides reliable, scalable event handling
- **Resilience**: Applications can function independently
- **Security**: iFrames provide natural security boundaries

## Challenges and Considerations

- **User Experience**: iFrames can create UX challenges (scrolling, focus management)
- **Performance**: Multiple applications can impact performance
- **State Synchronization**: Event-driven state requires careful design
- **SEO**: iFrames can complicate search engine optimization
- **Infrastructure Complexity**: Kafka adds operational complexity

## Getting Started

See the [Setup and Running](#setup-and-running) section for instructions on how to run this project.

## Setup and Running

### Prerequisites

- Node.js (v14+)
- Docker and Docker Compose
- npm or yarn

### 1. Start Kafka and PostgreSQL

```bash
# Start Kafka and PostgreSQL containers
docker-compose up -d
```

### 2. Install Dependencies

```bash
# Install Main App Backend dependencies
cd main-app/backend
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

```bash
# Start all services with the provided script
./start-all.sh

# Or start services individually:
# Main App Backend
cd main-app/backend
npm run dev

# Main App Frontend
cd main-app/frontend
npm run dev

# Feature App Backend
cd feature-app/backend
npm run dev

# Feature App Frontend
cd feature-app/frontend
npm run dev
```

### 4. Access the Applications

- Main App: http://localhost:3000
- Feature App: http://localhost:4000
- Kafka UI: http://localhost:8080

## Login Credentials

For demo purposes, you can use:
- Username: `user1`
- Password: `$2b$10$1234567890123456789012`

## Conclusion

The iFrame with Kafka approach provides a robust solution for micro-frontend architecture, particularly when strong isolation and technology independence are priorities. This project demonstrates how to implement this approach using React, Express, and Kafka, with a focus on event-driven state synchronization. 