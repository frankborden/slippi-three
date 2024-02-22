import { useAnimations, useGLTF } from "@react-three/drei";
import { GroupProps, useFrame } from "@react-three/fiber";
import { useRef } from "react";

import { PlayerSettings } from "~/common/types";
import { actionMapByInternalId } from "~/viewer/characters";
import { store } from "~/viewer/store";

export function Character(props: GroupProps & { settings: PlayerSettings }) {
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
    const action = actions[renderData.animationName];
    if (action) {
      mixer.stopAllAction();
      action.play();
      mixer.setTime(renderData.animationFrame / 60);
    }

    ref.current.position!.set(
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
    ref.current.rotation!.reorder("YXZ");
    ref.current.rotation!.set(angle, -Math.PI / 2, 0);

    const scale =
      actionMapByInternalId[renderData.playerState.internalCharacterId].scale;
    ref.current.scale!.set(scale, scale, scale * -renderData.facingDirection);
  }, -1);

  return <primitive {...props} object={scene} ref={ref} dispose={null} />;
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
