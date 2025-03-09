import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setCategories, addCategory, updateCategory, deleteCategory, 
  setCategoryLoading, setCategoryError 
} from '../store';

const CategoryManager = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const { items: categories, loading, error } = useSelector(state => state.categories);
  const todosState = useSelector(state => state.todos || { items: [] });
  const todos = todosState.items || [];
  const dispatch = useDispatch();

  useEffect(() => {
    alert(`Feature App: CategoryManager loaded\nShared Redux Store - Todos count: ${todos.length}`);
    
    const fetchCategories = async () => {
      dispatch(setCategoryLoading());
      try {
        const response = await fetch('http://localhost:3002/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        dispatch(setCategories(data));
      } catch (err) {
        dispatch(setCategoryError(err.message));
      }
    };

    fetchCategories();
  }, [dispatch, todos.length]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const response = await fetch('http://localhost:3002/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      const newCategory = await response.json();
      dispatch(addCategory(newCategory));
      setNewCategoryName('');
    } catch (err) {
      dispatch(setCategoryError(err.message));
    }
  };

  const handleUpdateCategory = async (category, newName) => {
    try {
      const response = await fetch(`http://localhost:3002/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...category, name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const updatedCategory = await response.json();
      dispatch(updateCategory(updatedCategory));
    } catch (err) {
      dispatch(setCategoryError(err.message));
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      dispatch(deleteCategory(id));
    } catch (err) {
      dispatch(setCategoryError(err.message));
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="category-manager">
      <h2>Category Manager</h2>
      
      <form onSubmit={handleAddCategory} className="add-category-form">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Add a new category"
        />
        <button type="submit">Add</button>
      </form>
      
      <ul className="categories">
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <span>{category.name}</span>
            <div className="category-actions">
              <button onClick={() => {
                const newName = prompt('Enter new category name:', category.name);
                if (newName && newName !== category.name) {
                  handleUpdateCategory(category, newName);
                }
              }}>Edit</button>
              <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryManager; 