import {
  Gltf,
  OrbitControls,
  OrthographicCamera,
  Stats,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { Canvas, GroupProps, useFrame } from "@react-three/fiber";
import { decode } from "@shelacek/ubjson";
import { useRef, useState } from "react";
import { create } from "zustand";

import { RenderData } from "~/common/types";
import { parseReplay } from "~/parser";
import { renderReplay } from "~/render";

export default function Index() {
  const setRenderData = store((state) => state.setRenderData);

  async function openFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const { raw, metadata } = decode(await file.arrayBuffer(), {
      useTypedArrays: true,
    });
    const replay = parseReplay(metadata, raw);
    setRenderData(renderReplay(replay));
  }

  return (
    <div className="grid h-screen place-items-center bg-slate-950 text-slate-200">
      <input type="file" onInput={openFile} />
      <div className="size-[800px] border border-slate-700 bg-slate-800">
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
      <Stats />
      <OrbitControls />
      <OrthographicCamera
        makeDefault
        left={-80}
        right={80}
        bottom={-60}
        top={100}
        near={1}
        far={60}
        position={[0, 0, 30]}
        zoom={1}
      />
      {/* <Gltf
        src="/models/battlefield.glb"
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.8}
      /> */}
      <Character rotation={[0, Math.PI / 2, 0]} playerIndex={0} />
      <Character rotation={[0, Math.PI / 2, 0]} playerIndex={1} />
    </>
  );
}

function Character(props: GroupProps & { playerIndex: number }) {
  const { scene, animations } = useGLTF(
    props.playerIndex === 1 ? "/models/fox.glb" : "/models/falcon.glb",
  );

  // TODO: Position already captures movement caused by animations JOBJ_1
  // and JOBJ_0 keyframes should be cleared in Blender.
  animations.forEach((animation) => {
    animation.tracks = animation.tracks.filter(
      (track) =>
        track.name !== "JOBJ_0.position" && track.name !== "JOBJ_1.position",
    );
  });

  const ref = useRef<JSX.IntrinsicElements["group"] | null>(null);
  const { mixer, actions } = useAnimations(animations, scene);

  useFrame(() => {
    const renderData = store
      .getState()
      .renderData?.[
        store.getState().frame
      ].find((r) => r.playerSettings.playerIndex === props.playerIndex);
    const prevRenderData = store
      .getState()
      .renderData?.[
        store.getState().frame - 1
      ]?.find((r) => r.playerSettings.playerIndex === props.playerIndex);
    if (!renderData || !prevRenderData || !ref.current) return;
    if (renderData.animationName !== prevRenderData.animationName) {
      const action = actions[renderData.animationName];
      if (action) {
        mixer.stopAllAction();
        action.play();
      }
    }

    ref.current.position.set(
      renderData.playerState.xPosition,
      renderData.playerState.yPosition,
      0,
    );
    const scale = props.playerIndex === 1 ? 0.96 : 0.97;
    ref.current.scale.set(scale, scale, scale * renderData.facingDirection);
  });

  return <primitive {...props} object={scene} ref={ref} dispose={null} />;
}

interface Store {
  frame: number;
  renderData: RenderData[][] | null;
  setFrame: (frame: number) => void;
  setRenderData: (renderData: RenderData[][]) => void;
}

const store = create<Store>((set) => ({
  frame: 0,
  renderData: null,
  setFrame: (frame: number) => set({ frame }),
  setRenderData: (renderData: RenderData[][]) => set({ renderData }),
}));
