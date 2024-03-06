// HowToPage.js
import React from 'react';
import './HowToPage.css'; // Import the CSS file for styling

const HowToPage = ({ onClose }) => {
  return (
    <div className="how-to-overlay"> {/* Apply overlay styling */}
      <div className="how-to-page">
        <span className="close-button" onClick={onClose}>&times;</span> {/* Close button */}
        <h1>How to do Bicep Curl Exercise</h1>
        <p>Instructions:</p>
        <p>- Pick any weights which are comfortable for you in both hands.</p>
        <p>- Make sure you are at a comfortable distance away from your device and 
            your entire body is visible at the center of screen.
        </p>
        <p>-Ensure you are in well lit area with no background lights to obstruct your cam feed.</p>
        <p>-Make sure only you single person is doing exercise infront of cam for best results.</p>
        <p>-After checking your environment well now its time to do the actual exercise.</p>
        <p>- Stand with your feet shoulder-width apart, holding a dumbbell or any weights in each hand.</p>
        <p>- Keep your elbows close to your torso and your palms facing forward.</p>
        <p>- Exhale and curl the weights while keeping your upper arms stationary.</p>
        <p>- Continue until your biceps are fully contracted and the dumbbells are at shoulder level.</p>
        <p>- Inhale and slowly lower the dumbbells back to the starting position.</p>
        <p>-curling till midway is not considered as correct form should curl completely till shoulder level.</p>
        <p>-Incase still you have any doubts check out the video below---</p>
        <div className="video-container">
          {/* YouTube embed iframe */}
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/CFBZ4jN1CMI?si=4-Q7RPqskFzOSF9c"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <button onClick={onClose}>Close</button> {/* Close button */}
      </div>
    </div>
  );
};

export default HowToPage;


