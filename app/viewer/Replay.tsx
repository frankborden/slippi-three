import { Canvas, useFrame } from "@react-three/fiber";

import { Camera } from "~/viewer/Camera";
import { Character } from "~/viewer/Character";
import { HUD } from "~/viewer/HUD";
import { Stage } from "~/viewer/Stage";
import { store } from "~/viewer/store";

export function Replay() {
  return (
    <>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100] }}
        className="aspect-video shrink"
      >
        <Scene />
      </Canvas>
      <HUD />
    </>
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
      <Stage />
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
