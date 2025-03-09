import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/">Micro Frontend Demo</Link>
        </div>
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/feature">Feature App</Link>
              <span className="user-info">Welcome, {user.username}</span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 