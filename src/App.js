import React, { useRef, useState, useEffect } from "react";
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import WelcomePage from './WelcomePage';
import ResultPage from './ResultPage';
import * as tf from "@tensorflow/tfjs";

function App() {
  const [expectedReps, setExpectedReps] = useState(null);
  const [isExerciseStarted, setIsExerciseStarted] = useState(false);
  const [timer, setTimer] = useState(5); // Timer countdown in seconds
  const [isVisibleTimer, setIsVisibleTimer] = useState(true); // Controls the visibility of the timer
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const progressBarRef = useRef(null); // Ref for the progress bar
  const [leftCount, setLeftCount] = useState(0);
  const [leftFlag, setLeftFlag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false); // State to track if speech feedback is enabled
  const speechSynthRef = useRef(window.speechSynthesis); // Reference to the SpeechSynthesis API

  useEffect(() => {
    if (isExerciseStarted && timer > 0) {
      const countdown = setTimeout(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      // Clear the timer when the component unmounts or the exercise starts
      return () => clearTimeout(countdown);
    } else if (timer === 0) {
      // Hide the timer after the time limit is crossed
      setIsVisibleTimer(false);
      setIsLoading(true);

      const runPosenet = async () => {
        const net = await posenet.load({
          inputResolution: { width: 640, height: 480 },
          scale: 0.5
        });

        setInterval(() => {
          detect(net);
        }, 800);
      };

      const detect = async (net) => {
        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          video.width = videoWidth;
          video.height = videoHeight;

          const pose = await net.estimateSinglePose(video);

          const leftShoulder = pose.keypoints.find(keypoint => keypoint.part === 'leftShoulder').position;
          const leftElbow = pose.keypoints.find(keypoint => keypoint.part === 'leftElbow').position;
          const leftWrist = pose.keypoints.find(keypoint => keypoint.part === 'leftWrist').position;

          const angle = calcAngle(leftShoulder, leftElbow, leftWrist);

          if (angle < 50 && leftFlag !== 'down') {
            setLeftFlag('down');
          } else if (angle > 130 && leftFlag === 'down') {
            setLeftFlag('up');
          } else if (angle >= 50 && angle <= 130) {
            setLeftFlag('neutral');
          }
          drawCanvas(pose, video, videoWidth, videoHeight);
        }
      };

      const drawCanvas = (pose, video, videoWidth, videoHeight) => {
        if (!canvasRef.current) return; // Check if canvas is initialized
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        drawKeypoints(pose['keypoints'], 0.6, ctx);
        drawSkeleton(pose['keypoints'], 0.6, ctx);

        const leftShoulder = pose.keypoints.find(keypoint => keypoint.part === 'leftShoulder').position;
        const leftElbow = pose.keypoints.find(keypoint => keypoint.part === 'leftElbow').position;
        const leftWrist = pose.keypoints.find(keypoint => keypoint.part === 'leftWrist').position;

        const angle = calcAngle(leftShoulder, leftElbow, leftWrist);

        ctx.font = '0px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(`Angle: ${angle}`, 10, 30);
      };


      const calcAngle = (a, b, c) => {
        const ax = a.x, ay = a.y;
        const bx = b.x, by = b.y;
        const cx = c.x, cy = c.y;

        const ab = [ax - bx, ay - by];
        const bc = [cx - bx, cy - by];

        const dotProduct = ab[0] * bc[0] + ab[1] * bc[1];
        const magAB = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]);
        const magBC = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]);
        const cosTheta = dotProduct / (magAB * magBC);
        const thetaRad = Math.acos(cosTheta);
        const thetaDeg = (180 - (180 * thetaRad) / Math.PI).toFixed(2);

        return thetaDeg;
      };

      tf.setBackend('webgl');

      runPosenet();

      return () => {
        clearInterval(runPosenet);
      };
    }
  }, [isExerciseStarted, timer, leftFlag]); // Include leftFlag in the dependency array

  useEffect(() => {
    if (leftFlag === 'up') {
      setLeftCount(prevCount => prevCount + 1);
  
      // Speak out the remaining reps dynamically if speech feedback is enabled
      if (isSpeechEnabled && expectedReps !== null) {
        const remainingReps = expectedReps - (leftCount + 1); // +1 because leftCount is not updated yet
        if (remainingReps > 0) {
          const message = remainingReps === 1 ? `${remainingReps} more rep to go` : `${remainingReps} more reps to go`;
          speakMessage(message);
        } else if (remainingReps === 0) {
          speakMessage("Last rep");
        }
      }
  
      // If leftCount equals expectedReps, speak congratulatory message
      if (leftCount + 1 === expectedReps && isSpeechEnabled) {
        setTimeout(() => {
          speakMessage(`Congratulations! you have completed ${leftCount + 1} reps.`);
        }, 2000); // Wait for 2 seconds after last rep is detected
      }
    }
  }, [leftFlag]); // Only listen for leftFlag change to speak out reps

  const speakMessage = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthRef.current.speak(utterance);
  };

  const handleReset = () => {
    setIsExerciseStarted(false);
    setExpectedReps(null);
    setLeftCount(0);
    setTimer(5);
    setIsVisibleTimer(true);
    setIsLoading(false);
    setShowResult(false);
  };

  const handleStartExercise = (reps) => {
    setExpectedReps(reps);
    setIsExerciseStarted(true);
  };

  useEffect(() => {
    if (expectedReps !== null && leftCount === expectedReps) {
      setTimeout(() => {
        setShowResult(true);
      }, 2500); // Wait for 2 seconds before showing the result page
    }
  }, [leftCount, expectedReps]);

  useEffect(() => {
    // Calculate progress width based on remaining reps
    if (progressBarRef.current) {
      const remainingReps = expectedReps - leftCount;
      const progressWidth = `${(remainingReps / expectedReps) * 100}%`;
      progressBarRef.current.style.width = progressWidth;
    }
  }, [leftCount, expectedReps]);

  const handleToggleSpeech = (isEnabled) => {
    setIsSpeechEnabled(isEnabled);
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isExerciseStarted && !showResult && <WelcomePage onStartExercise={handleStartExercise} onToggleSpeech={handleToggleSpeech} />}
        {showResult && <ResultPage repsCompleted={leftCount} />}
        {isExerciseStarted && !showResult && (
          <>
            <Webcam
              ref={webcamRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 9,
                width: 640,
                height: 480
              }}
            />
            {isLoading && (
              <div className="loader">
                <p>Loading...</p>
              </div>
            )}
            {isVisibleTimer && (
              <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                <p>Exercise starts in {timer}</p>
              </div>
            )}
            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div ref={progressBarRef} className="progress-bar"></div>
            </div>
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 9,
                width: 640,
                height: 480
              }}
            />
            <div className="rep-counter">
              <p>Reps: {leftCount}</p>
              <p>Arms position: {leftFlag === 'down' ? 'Down' : leftFlag === 'up' ? 'Up' : 'Neutral'}</p>
            </div>
          </>
        )}
      </header>
      {showResult && <button onClick={handleReset}>Reset</button>}
    </div>
  );
}

export default App;







