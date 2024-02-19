import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { create } from "zustand";

export default function Index() {
  return (
    <div className="grid h-screen place-items-center bg-slate-100">
      <div className="aspect-square size-[500px] rounded border border-slate-300 bg-white drop-shadow">
        <Canvas>
          <Render />
          <ambientLight intensity={Math.PI} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            decay={0}
            intensity={Math.PI}
          />
          <pointLight
            position={[-10, -10, -10]}
            decay={0}
            intensity={Math.PI}
          />
          <Box position={[-1.2, 0, 0]} />
          <Box position={[1.2, 0, 0]} />
        </Canvas>
      </div>
    </div>
  );
}

function Render() {
  const { rotation, setRotation } = useRotationStore();
  useFrame(() => {
    setRotation([rotation[0] + 0.01, rotation[1] + 0.04, rotation[2] + 0.01]);
  }, 1);
  useFrame(({ gl, scene, camera }) => {
    gl.render(scene, camera);
  }, 3);
  return null;
}

function Box(props: any) {
  const meshRef = useRef<JSX.IntrinsicElements["mesh"] | null>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame(
    (state, delta) =>
      meshRef.current!.rotation!.set(
        useRotationStore.getState().rotation[0],
        useRotationStore.getState().rotation[1],
        useRotationStore.getState().rotation[2],
      ),
    2,
  );

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "tomato"} />
    </mesh>
  );
}

interface RotationStore {
  rotation: [number, number, number];
  setRotation: (rotation: [number, number, number]) => void;
}

const useRotationStore = create<RotationStore>((set) => ({
  rotation: [0, 0, 0],
  setRotation: (rotation: [number, number, number]) => set({ rotation }),
}));
