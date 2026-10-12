function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;

  return Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  );
}

function fingerExtended(
  tip,
  pip,
  mcp
) {
  const tipToMcp = distance(tip, mcp);
  const pipToMcp = distance(pip, mcp);

  return tipToMcp > pipToMcp * 1.15;
}

export function detectFingerStates(
  landmarks
) {
  if (!landmarks || landmarks.length < 21) {
    return {
      thumb: false,
      index: false,
      middle: false,
      ring: false,
      pinky: false,
    };
  }

  const thumb = landmarks[4];

  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];
  const indexMCP = landmarks[5];

  const middleTip = landmarks[12];
  const middlePIP = landmarks[10];
  const middleMCP = landmarks[9];

  const ringTip = landmarks[16];
  const ringPIP = landmarks[14];
  const ringMCP = landmarks[13];

  const pinkyTip = landmarks[20];
  const pinkyPIP = landmarks[18];
  const pinkyMCP = landmarks[17];

  return {
    thumb: true,

    index: fingerExtended(
      indexTip,
      indexPIP,
      indexMCP
    ),

    middle: fingerExtended(
      middleTip,
      middlePIP,
      middleMCP
    ),

    ring: fingerExtended(
      ringTip,
      ringPIP,
      ringMCP
    ),

    pinky: fingerExtended(
      pinkyTip,
      pinkyPIP,
      pinkyMCP
    ),
  };
}

export function detectGestures(
  fingers,
  isPinching
) {
  const extendedCount = [
    fingers.index,
    fingers.middle,
    fingers.ring,
    fingers.pinky,
  ].filter(Boolean).length;

  const pointing =
    fingers.index &&
    !fingers.middle &&
    !fingers.ring &&
    !fingers.pinky;

  const openPalm =
    extendedCount >= 3;

  const fist =
    extendedCount === 0;

  return {
    pinch: isPinching,

    pointing,

    openPalm,

    fist,
  };
}