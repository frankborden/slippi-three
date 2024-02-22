import { Gltf, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, GroupProps, useFrame } from "@react-three/fiber";
import { decode } from "@shelacek/ubjson";
import { useRef } from "react";
import {
  Button,
  FileTrigger,
  Label,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";
import { OrthographicCamera } from "three";
import { create } from "zustand";

import { charactersExt } from "~/common/names";
import { PlayerSettings, RenderData, ReplayData } from "~/common/types";
import { parseReplay } from "~/parser";
import { renderReplay } from "~/render";
import { actionMapByInternalId } from "~/render/characters";

const modelFileByExternalId = [
  "falcon",
  "Donkey Kong",
  "fox",
  "Mr. Game & Watch",
  "Kirby",
  "Bowser",
  "Link",
  "Luigi",
  "Mario",
  "marth",
  "Mewtwo",
  "Ness",
  "peach",
  "Pikachu",
  "Ice Climbers",
  "jigglypuff",
  "Samus",
  "Yoshi",
  "Zelda",
  "sheik",
  "falco",
  "Young Link",
  "Dr. Mario",
  "Roy",
  "Pichu",
  "Ganondorf",
];

function lerp(current: number, target: number) {
  const smoothness = 0.05;
  return current * (1 - smoothness) + target * smoothness;
}

export default function Index() {
  const { setRenderData, replay, setReplay, frame, setFrame } = store();

  async function openFile(files: FileList | null) {
    if (!files) return;
    const { raw, metadata } = decode(await files[0].arrayBuffer(), {
      useTypedArrays: true,
    });
    const replay = parseReplay(metadata, raw);
    setReplay(replay);
    setRenderData(renderReplay(replay));
  }

  return (
    <div className="p-8">
      <FileTrigger onSelect={openFile}>
        <Button className="rounded bg-emerald-700 px-3 py-0.5 text-emerald-50 hover:bg-emerald-600 hover:text-white">
          Open Replay
        </Button>
      </FileTrigger>
      <Slider
        value={frame}
        minValue={0}
        maxValue={replay?.frames.length ?? 10}
        onChange={(f) => setFrame(f)}
        className="my-4 w-[500px]"
      >
        <div className="flex justify-between">
          <Label>Frame</Label>
          <SliderOutput />
        </div>
        <SliderTrack className="relative h-4 w-full">
          {({ state }) => (
            <>
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/40" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
                style={{ width: `${state.getThumbPercent(0) * 100}%` }}
              />
              <SliderThumb className="top-1/2 h-4 w-4 rounded-full border border-slate-950 bg-white ring-black transition" />
            </>
          )}
        </SliderTrack>
      </Slider>
      <div className="relative aspect-video max-w-[40vw] rounded border border-slate-700 bg-slate-800">
        <Canvas orthographic camera={{ position: [0, 0, 100] }}>
          <Replay />
        </Canvas>
        <HUD />
      </div>
    </div>
  );
}

function Replay() {
  const { frame, setFrame, replay, renderData } = store();
  useFrame(() => {
    if (replay) {
      setFrame(frame === replay.frames.length - 1 ? 0 : frame + 1);
    }
  }, -2);
  useFrame(({ camera }) => {
    if (replay && renderData) {
      const focusPoints = renderData[frame].map(({ playerState }) => ({
        x: playerState.xPosition,
        y: playerState.yPosition,
      }));
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const { x, y } of focusPoints) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;
      const width = Math.max(100, maxX - minX + 20);
      const height = Math.max(100, maxY - minY + 20);
      const aspect = 16 / 9;
      const targetWidth = Math.max(width, height * aspect);
      const targetHeight = targetWidth / aspect;
      const cam = camera as OrthographicCamera;
      cam.left = lerp(cam.left, midX - targetWidth / 2);
      cam.right = lerp(cam.right, midX + targetWidth / 2);
      cam.top = lerp(cam.top, midY + targetHeight / 2);
      cam.bottom = lerp(cam.bottom, midY - targetHeight / 2);
      cam.updateProjectionMatrix();
    }
  }, -1);

  return (
    <>
      <Gltf
        src="/models/battlefield.glb"
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.8}
      />
      {replay?.settings.playerSettings
        .filter(Boolean)
        .map((settings) => (
          <Character
            key={settings.externalCharacterId}
            rotation={[0, -Math.PI / 2, 0]}
            settings={settings}
          />
        ))}
    </>
  );
}

function Character(props: GroupProps & { settings: PlayerSettings }) {
  const { scene, animations } = useGLTF(
    `/models/${modelFileByExternalId[props.settings.externalCharacterId]}.glb`,
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
      ].find((r) => r.playerSettings.playerIndex === props.settings.playerIndex);
    const prevRenderData = store
      .getState()
      .renderData?.[
        store.getState().frame - 1
      ]?.find((r) => r.playerSettings.playerIndex === props.settings.playerIndex);
    if (!renderData || !prevRenderData || !ref.current) return;
    if (renderData.animationName !== prevRenderData.animationName) {
      const action = actions[renderData.animationName];
      if (action) {
        mixer.stopAllAction();
        action.play();
      }
    }

    ref.current.position!.set(
      renderData.playerState.xPosition,
      renderData.playerState.yPosition,
      0,
    );
    const scale =
      actionMapByInternalId[renderData.playerState.internalCharacterId].scale;
    ref.current.scale!.set(scale, scale, scale * -renderData.facingDirection);
  }, -1);

  return <primitive {...props} object={scene} ref={ref} dispose={null} />;
}

function HUD() {
  const { replay, frame } = store();
  return (
    <div className="absolute bottom-0 left-0 w-full text-white">
      <div className="flex justify-around">
        {replay?.settings.playerSettings.map((settings, i) => (
          <div
            key={i}
            className="flex flex-col items-center"
            style={{
              WebkitTextStroke: "0.1px black",
            }}
          >
            <div className="flex">
              {[
                ...Array(
                  replay.frames[frame].players[i].state.stocksRemaining,
                ).keys(),
              ].map((i) => (
                <img
                  key={i}
                  src={`/stockicons/${settings.externalCharacterId}/0.png`}
                  className="size-4"
                />
              ))}
            </div>
            <div>
              {Math.round(replay.frames[frame].players[i].state.percent)}%
            </div>
            <div>{settings.connectCode}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Store {
  frame: number;
  setFrame: (frame: number) => void;
  replay: ReplayData | null;
  setReplay: (replay: ReplayData) => void;
  renderData: RenderData[][] | null;
  setRenderData: (renderData: RenderData[][]) => void;
}

const store = create<Store>((set) => ({
  frame: 0,
  setFrame: (frame: number) => set({ frame }),
  replay: null,
  setReplay: (replay: ReplayData) => set({ replay }),
  renderData: null,
  setRenderData: (renderData: RenderData[][]) => set({ renderData }),
}));
