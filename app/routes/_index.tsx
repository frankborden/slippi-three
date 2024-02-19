import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { create } from "zustand";

export default function Index() {
  return (
    <div className="grid h-screen place-items-center bg-slate-100">
      <div className="aspect-square size-[500px] rounded border border-slate-300 bg-white drop-shadow">
        <Canvas>
          <Replay />
        </Canvas>
      </div>
    </div>
  );
}

function Replay() {
  const { rotation, setRotation } = store();
  useFrame(() => {
    setRotation([rotation[0] + 0.01, rotation[1] + 0.04, rotation[2] + 0.01]);
  }, -1);

  return (
    <>
      <ambientLight intensity={Math.PI} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </>
  );
}

function Box(props: any) {
  const meshRef = useRef<JSX.IntrinsicElements["mesh"] | null>(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame(() => {
    const storeRotation = store.getState().rotation;
    meshRef.current!.rotation!.set(
      storeRotation[0],
      storeRotation[1],
      storeRotation[2],
    );
  });

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

interface Store {
  rotation: [number, number, number];
  setRotation: (rotation: [number, number, number]) => void;
}

const store = create<Store>((set) => ({
  rotation: [0, 0, 0],
  setRotation: (rotation: [number, number, number]) => set({ rotation }),
}));
