import { create } from "zustand";

export const useHandStore = create((set) => ({
  // --------------------------------
  // Hand detection
  // --------------------------------

  handDetected: false,

  // --------------------------------
  // All 21 MediaPipe landmarks
  // --------------------------------

  landmarks: [],

  // --------------------------------
  // Important landmarks
  // --------------------------------

  indexTip: {
    x: 0,
    y: 0,
    z: 0,
  },

  thumbTip: {
    x: 0,
    y: 0,
    z: 0,
  },

  wrist: {
    x: 0,
    y: 0,
    z: 0,
  },

  palmCenter: {
    x: 0,
    y: 0,
    z: 0,
  },

  // --------------------------------
  // Hand measurements
  // --------------------------------

  handSize: 0,

  // --------------------------------
  // Finger states
  // --------------------------------

  fingers: {
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  },

  // --------------------------------
  // Gesture states
  // --------------------------------

  gestures: {
    pinch: false,
    pointing: false,
    openPalm: false,
    fist: false,
  },

  // --------------------------------
  // Cursor position
  // --------------------------------

  fingerPosition: {
    x: 0.5,
    y: 0.5,
  },

  // --------------------------------
  // Update complete hand state
  // --------------------------------

  setHandState: (handState) =>
    set(handState),

  // --------------------------------
  // Finger position
  // --------------------------------

  setFingerPosition: (x, y) =>
    set({
      fingerPosition: {
        x,
        y,
      },
    }),

  // --------------------------------
  // Pinch
  // --------------------------------

  setPinching: (value) =>
    set((state) => ({
      isPinching: value,

      gestures: {
        ...state.gestures,
        pinch: value,
      },
    })),

  // Compatibility with existing code
  isPinching: false,

  // --------------------------------
  // Reset hand
  // --------------------------------

  resetHand: () =>
    set({
      handDetected: false,

      landmarks: [],

      fingers: {
        thumb: false,
        index: false,
        middle: false,
        ring: false,
        pinky: false,
      },

      gestures: {
        pinch: false,
        pointing: false,
        openPalm: false,
        fist: false,
      },

      isPinching: false,
    }),
}));