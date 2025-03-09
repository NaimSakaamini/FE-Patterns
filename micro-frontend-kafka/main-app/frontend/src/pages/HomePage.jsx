import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TodoList from '../components/TodoList';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container">
      {isAuthenticated ? (
        <>
          <h1>Welcome, {user.username}!</h1>
          <p>This is the main application. You can manage your todos here.</p>
          <TodoList />
        </>
      ) : (
        <div className="card">
          <h1>Welcome to Micro Frontend Demo</h1>
          <p>Please log in to access the application.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage; 