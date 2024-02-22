import { create } from "zustand";

import { RenderData, ReplayData } from "~/common/types";

export interface Store {
  frame: number;
  setFrame: (frame: number) => void;
  replay: ReplayData | null;
  setReplay: (replay: ReplayData) => void;
  renderData: RenderData[][] | null;
  setRenderData: (renderData: RenderData[][]) => void;
}

export const store = create<Store>((set) => ({
  frame: 0,
  setFrame: (frame: number) => set({ frame }),
  replay: null,
  setReplay: (replay: ReplayData) => set({ replay }),
  renderData: null,
  setRenderData: (renderData: RenderData[][]) => set({ renderData }),
}));
