import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import FeatureAppPage from './pages/FeatureAppPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();
  
  if (loading) {
    return <div className="container">Loading...</div>;
  }
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/feature" 
          element={
            <ProtectedRoute>
              <FeatureAppPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App; 