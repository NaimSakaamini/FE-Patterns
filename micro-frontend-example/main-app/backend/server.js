const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
let todos = [
  { id: 1, text: 'Learn Module Federation', completed: false },
  { id: 2, text: 'Build a micro-frontend app', completed: false }
];

// Routes
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    text: req.body.text,
    completed: false
  };
  
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index !== -1) {
    todos[index] = { ...todos[index], ...req.body };
    res.json(todos[index]);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index !== -1) {
    const deletedTodo = todos[index];
    todos = todos.filter(todo => todo.id !== id);
    res.json(deletedTodo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Main app server running on http://localhost:${PORT}`);
}); 