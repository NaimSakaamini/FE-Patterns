const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Sample data
let categories = [
  { id: 1, name: 'Work' },
  { id: 2, name: 'Personal' }
];

// Routes
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const newCategory = {
    id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
    name: req.body.name
  };
  
  categories.push(newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = categories.findIndex(category => category.id === id);
  
  if (index !== -1) {
    categories[index] = { ...categories[index], ...req.body };
    res.json(categories[index]);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = categories.findIndex(category => category.id === id);
  
  if (index !== -1) {
    const deletedCategory = categories[index];
    categories = categories.filter(category => category.id !== id);
    res.json(deletedCategory);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Feature app server running on http://localhost:${PORT}`);
}); 