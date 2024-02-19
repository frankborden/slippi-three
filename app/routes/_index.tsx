import {
  OrbitControls,
  OrthographicCamera,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, GroupProps, useFrame } from "@react-three/fiber";
import { decode } from "@shelacek/ubjson";
import { useRef } from "react";
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
  const { frame, setFrame } = store();
  useFrame(() => setFrame(frame + 1), -1);

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
      <Character rotation={[0, Math.PI / 2, 0]} />
    </>
  );
}

function Character(props: GroupProps) {
  const { scene, animations } = useGLTF("/models/fox.glb");
  const ref = useRef<JSX.IntrinsicElements["group"] | null>(null);
  const { mixer, actions } = useAnimations(animations, scene);

  useFrame(() => {
    if (store.getState().frame % 400 === 1) {
      mixer.stopAllAction();
      actions.AttackAirB!.play();
    }
    if (store.getState().frame % 400 === 201) {
      mixer.stopAllAction();
      actions.AttackAirF!.play();
    }
  });

  return <primitive {...props} object={scene} ref={ref} dispose={null} />;
}

interface Store {
  frame: number;
  setFrame: (frame: number) => void;
}

const store = create<Store>((set) => ({
  frame: 0,
  setFrame: (frame: number) => set({ frame }),
}));
