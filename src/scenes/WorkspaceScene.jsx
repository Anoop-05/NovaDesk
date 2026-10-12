import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import HoloPanel from "../components/HoloPanel";
import FingerCursor from "../components/FingerCursor";
import HoloEffects from "../effects/HoloEffects";

export default function WorkspaceScene() {
  return (
    <Canvas camera={{ position: [0, 1, 5] }}>
      <color attach="background" args={["black"]} />

      <ambientLight intensity={1} />

      <Grid
        args={[20, 20]}
        position={[0, -2, 0]}
      />

      <HoloPanel position={[-2, 1, 0]} />
      <HoloPanel position={[2, 1, 0]} />

      <FingerCursor />

      <OrbitControls />
      <HoloEffects />
    </Canvas>
  );
}