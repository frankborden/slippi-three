import { Gltf } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

import { Camera } from "~/viewer/Camera";
import { Character } from "~/viewer/Character";
import { HUD } from "~/viewer/HUD";
import { store } from "~/viewer/store";

export function Replay() {
  return (
    <div className="relative aspect-video max-w-[40vw] rounded border border-slate-700 bg-slate-950">
      <Canvas orthographic camera={{ position: [0, 0, 100] }}>
        <Scene />
      </Canvas>
      <HUD />
    </div>
  );
}

function Scene() {
  const { replay } = store();
  useFrame(() => {
    const { frame, setFrame, paused } = store.getState();
    if (replay && !paused) {
      setFrame(frame === replay.frames.length - 1 ? 0 : frame + 1);
    }
  }, -2);
  let stageSrc = "/models/battlefield.glb";
  let stageScale = 0.8;
  switch (replay?.settings.stageId) {
    case 2:
      stageSrc = "/models/fountainofdreams.glb";
      stageScale = 1;
      break;
    case 3:
      stageSrc = "/models/pokemonstadium.glb";
      stageScale = 1.25;
      break;
    case 8:
      stageSrc = "/models/yoshisstory.glb";
      stageScale = 1;
      break;
    case 28:
      stageSrc = "/models/dreamland.glb";
      stageScale = 1;
      break;
    case 31:
      stageSrc = "/models/battlefield.glb";
      stageScale = 0.8;
      break;
    case 32:
      stageSrc = "/models/finaldestination.glb";
      stageScale = 1;
      break;
  }
  const characterIds =
    replay?.settings.playerSettings
      .filter(Boolean)
      .map((settings) => settings.externalCharacterId) ?? [];
  const duplicateCharacter = characterIds.some(
    (id, index) => characterIds.indexOf(id) !== index,
  );

  return (
    <>
      <Camera />
      <Gltf src={stageSrc} rotation={[0, -Math.PI / 2, 0]} scale={stageScale} />
      {replay?.settings.playerSettings
        .filter(Boolean)
        .map((settings) => (
          <Character
            key={settings.externalCharacterId}
            settings={settings}
            tint={duplicateCharacter}
          />
        ))}
    </>
  );
}
