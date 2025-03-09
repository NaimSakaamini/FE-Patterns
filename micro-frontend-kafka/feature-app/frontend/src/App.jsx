import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryManager from './components/CategoryManager';
import SessionInfo from './components/SessionInfo';
import './index.css';

// Base URL for all API requests - Feature App Backend
const API_BASE_URL = 'http://localhost:4001';

function App() {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for session data from headers (passed by the API gateway)
    const checkSession = async () => {
      console.log('🔍 [Feature App] Checking for session data...');
      try {
        // Get user ID from headers
        const userId = document.cookie.split('; ')
          .find(row => row.startsWith('userId='))
          ?.split('=')[1] || 
          new URLSearchParams(window.location.search).get('userId');

        if (!userId) {
          console.log('🔄 [Feature App] No userId in cookies or URL, trying direct login...');
          
          // For demo purposes, we'll create a mock session with user1
          // In a real app, you would redirect to the login page
          const mockUserId = '1';
          console.log('✅ [Feature App] Using mock user ID:', mockUserId);
          
          // Try to get session data from the backend
          const response = await axios.get(`${API_BASE_URL}/api/session-check`, {
            headers: {
              'x-user-id': mockUserId
            }
          });
          
          if (response.data.hasActiveSession) {
            console.log('✅ [Feature App] Session found via API');
            setSessionData({
              userId: response.data.session.userId,
              username: response.data.session.username,
              timestamp: response.data.session.timestamp,
              active: response.data.session.active,
              token: document.cookie.split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1] || 'mock-token'
            });
            alert(`Feature App: Session found for user ${response.data.session.username}`);
          } else {
            console.error('❌ [Feature App] No active session found');
            setError('No active session found');
            alert('Feature App: No active session found. Please log in through the main app.');
          }
        } else {
          // User ID found in cookies or URL
          console.log('✅ [Feature App] User ID found:', userId);
          console.log('📢 [Feature App] Received session data from Kafka');
          setSessionData({
            userId: userId,
            username: 'user1',
            timestamp: new Date().toISOString(),
            active: true,
            token: document.cookie.split('; ')
              .find(row => row.startsWith('token='))
              ?.split('=')[1] || 'mock-token'
          });
          alert('Feature App: Session data received from Kafka');
        }
      } catch (error) {
        console.error('❌ [Feature App] Error checking session:', error);
        setError('Failed to check session');
        alert('Feature App: Error checking session. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading Feature App...</h2>
          <p>Checking session data from Kafka...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Error</h2>
          <p>{error}</p>
          <p>Please log in through the main application.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Feature App</h1>
      <p>This is the feature app that consumes session data from Kafka.</p>
      
      <SessionInfo sessionData={sessionData} />
      
      <CategoryManager sessionData={sessionData} />
    </div>
  );
}

export default App; 