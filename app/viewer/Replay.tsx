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
  const { frame, setFrame, replay } = store();
  useFrame(() => {
    if (replay) {
      setFrame(frame === replay.frames.length - 1 ? 0 : frame + 1);
    }
  }, -2);
  return (
    <>
      <Camera />
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
