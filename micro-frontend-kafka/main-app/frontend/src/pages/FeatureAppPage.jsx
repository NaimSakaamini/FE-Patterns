import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const FeatureAppPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featureAppUrl, setFeatureAppUrl] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 [Main App] Loading Feature App...');
      // In a real app, we would get the token and pass it to the iframe
      // For simplicity, we're just using the API gateway URL
      setFeatureAppUrl('http://localhost:4000/feature');
      setLoading(false);
      console.log('✅ [Main App] Feature App URL set:', 'http://localhost:4000/feature');
      alert('Loading Feature App via API Gateway. The Feature App will receive session data from Kafka.');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    console.log('❌ [Main App] Feature App access denied - not authenticated');
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>Please log in to access the feature app.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h2>Loading Feature App...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ [Main App] Error loading Feature App:', error);
    return (
      <div className="container">
        <div className="card">
          <h2>Error Loading Feature App</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Feature App</h1>
      <p>This is the feature app loaded via the API gateway.</p>
      <p><strong>Note:</strong> The Feature App is receiving session data from Kafka and will wait for it before rendering.</p>
      
      <div className="feature-app-container">
        <iframe
          src={featureAppUrl}
          title="Feature App"
          width="100%"
          height="500px"
          style={{ border: 'none', borderRadius: '8px' }}
          onLoad={() => console.log('✅ [Main App] Feature App iframe loaded')}
        />
      </div>
    </div>
  );
};

export default FeatureAppPage; 