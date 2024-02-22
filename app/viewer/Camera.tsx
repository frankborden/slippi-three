import { useFrame } from "@react-three/fiber";
import { MathUtils, type OrthographicCamera } from "three";

import { store } from "~/viewer/store";

export function Camera() {
  const { frame, replay, renderData } = store();
  useFrame(({ camera }) => {
    if (replay && renderData) {
      const focusPoints = renderData[frame]
        .filter(({ animationName }) => animationName !== "")
        .map(({ playerState }) => ({
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
      const smoothness = 0.06;
      cam.left = MathUtils.lerp(cam.left, midX - targetWidth / 2, smoothness);
      cam.right = MathUtils.lerp(cam.right, midX + targetWidth / 2, smoothness);
      cam.top = MathUtils.lerp(cam.top, midY + targetHeight / 2, smoothness);
      cam.bottom = MathUtils.lerp(
        cam.bottom,
        midY - targetHeight / 2,
        smoothness,
      );
      cam.updateProjectionMatrix();
    }
  }, -1);
  return null;
}
