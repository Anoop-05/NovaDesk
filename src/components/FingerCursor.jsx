import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useHandStore } from "../store/handStore";

export default function FingerCursor() {
  const meshRef = useRef();

  const fingerPosition = useHandStore(
    (state) => state.fingerPosition
  );

  const isPinching = useHandStore(
    (state) => state.isPinching
  );

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const targetX =
      (fingerPosition.x - 0.5) * 8;

    const targetY =
      -(fingerPosition.y - 0.5) * 5;

    const smoothing =
      1 - Math.exp(-18 * delta);

    meshRef.current.position.x +=
      (targetX -
        meshRef.current.position.x) *
      smoothing;

    meshRef.current.position.y +=
      (targetY -
        meshRef.current.position.y) *
      smoothing;

    // Subtle floating animation
    const pulse =
      1 +
      Math.sin(performance.now() * 0.008) *
        0.08;

    meshRef.current.scale.set(
      pulse,
      pulse,
      pulse
    );
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry
        args={[0.12, 24, 24]}
      />

      <meshBasicMaterial
        color={
          isPinching
            ? "lime"
            : "cyan"
        }
        toneMapped={false}
      />
    </mesh>
  );
}