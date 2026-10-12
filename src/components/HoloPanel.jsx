import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useHandStore } from "../store/handStore";

export default function HoloPanel({
  position = [0, 0, 0],
  size = [3, 1.6],
}) {
  const panelRef = useRef();

  const fingerPosition = useHandStore(
    (state) => state.fingerPosition
  );

  const isPinching = useHandStore(
    (state) => state.isPinching
  );

  const grabbed = useRef(false);
  const grabOffset = useRef([0, 0]);

  useFrame((_, delta) => {
    if (!panelRef.current) return;

    // --------------------------------
    // 1. Convert finger position
    // --------------------------------

    const cursorX =
      (fingerPosition.x - 0.5) * 8;

    const cursorY =
      -(fingerPosition.y - 0.5) * 5;

    // --------------------------------
    // 2. Panel position
    // --------------------------------

    const panelX =
      panelRef.current.position.x;

    const panelY =
      panelRef.current.position.y;

    const halfWidth = size[0] / 2;
    const halfHeight = size[1] / 2;

    // --------------------------------
    // 3. Hover detection
    // --------------------------------

    const hovering =
      cursorX > panelX - halfWidth &&
      cursorX < panelX + halfWidth &&
      cursorY > panelY - halfHeight &&
      cursorY < panelY + halfHeight;

    // --------------------------------
    // 4. Start grabbing
    // --------------------------------

    if (
      hovering &&
      isPinching &&
      !grabbed.current
    ) {
      grabbed.current = true;

      grabOffset.current = [
        panelX - cursorX,
        panelY - cursorY,
      ];
    }

    // --------------------------------
    // 5. Release
    // --------------------------------

    if (!isPinching) {
      grabbed.current = false;
    }

    // --------------------------------
    // 6. Move grabbed panel
    // --------------------------------

    if (grabbed.current) {
      const targetX =
        cursorX + grabOffset.current[0];

      const targetY =
        cursorY + grabOffset.current[1];

      const movementSmoothness =
        1 - Math.exp(-20 * delta);

      panelRef.current.position.x +=
        (targetX -
          panelRef.current.position.x) *
        movementSmoothness;

      panelRef.current.position.y +=
        (targetY -
          panelRef.current.position.y) *
        movementSmoothness;
    }

    // --------------------------------
    // 7. Panel color
    // --------------------------------

    const material =
      panelRef.current.material;

    if (grabbed.current) {
      material.color.set("lime");
    } else if (hovering) {
      material.color.set("white");
    } else {
      material.color.set("cyan");
    }

    // --------------------------------
    // 8. Panel scale
    // --------------------------------

    const targetScale = grabbed.current
      ? 1.06
      : hovering
      ? 1.03
      : 1;

    const scaleSmoothness =
      1 - Math.exp(-12 * delta);

    panelRef.current.scale.x +=
      (targetScale -
        panelRef.current.scale.x) *
      scaleSmoothness;

    panelRef.current.scale.y +=
      (targetScale -
        panelRef.current.scale.y) *
      scaleSmoothness;
  });

  return (
    <mesh
      ref={panelRef}
      position={position}
    >
      <planeGeometry args={size} />

      <meshBasicMaterial
        color="cyan"
        wireframe
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}