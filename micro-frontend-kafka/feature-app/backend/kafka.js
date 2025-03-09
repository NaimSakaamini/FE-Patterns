const { Kafka } = require('kafkajs');
require('dotenv').config();

// Create Kafka client
const kafka = new Kafka({
  clientId: 'feature-app',
  brokers: process.env.KAFKA_BROKERS.split(','),
});

// Create consumer
const consumer = kafka.consumer({ groupId: 'feature-app-group' });

// Create producer (for sending events back to main app)
const producer = kafka.producer();

// Session store to keep track of active sessions
const sessionStore = new Map();

// Connect to Kafka
const connectKafka = async () => {
  try {
    await consumer.connect();
    await producer.connect();
    console.log('Kafka consumer and producer connected');
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
  }
};

// Disconnect from Kafka
const disconnectKafka = async () => {
  try {
    await consumer.disconnect();
    await producer.disconnect();
    console.log('Kafka consumer and producer disconnected');
  } catch (error) {
    console.error('Error disconnecting from Kafka:', error);
  }
};

// Send message to Kafka
const sendMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [
        { value: JSON.stringify(message) },
      ],
    });
    console.log(`Message sent to topic ${topic}`);
    return true;
  } catch (error) {
    console.error(`Error sending message to topic ${topic}:`, error);
    return false;
  }
};

// Subscribe to topics
const subscribeToTopics = async () => {
  try {
    // Subscribe to session events
    await consumer.subscribe({ topics: ['session-events'], fromBeginning: false });
    
    // Subscribe to todo events
    await consumer.subscribe({ topics: ['todo-events'], fromBeginning: false });
    
    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const messageValue = JSON.parse(message.value.toString());
        console.log(`Received message from topic ${topic}:`, messageValue);
        
        // Process message based on topic
        switch (topic) {
          case 'session-events':
            handleSessionEvent(messageValue);
            break;
          case 'todo-events':
            handleTodoEvent(messageValue);
            break;
          default:
            console.log(`No handler for topic ${topic}`);
        }
      },
    });
    
    console.log('Subscribed to topics');
  } catch (error) {
    console.error('Error subscribing to topics:', error);
  }
};

// Handle session events
const handleSessionEvent = (event) => {
  switch (event.type) {
    case 'LOGIN':
      // Store session
      sessionStore.set(event.userId, {
        userId: event.userId,
        username: event.username,
        timestamp: event.timestamp,
        active: true
      });
      console.log(`User ${event.username} logged in`);
      break;
    case 'LOGOUT':
      // Remove session
      if (sessionStore.has(event.userId)) {
        const session = sessionStore.get(event.userId);
        session.active = false;
        sessionStore.set(event.userId, session);
      }
      console.log(`User ${event.username} logged out`);
      break;
    default:
      console.log(`Unknown session event type: ${event.type}`);
  }
};

// Handle todo events
const handleTodoEvent = (event) => {
  // In a real app, you might update local state or database based on todo events
  console.log(`Todo event: ${event.type}`);
};

// Check if user has active session
const hasActiveSession = (userId) => {
  if (!sessionStore.has(userId)) {
    return false;
  }
  
  const session = sessionStore.get(userId);
  return session.active;
};

// Get user session
const getUserSession = (userId) => {
  return sessionStore.get(userId);
};

// Initialize Kafka
const initKafka = async () => {
  await connectKafka();
  await subscribeToTopics();
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectKafka();
  process.exit(0);
});

module.exports = {
  initKafka,
  sendMessage,
  hasActiveSession,
  getUserSession,
  sessionStore
}; 