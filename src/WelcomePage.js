import React, { useState } from 'react';
import HowToPage from './HowToPage';
import './WelcomePage.css';

const WelcomePage = ({ onStartExercise, onToggleSpeech }) => {
  const [expectedReps, setExpectedReps] = useState(5); // Default value
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [showHowToPage, setShowHowToPage] = useState(false);

  const handleInputChange = (e) => {
    setExpectedReps(parseInt(e.target.value));
  };

  const handleToggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    onToggleSpeech(!isSpeechEnabled);
  };

  const handleOpenHowToPage = () => {
    setShowHowToPage(true);
  };

  const handleCloseHowToPage = () => {
    setShowHowToPage(false);
  };

  return (
    <div className="welcome-page">
      <h1>Welcome to Bicep Curl Exercise</h1>
      <button onClick={handleOpenHowToPage}>How to do Bicep Curl</button>
      <div className="input-container">
        <label>Expected Reps:</label>
        <input
          type="number"
          value={expectedReps}
          onChange={handleInputChange}
          placeholder="Enter expected reps"
        />
      </div>
      <div className="input-container">
        <label>
          <input type="checkbox" checked={isSpeechEnabled} onChange={handleToggleSpeech} />
          Enable Audio Feedback
        </label>
      </div>
      <button className="start-exercise" onClick={() => onStartExercise(expectedReps)}>Start Exercise</button>
      {showHowToPage && <HowToPage onClose={handleCloseHowToPage} />}
    </div>
  );
};

export default WelcomePage;

