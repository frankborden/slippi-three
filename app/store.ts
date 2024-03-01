import { create } from "zustand";

import { RenderData, ReplayData, ReplayStub } from "~/common/types";
import ParserWorker from "~/worker?worker";

let worker: Worker | undefined;
if (typeof document !== "undefined") {
  worker = new ParserWorker();
}

export interface Store {
  // Local files
  addFiles: (files: File[]) => void;
  parseProgress: number | undefined;
  setParseProgress: (parseProgress: number | undefined) => void;
  stubs: [ReplayStub, File][];
  setStubs: (stubs: [ReplayStub, File][]) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
  selectedStub: [ReplayStub, File] | undefined;
  setSelectedStub: (selectedStub: [ReplayStub, File] | undefined) => void;

  // Viewer
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
  // Local files
  addFiles: (files: File[]) => worker?.postMessage(files),
  parseProgress: undefined,
  setParseProgress: (parseProgress: number | undefined) =>
    set({ parseProgress }),
  stubs: [],
  setStubs: (stubs: [ReplayStub, File][]) => set({ stubs }),
  currentPage: 0,
  setCurrentPage: (currentPage: number) => set({ currentPage }),
  selectedStub: undefined,
  setSelectedStub: (selectedStub: [ReplayStub, File] | undefined) =>
    set({ selectedStub }),

  // Viewer
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

if (worker) {
  worker.onmessage = (event) => {
    if (event.data.progress !== undefined) {
      store.getState().setParseProgress(event.data.progress);
    } else {
      store.getState().setStubs(event.data.stubs);
      store.getState().setParseProgress(undefined);
    }
  };
}
