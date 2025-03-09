import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Base URL for all API requests - Main App Backend
const API_BASE_URL = 'http://localhost:3001';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated]);

  const fetchTodos = async () => {
    console.log('🔄 [Main App] Fetching todos...');
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/todos`, {
        withCredentials: true
      });
      setTodos(response.data);
      console.log(`✅ [Main App] Fetched ${response.data.length} todos`);
      setError(null);
    } catch (error) {
      const errorMessage = 'Failed to fetch todos';
      console.error('❌ [Main App] Error fetching todos:', error);
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    console.log(`➕ [Main App] Adding new todo: "${newTodo}"`);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/todos`, {
        title: newTodo
      }, {
        withCredentials: true
      });
      setTodos([response.data, ...todos]);
      setNewTodo('');
      console.log('✅ [Main App] Todo added successfully');
      console.log('📢 [Main App] Event published to Kafka: TODO_CREATED');
    } catch (error) {
      const errorMessage = 'Failed to add todo';
      console.error('❌ [Main App] Error adding todo:', error);
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleToggleTodo = async (todo) => {
    console.log(`🔄 [Main App] Toggling todo: "${todo.title}"`);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/todos/${todo.id}`, {
        completed: !todo.completed
      }, {
        withCredentials: true
      });
      setTodos(todos.map(t => t.id === todo.id ? response.data : t));
      console.log(`✅ [Main App] Todo ${todo.completed ? 'uncompleted' : 'completed'}: "${todo.title}"`);
      console.log('📢 [Main App] Event published to Kafka: TODO_UPDATED');
    } catch (error) {
      const errorMessage = 'Failed to update todo';
      console.error('❌ [Main App] Error updating todo:', error);
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleDeleteTodo = async (id) => {
    console.log(`🗑️ [Main App] Deleting todo with ID: ${id}`);
    try {
      await axios.delete(`${API_BASE_URL}/api/todos/${id}`, {
        withCredentials: true
      });
      setTodos(todos.filter(todo => todo.id !== id));
      console.log('✅ [Main App] Todo deleted successfully');
      console.log('📢 [Main App] Event published to Kafka: TODO_DELETED');
    } catch (error) {
      const errorMessage = 'Failed to delete todo';
      console.error('❌ [Main App] Error deleting todo:', error);
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to see your todos</div>;
  }

  if (loading) {
    return <div>Loading todos...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="card">
      <h2>Todo List</h2>
      <form onSubmit={handleAddTodo} className="form-group">
        <div className="form-group">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
          />
        </div>
        <button type="submit" className="btn-primary">Add Todo</button>
      </form>

      {todos.length === 0 ? (
        <p>No todos yet. Add one above!</p>
      ) : (
        <div className="todo-list">
          {todos.map(todo => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <span onClick={() => handleToggleTodo(todo)}>{todo.title}</span>
              <div className="todo-item-actions">
                <button onClick={() => handleDeleteTodo(todo.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList; 