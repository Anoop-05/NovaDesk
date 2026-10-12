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

export function getNormalizedPinchDistance(
  thumbTip,
  indexTip,
  landmarks
) {
  if (!landmarks || landmarks.length < 21) {
    return 1;
  }

  const pinchDistance = distance(
    thumbTip,
    indexTip
  );

  // Palm width
  const palmSize = distance(
    landmarks[5],
    landmarks[17]
  );

  if (palmSize === 0) {
    return 1;
  }

  return pinchDistance / palmSize;
}

export function detectPinch(
  thumbTip,
  indexTip,
  landmarks,
  previousState = false
) {
  const normalizedDistance =
    getNormalizedPinchDistance(
      thumbTip,
      indexTip,
      landmarks
    );

  // Hysteresis:
  //
  // Opening pinch:
  // must get clearly close
  //
  // Releasing pinch:
  // must get clearly apart

  if (previousState) {
    return normalizedDistance < 0.65;
  }

  return normalizedDistance < 0.50;
}