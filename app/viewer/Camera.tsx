import { useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "three";

import { store } from "~/viewer/store";

export function Camera() {
  const { frame, replay, renderData } = store();
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
      const height = Math.max(80, maxY - minY + 20);
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
  return null;
}

function lerp(current: number, target: number) {
  const smoothness = 0.05;
  return current + (target - current) * smoothness;
}
