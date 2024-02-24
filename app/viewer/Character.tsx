import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Euler, MeshBasicMaterial, SkinnedMesh, type Vector3 } from "three";

import { PlayerSettings } from "~/common/types";
import { actionMapByInternalId } from "~/viewer/characters";
import { store } from "~/viewer/store";

export function Character({
  settings,
  tint,
}: {
  settings: PlayerSettings;
  tint: boolean;
}) {
  // Junk is appended to the URL to prevent three.js from remounting the same
  // model in dittos and breaking everything. The loader manager must later
  // remove the junk to get back caching.
  const { scene, animations } = useGLTF(
    `/models/${modelFileByExternalId[settings.externalCharacterId]}.glb?playerIndex=${settings.playerIndex}`,
    undefined,
    undefined,
    (loader) => loader.manager.setURLModifier((url) => url.split("?")[0]),
  );

  useEffect(() => {
    // TODO: Position already captures movement caused by animations JOBJ_1
    // and JOBJ_0 keyframes should be cleared in Blender.
    animations.forEach((animation) => {
      animation.tracks = animation.tracks.filter(
        (track) =>
          track.name !== "JOBJ_0.position" && track.name !== "JOBJ_1.position",
      );
    });
  }, [animations]);

  useEffect(() => {
    scene.traverse((obj) => {
      if (!tint) return;
      if ("isMesh" in obj && obj.isMesh) {
        let color = 0xffffff;
        switch (settings.playerIndex) {
          case 0:
            color = 0xffbbbb;
            break;
          case 1:
            color = 0xbbbbff;
            break;
          case 2:
            color = 0xffffbb;
            break;
          case 3:
            color = 0xbbffbb;
            break;
        }
        ((obj as SkinnedMesh).material as MeshBasicMaterial).color.set(color);
      }
    });
  }, [scene, settings, tint]);

  const ref = useRef<JSX.IntrinsicElements["group"] | null>(null);
  const { mixer, actions } = useAnimations(animations, scene);

  useFrame(() => {
    const renderData = store
      .getState()
      .renderData?.[
        store.getState().frame
      ].find((r) => r.playerSettings.playerIndex === settings.playerIndex);
    const prevRenderData = store
      .getState()
      .renderData?.[
        store.getState().frame - 1
      ]?.find((r) => r.playerSettings.playerIndex === settings.playerIndex);
    if (!renderData || !prevRenderData || !ref.current) return;
    const action = actions[renderData.animationName];
    if (action) {
      mixer.stopAllAction();
      action.play();
      mixer.setTime(renderData.animationFrame / 60);
    }

    (ref.current.position! as Vector3).set(
      renderData.playerState.xPosition,
      renderData.playerState.yPosition,
      0,
    );

    let angle = 0;
    if (renderData.animationName === "DamageFlyRoll") {
      const xSpeed =
        renderData.playerState.selfInducedAirXSpeed +
        renderData.playerState.attackBasedXSpeed;
      const ySpeed =
        renderData.playerState.selfInducedAirYSpeed +
        renderData.playerState.attackBasedYSpeed;
      angle = Math.atan2(ySpeed, xSpeed) - Math.PI / 2;
    } else if (
      (renderData.playerSettings.externalCharacterId === 2 ||
        renderData.playerSettings.externalCharacterId === 20) &&
      renderData.animationName === "SpecialHi"
    ) {
      const xSpeed =
        renderData.playerState.selfInducedAirXSpeed +
        renderData.playerState.attackBasedXSpeed;
      const ySpeed =
        renderData.playerState.selfInducedAirYSpeed +
        renderData.playerState.attackBasedYSpeed;
      angle =
        renderData.facingDirection === 1
          ? Math.atan2(ySpeed, xSpeed)
          : Math.atan2(ySpeed, xSpeed) - Math.PI;
    }
    (ref.current.rotation! as Euler).reorder("YXZ");
    (ref.current.rotation! as Euler).set(
      angle,
      (renderData.facingDirection * Math.PI) / 2,
      0,
    );

    const scale =
      actionMapByInternalId[renderData.playerState.internalCharacterId].scale;
    (ref.current.scale! as Vector3).setScalar(scale);
  }, -1);

  return <primitive object={scene} ref={ref} dispose={null} />;
}

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
