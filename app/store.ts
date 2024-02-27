import { create } from "zustand";

import { RenderData, ReplayData } from "~/common/types";

export interface Store {
  openedTimestamp: number;
  setOpenedTimestamp: (openedTimestamp: number) => void;
  frame: number;
  setFrame: (frame: number) => void;
  replay: ReplayData | null;
  setReplay: (replay: ReplayData) => void;
  renderData: RenderData[][] | null;
  setRenderData: (renderData: RenderData[][]) => void;
  paused: boolean;
  setPaused: (paused: boolean) => void;
}

export const store = create<Store>((set) => ({
  openedTimestamp: Date.now(),
  setOpenedTimestamp: (openedTimestamp: number) => set({ openedTimestamp }),
  frame: 0,
  setFrame: (frame: number) => set({ frame }),
  replay: null,
  setReplay: (replay: ReplayData) => set({ replay }),
  renderData: null,
  setRenderData: (renderData: RenderData[][]) => set({ renderData }),
  paused: false,
  setPaused: (paused: boolean) => set({ paused }),
}));
