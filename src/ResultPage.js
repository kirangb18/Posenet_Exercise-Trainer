import React from 'react';
import './App.css';

const ResultPage = ({ repsCompleted }) => {
  const handleGoBack = () => {
    window.location.href = '/'; // Redirect to the root route (WelcomePage)
  };

  return (
    <div className="result-page">
      <h1>Congratulations!</h1>
      <p>You've completed {repsCompleted} reps. Keep going!</p>
      <button onClick={handleGoBack}>Go Back to Welcome Page</button>
    </div>
  );
};

export default ResultPage;


