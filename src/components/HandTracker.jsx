import { useEffect, useRef } from "react";
import {
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

import { useHandStore } from "../store/handStore";

import {
  detectFingerStates,
  detectGestures,
} from "../gestures/HandGestures";

import { detectPinch } from "../gestures/PinchDetector";

export default function HandTracker() {
  const videoRef = useRef(null);

  const setHandState = useHandStore(
    (state) => state.setHandState
  );

  const resetHand = useHandStore(
    (state) => state.resetHand
  );

  useEffect(() => {
    let handLandmarker = null;
    let stream = null;

    let animationFrameId = null;

    let isActive = true;

    let lastDetectionTime = 0;

    let previousVideoTime = -1;

    let previousPinchState = false;

    // --------------------------------
    // Detection settings
    // --------------------------------

    const DETECTION_INTERVAL = 40;
    // ~25 hand detections per second

    async function initialize() {
      try {
        console.log(
          "Starting NovaDesk Hand Tracking..."
        );

        // --------------------------------
        // MediaPipe WASM
        // --------------------------------

        const vision =
          await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
          );

        // Component may have been
        // unmounted while loading.
        if (!isActive) return;

        // --------------------------------
        // Hand Landmarker
        // --------------------------------

        handLandmarker =
          await HandLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath:
                  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              },

              runningMode: "VIDEO",

              numHands: 1,

              minHandDetectionConfidence: 0.6,

              minHandPresenceConfidence: 0.6,

              minTrackingConfidence: 0.6,
            }
          );

        if (!isActive) {
          handLandmarker.close();
          handLandmarker = null;
          return;
        }

        console.log(
          "NovaDesk Hand Tracking Engine Loaded"
        );

        // --------------------------------
        // Webcam
        // --------------------------------

        stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                ideal: 640,
              },

              height: {
                ideal: 480,
              },

              frameRate: {
                ideal: 30,
                max: 30,
              },

              facingMode: "user",
            },

            audio: false,
          });

        if (!isActive) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        const video =
          videoRef.current;

        if (!video) return;

        video.srcObject = stream;

        await video.play();

        if (!isActive) return;

        console.log(
          "NovaDesk Webcam Ready"
        );

        animationFrameId =
          requestAnimationFrame(
            detectHands
          );
      } catch (error) {
        console.error(
          "NovaDesk Hand Tracking Error:",
          error
        );
      }
    }

    // --------------------------------
    // Detection loop
    // --------------------------------

    function detectHands(timestamp) {
      if (!isActive) return;

      const video =
        videoRef.current;

      if (
        !video ||
        !handLandmarker ||
        video.readyState < 2
      ) {
        animationFrameId =
          requestAnimationFrame(
            detectHands
          );

        return;
      }

      // --------------------------------
      // Don't process the exact
      // same video frame twice.
      // --------------------------------

      if (
        video.currentTime ===
        previousVideoTime
      ) {
        animationFrameId =
          requestAnimationFrame(
            detectHands
          );

        return;
      }

      // --------------------------------
      // Limit detection frequency
      // --------------------------------

      if (
        timestamp -
          lastDetectionTime <
        DETECTION_INTERVAL
      ) {
        animationFrameId =
          requestAnimationFrame(
            detectHands
          );

        return;
      }

      lastDetectionTime = timestamp;

      previousVideoTime =
        video.currentTime;

      // --------------------------------
      // MediaPipe detection
      // --------------------------------

      let results;

      try {
        results =
          handLandmarker.detectForVideo(
            video,
            timestamp
          );
      } catch (error) {
        console.error(
          "Hand detection error:",
          error
        );

        animationFrameId =
          requestAnimationFrame(
            detectHands
          );

        return;
      }

      // --------------------------------
      // No hand detected
      // --------------------------------

      if (
        !results.landmarks ||
        results.landmarks.length === 0
      ) {
        previousPinchState = false;

        resetHand();

        animationFrameId =
          requestAnimationFrame(
            detectHands
          );

        return;
      }

      // --------------------------------
      // Get first hand
      // --------------------------------

      const landmarks =
        results.landmarks[0];

      // --------------------------------
      // Important landmarks
      // --------------------------------

      const wrist =
        landmarks[0];

      const thumbTip =
        landmarks[4];

      const indexTip =
        landmarks[8];

      // --------------------------------
      // Palm center
      // --------------------------------

      const palmCenter = {
        x:
          (
            landmarks[0].x +
            landmarks[5].x +
            landmarks[9].x +
            landmarks[13].x +
            landmarks[17].x
          ) / 5,

        y:
          (
            landmarks[0].y +
            landmarks[5].y +
            landmarks[9].y +
            landmarks[13].y +
            landmarks[17].y
          ) / 5,

        z:
          (
            landmarks[0].z +
            landmarks[5].z +
            landmarks[9].z +
            landmarks[13].z +
            landmarks[17].z
          ) / 5,
      };

      // --------------------------------
      // Hand size
      // --------------------------------

      const dx =
        landmarks[5].x -
        landmarks[17].x;

      const dy =
        landmarks[5].y -
        landmarks[17].y;

      const dz =
        landmarks[5].z -
        landmarks[17].z;

      const handSize = Math.sqrt(
        dx * dx +
        dy * dy +
        dz * dz
      );

      // --------------------------------
      // Mirrored cursor
      // --------------------------------

      const cursorX =
        1 - indexTip.x;

      const cursorY =
        indexTip.y;

      // --------------------------------
      // Pinch
      // --------------------------------

      const pinching =
        detectPinch(
          thumbTip,
          indexTip,
          landmarks,
          previousPinchState
        );

      previousPinchState =
        pinching;

      // --------------------------------
      // Finger states
      // --------------------------------

      const fingers =
        detectFingerStates(
          landmarks
        );

      // --------------------------------
      // Gestures
      // --------------------------------

      const gestures =
        detectGestures(
          fingers,
          pinching
        );

      // --------------------------------
      // Update store
      // --------------------------------

      setHandState({
        handDetected: true,

        landmarks,

        indexTip: {
          x: indexTip.x,
          y: indexTip.y,
          z: indexTip.z,
        },

        thumbTip: {
          x: thumbTip.x,
          y: thumbTip.y,
          z: thumbTip.z,
        },

        wrist: {
          x: wrist.x,
          y: wrist.y,
          z: wrist.z,
        },

        palmCenter,

        handSize,

        fingers,

        gestures,

        isPinching: pinching,

        fingerPosition: {
          x: cursorX,
          y: cursorY,
        },
      });

      // --------------------------------
      // Continue loop
      // --------------------------------

      animationFrameId =
        requestAnimationFrame(
          detectHands
        );
    }

    initialize();

    // --------------------------------
    // Cleanup
    // --------------------------------

    return () => {
      console.log(
        "Stopping NovaDesk Hand Tracking"
      );

      isActive = false;

      if (animationFrameId) {
        cancelAnimationFrame(
          animationFrameId
        );
      }

      if (stream) {
        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        stream = null;
      }

      if (handLandmarker) {
        handLandmarker.close();
        handLandmarker = null;
      }

      previousVideoTime = -1;
      previousPinchState = false;

      resetHand();
    };
  }, [setHandState, resetHand]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: "absolute",

        top: 10,
        right: 10,

        width: "250px",

        border:
          "2px solid cyan",

        zIndex: 100,

        transform:
          "scaleX(-1)",
      }}
    />
  );
}