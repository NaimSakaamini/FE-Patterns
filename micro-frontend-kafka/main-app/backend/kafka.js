const { Kafka } = require('kafkajs');
require('dotenv').config();

// Create Kafka client
const kafka = new Kafka({
  clientId: 'main-app',
  brokers: process.env.KAFKA_BROKERS.split(','),
});

// Create producer
const producer = kafka.producer();

// Connect to Kafka
const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('Kafka producer connected');
  } catch (error) {
    console.error('Error connecting Kafka producer:', error);
  }
};

// Disconnect from Kafka
const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log('Kafka producer disconnected');
  } catch (error) {
    console.error('Error disconnecting Kafka producer:', error);
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

// Create topics if they don't exist
const createTopics = async () => {
  const admin = kafka.admin();
  
  try {
    await admin.connect();
    await admin.createTopics({
      topics: [
        { topic: 'session-events' },
        { topic: 'user-events' },
        { topic: 'todo-events' },
      ],
    });
    console.log('Topics created successfully');
  } catch (error) {
    console.error('Error creating topics:', error);
  } finally {
    await admin.disconnect();
  }
};

// Initialize Kafka
const initKafka = async () => {
  await connectProducer();
  await createTopics();
};

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectProducer();
  process.exit(0);
});

module.exports = {
  initKafka,
  sendMessage,
}; 