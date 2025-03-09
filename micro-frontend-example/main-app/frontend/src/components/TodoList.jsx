import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTodos, addTodo, updateTodo, deleteTodo, setLoading, setError } from '../store';

const TodoList = () => {
  const [newTodoText, setNewTodoText] = useState('');
  const { items: todos, loading, error } = useSelector(state => state.todos);
  const dispatch = useDispatch();

  useEffect(() => {
    // Alert to show we're in the main app
    alert('Main App: TodoList component loaded');
    
    const fetchTodos = async () => {
      dispatch(setLoading());
      try {
        const response = await fetch('http://localhost:3001/api/todos');
        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }
        const data = await response.json();
        dispatch(setTodos(data));
      } catch (err) {
        dispatch(setError(err.message));
      }
    };

    fetchTodos();
  }, [dispatch]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    try {
      const response = await fetch('http://localhost:3001/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodoText }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const newTodo = await response.json();
      dispatch(addTodo(newTodo));
      setNewTodoText('');
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const response = await fetch(`http://localhost:3001/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      dispatch(updateTodo(updatedTodo));
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      dispatch(deleteTodo(id));
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      
      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit">Add</button>
      </form>
      
      <ul className="todos">
        {todos.map((todo) => (
          <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <span onClick={() => handleToggleTodo(todo)}>
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList; 