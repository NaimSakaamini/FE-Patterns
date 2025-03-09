import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL for all API requests - Feature App Backend
const API_BASE_URL = 'http://localhost:4001';

const CategoryManager = ({ sessionData }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionData) {
      fetchCategories();
    }
  }, [sessionData]);

  // Helper function to prepare headers
  const getHeaders = () => {
    const headers = {
      'x-user-id': sessionData.userId
    };
    
    if (sessionData.token && sessionData.token !== 'mock-token') {
      headers['Authorization'] = `Bearer ${sessionData.token}`;
    }
    
    return headers;
  };

  const fetchCategories = async () => {
    console.log('🔄 [Feature App] Fetching categories...');
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/categories`, {
        headers: getHeaders()
      });
      setCategories(response.data);
      console.log(`✅ [Feature App] Fetched ${response.data.length} categories`);
    } catch (error) {
      console.error('❌ [Feature App] Error fetching categories:', error);
      setError('Failed to fetch categories');
      alert('Error fetching categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    console.log(`➕ [Feature App] Adding new category: "${newCategory}"`);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/categories`, {
        name: newCategory
      }, {
        headers: getHeaders()
      });
      
      setCategories([...categories, response.data]);
      setNewCategory('');
      console.log('✅ [Feature App] Category added successfully');
      alert(`Category "${response.data.name}" added successfully!`);
    } catch (error) {
      console.error('❌ [Feature App] Error adding category:', error);
      alert('Error adding category. Please try again.');
    }
  };

  const handleUpdateCategory = async (category, newName) => {
    if (!newName.trim() || newName === category.name) {
      return;
    }
    
    console.log(`🔄 [Feature App] Updating category: "${category.name}" to "${newName}"`);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/categories/${category.id}`, {
        name: newName
      }, {
        headers: getHeaders()
      });
      
      setCategories(categories.map(c => c.id === category.id ? response.data : c));
      console.log('✅ [Feature App] Category updated successfully');
      alert(`Category updated to "${response.data.name}" successfully!`);
    } catch (error) {
      console.error('❌ [Feature App] Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id) => {
    const categoryToDelete = categories.find(c => c.id === id);
    if (!window.confirm(`Are you sure you want to delete "${categoryToDelete?.name}"?`)) {
      return;
    }
    
    console.log(`🗑️ [Feature App] Deleting category: "${categoryToDelete?.name}"`);
    try {
      await axios.delete(`${API_BASE_URL}/api/categories/${id}`, {
        headers: getHeaders()
      });
      
      setCategories(categories.filter(c => c.id !== id));
      console.log('✅ [Feature App] Category deleted successfully');
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('❌ [Feature App] Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="card">
      <h2>Category Manager</h2>
      <form onSubmit={handleAddCategory} className="form-group">
        <div className="form-group">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Add a new category"
          />
        </div>
        <button type="submit" className="btn-primary">Add Category</button>
      </form>

      {categories.length === 0 ? (
        <p>No categories yet. Add one above!</p>
      ) : (
        <div className="category-list">
          {categories.map(category => (
            <div key={category.id} className="category-item">
              <span>{category.name}</span>
              <div className="category-item-actions">
                <button 
                  onClick={() => {
                    const newName = prompt('Enter new category name:', category.name);
                    if (newName && newName !== category.name) {
                      handleUpdateCategory(category, newName);
                    }
                  }} 
                  className="btn-primary"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id)} 
                  className="btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 