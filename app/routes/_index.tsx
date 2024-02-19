import {
  OrbitControls,
  OrthographicCamera,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, GroupProps, useFrame } from "@react-three/fiber";
import { decode } from "@shelacek/ubjson";
import { useEffect, useMemo, useRef } from "react";
import { SkeletonUtils } from "three-stdlib";
import { create } from "zustand";

import { parseReplay } from "~/parser";

export default function Index() {
  async function openFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const { raw, metadata } = decode(await file.arrayBuffer(), {
      useTypedArrays: true,
    });
    const replay = parseReplay(metadata, raw);
    console.log(replay.settings);
  }

  return (
    <div className="grid h-screen place-items-center bg-slate-100">
      <input type="file" onInput={openFile} />
      <div className="aspect-square size-[500px] rounded border border-slate-300 bg-white drop-shadow">
        <Canvas>
          <Replay />
        </Canvas>
      </div>
    </div>
  );
}

function Replay() {
  const { position, setPosition } = store();
  useFrame(() => {
    setPosition([(position[0] + 0.1) % 20, position[1] + 0, position[2] + 0]);
  }, -1);

  return (
    <>
      <OrbitControls />
      <OrthographicCamera
        makeDefault
        left={-20}
        right={20}
        bottom={-20}
        top={20}
        near={0.1}
        far={1000}
        position={[0, 0, 100]}
        zoom={1}
      />
      <Character rotation={[Math.PI / 2, 0, 0]} />
      <Character rotation={[0, Math.PI / 2, 0]} />
    </>
  );
}

function Character(props: GroupProps) {
  const { scene, animations } = useGLTF("/models/fox.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const ref = useRef<JSX.IntrinsicElements["group"] | null>(null);
  const { actions } = useAnimations(animations, clone);

  useFrame(() => {
    ref.current!.position!.set(
      store.getState().position[0],
      store.getState().position[1],
      store.getState().position[2],
    );
  });

  useEffect(() => {
    actions.AttackAirB.play();
  }, [actions]);

  return <primitive {...props} object={clone} ref={ref} dispose={null} />;
}

interface Store {
  position: [number, number, number];
  setPosition: (position: [number, number, number]) => void;
}

const store = create<Store>((set) => ({
  position: [0, 0, 0],
  setPosition: (position: [number, number, number]) => set({ position }),
}));
