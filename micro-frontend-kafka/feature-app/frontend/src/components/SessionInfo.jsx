import React from 'react';

const SessionInfo = ({ sessionData }) => {
  if (!sessionData) {
    return (
      <div className="session-info">
        <p>No session data available.</p>
      </div>
    );
  }

  return (
    <div className="session-info">
      <h3>Session Information</h3>
      <p>User ID: <strong>{sessionData.userId}</strong></p>
      <p>Username: <strong>{sessionData.username}</strong></p>
      <p>Session Active: <strong>{sessionData.active ? 'Yes' : 'No'}</strong></p>
      <p>Last Updated: <strong>{new Date(sessionData.timestamp).toLocaleString()}</strong></p>
    </div>
  );
};

export default SessionInfo; 