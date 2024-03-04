// WelcomePage.js

import React from 'react';

const WelcomePage = ({ onStartExercise }) => {
  return (
    <div className="welcome-page">
      <h1>Welcome to Bicep Curl Exercise</h1>
      <button onClick={onStartExercise}>Start Exercise</button>
    </div>
  );
};

export default WelcomePage;
