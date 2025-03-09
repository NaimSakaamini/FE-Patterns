const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db');
const { initKafka, sendMessage } = require('./kafka');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'x-user-id']
}));
app.use(express.json());
app.use(cookieParser());

// Initialize Kafka
initKafka();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes
// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log(`Login attempt for user: ${username}`);
  
  try {
    // Find user
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log(`User found: ${username}`);
    console.log(`Expected password hash: ${user.password_hash}`);
    console.log(`Provided password: ${password}`);
    
    // Check password (in a real app, use bcrypt.compare)
    // For demo purposes, we're just checking the hash directly
    if (user.password_hash !== password) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('Login successful');
    
    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });
    
    // Send session event to Kafka
    await sendMessage('session-events', {
      type: 'LOGIN',
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    });
    
    // Return user data
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie('token');
    
    // Send session event to Kafka
    await sendMessage('session-events', {
      type: 'LOGOUT',
      userId: req.user.id,
      username: req.user.username,
      timestamp: new Date().toISOString()
    });
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email
  });
});

// Todo routes
app.get('/api/todos', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/todos', authenticateToken, async (req, res) => {
  const { title } = req.body;
  
  try {
    const result = await db.query(
      'INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *',
      [req.user.id, title]
    );
    
    const newTodo = result.rows[0];
    
    // Send todo event to Kafka
    await sendMessage('todo-events', {
      type: 'TODO_CREATED',
      todo: newTodo,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  try {
    const result = await db.query(
      'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, completed, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    const updatedTodo = result.rows[0];
    
    // Send todo event to Kafka
    await sendMessage('todo-events', {
      type: 'TODO_UPDATED',
      todo: updatedTodo,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await db.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    
    const deletedTodo = result.rows[0];
    
    // Send todo event to Kafka
    await sendMessage('todo-events', {
      type: 'TODO_DELETED',
      todoId: deletedTodo.id,
      userId: req.user.id,
      timestamp: new Date().toISOString()
    });
    
    res.json(deletedTodo);
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Main App server running on http://localhost:${PORT}`);
}); 