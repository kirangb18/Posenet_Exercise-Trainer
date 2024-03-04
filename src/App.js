import React, { useRef, useState, useEffect } from "react";
import './App.css';
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import WelcomePage from './WelcomePage';
import * as tf from "@tensorflow/tfjs";

function App() {
  const [isExerciseStarted, setIsExerciseStarted] = useState(false);
  const [timer, setTimer] = useState(5); // Timer countdown in seconds
  const [isVisibleTimer, setIsVisibleTimer] = useState(true); // Controls the visibility of the timer
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [leftCount, setLeftCount] = useState(0);
  const [leftFlag, setLeftFlag] = useState(null);

  const handleStartExercise = () => {
    setIsExerciseStarted(true);
  };

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
        const ctx = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        drawKeypoints(pose['keypoints'], 0.6, ctx);
        drawSkeleton(pose['keypoints'], 0.6, ctx);

        const leftShoulder = pose.keypoints.find(keypoint => keypoint.part === 'leftShoulder').position;
        const leftElbow = pose.keypoints.find(keypoint => keypoint.part === 'leftElbow').position;
        const leftWrist = pose.keypoints.find(keypoint => keypoint.part === 'leftWrist').position;

        const angle = calcAngle(leftShoulder, leftElbow, leftWrist);

        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
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
    }
  }, [leftFlag]);

  return (
    <div className="App">
      <header className="App-header">
        {!isExerciseStarted ? (
          <WelcomePage onStartExercise={handleStartExercise} />
        ) : (
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
            {isVisibleTimer && (
              <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                <p>Exercise starts in {timer}</p>
              </div>
            )}
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
    </div>
  );
}

export default App;




