const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { initKafka, sendMessage, hasActiveSession, getUserSession } = require('./kafka');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'x-user-id']
}));
app.use(express.json());

// Initialize Kafka
initKafka();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.headers['x-access-token'];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    
    // Check if user has active session in Kafka
    if (!hasActiveSession(user.id)) {
      return res.status(401).json({ message: 'No active session' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Session check middleware for frontend
app.get('/api/session-check', (req, res) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID not provided' });
  }
  
  // For demo purposes, if userId is '1', always return a mock session
  if (userId === '1') {
    console.log('📢 [Feature App Backend] Returning mock session for user1');
    return res.json({
      hasActiveSession: true,
      session: {
        userId: '1',
        username: 'user1',
        timestamp: new Date().toISOString(),
        active: true
      }
    });
  }
  
  const hasSession = hasActiveSession(userId);
  const session = getUserSession(userId);
  
  res.json({
    hasActiveSession: hasSession,
    session: session || null
  });
});

// Categories routes
app.get('/api/categories', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID not provided' });
  }
  
  try {
    const result = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/categories', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  const { name } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID not provided' });
  }
  
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  try {
    const result = await db.query(
      'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    
    const newCategory = result.rows[0];
    
    // Send event to Kafka
    await sendMessage('category-events', {
      type: 'CATEGORY_CREATED',
      userId: userId,
      categoryId: newCategory.id,
      categoryName: newCategory.name,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  const { id } = req.params;
  const { name } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID not provided' });
  }
  
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  try {
    const result = await db.query(
      'UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [name, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const updatedCategory = result.rows[0];
    
    // Send event to Kafka
    await sendMessage('category-events', {
      type: 'CATEGORY_UPDATED',
      userId: userId,
      categoryId: updatedCategory.id,
      categoryName: updatedCategory.name,
      timestamp: new Date().toISOString()
    });
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  const { id } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID not provided' });
  }
  
  try {
    // Get category before deleting for Kafka event
    const categoryResult = await db.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = categoryResult.rows[0];
    
    // Delete the category
    await db.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    // Send event to Kafka
    await sendMessage('category-events', {
      type: 'CATEGORY_DELETED',
      userId: userId,
      categoryId: category.id,
      categoryName: category.name,
      timestamp: new Date().toISOString()
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Feature App server running on http://localhost:${PORT}`);
}); 