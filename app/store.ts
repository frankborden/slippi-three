import { create } from "zustand";

import { RenderData, ReplayData, ReplayStub, ReplayType } from "~/common/types";
import { queries } from "~/search/queries";
import { Highlight } from "~/search/search";
import ParserWorker from "~/worker?worker";

let worker: Worker | undefined;
if (typeof document !== "undefined") {
  worker = new ParserWorker();
}

export interface CharacterFilter {
  type: "character";
  externalCharacterId: number;
}
export interface StageFilter {
  type: "stage";
  stageId: number;
}
export interface ConnectCodeFilter {
  type: "connectCode";
  connectCode: string;
}
export interface DisplayNameFilter {
  type: "displayName";
  displayName: string;
}
export interface ReplayTypeFilter {
  type: "replayType";
  replayType: ReplayType;
}
export type Filter =
  | CharacterFilter
  | StageFilter
  | ConnectCodeFilter
  | DisplayNameFilter
  | ReplayTypeFilter;

export interface Store {
  // Local files
  addFiles: (files: File[]) => Promise<void>;
  parseProgress: number | undefined;
  setParseProgress: (parseProgress: number | undefined) => void;
  localStubs: [ReplayStub, File][];
  setLocalStubs: (stubs: [ReplayStub, File][]) => void;

  // Selection
  currentSource: "personal" | "uploads" | "events";
  setCurrentSource: (currentSource: "personal" | "uploads" | "events") => void;
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
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
  cameraPositions:
    | { left: number; right: number; top: number; bottom: number }[]
    | null;
  setCameraPositions: (
    cameraPositions: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }[],
  ) => void;
  paused: boolean;
  setPaused: (paused: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;

  // Highlights
  highlights: Record<string, Highlight[]>;
  setHighlights: (highlights: Record<string, Highlight[]>) => void;
}

export const store = create<Store>((set) => ({
  // Local files
  addFiles: (files: File[]) =>
    new Promise((resolve) => {
      worker!.onmessage = (event) => {
        if (event.data.progress !== undefined) {
          store.getState().setParseProgress(event.data.progress);
        } else {
          store.getState().setLocalStubs(event.data.stubs);
          store.getState().setParseProgress(undefined);
          resolve(undefined);
        }
      };
      worker!.postMessage(files);
    }),
  parseProgress: undefined,
  setParseProgress: (parseProgress: number | undefined) =>
    set({ parseProgress }),
  localStubs: [],
  setLocalStubs: (stubs: [ReplayStub, File][]) => set({ localStubs: stubs }),

  // Selection
  currentSource: "personal",
  setCurrentSource: (currentSource: "personal" | "uploads" | "events") =>
    set({ currentSource }),
  filters: [
    {
      externalCharacterId: 2,
      type: "character",
    },
    {
      externalCharacterId: 20,
      type: "character",
    },
    {
      stageId: 31,
      type: "stage",
    },
  ],
  setFilters: (filters: Filter[]) => set({ filters }),
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
  cameraPositions: null,
  setCameraPositions: (
    cameraPositions: {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }[],
  ) => set({ cameraPositions }),
  paused: false,
  setPaused: (paused: boolean) => set({ paused }),
  speed: 1,
  setSpeed: (speed: number) => set({ speed }),

  // Highlights
  highlights: Object.fromEntries(
    Object.entries(queries).map(([name]) => [name, []]),
  ),
  setHighlights: (highlights: Record<string, Highlight[]>) =>
    set({ highlights }),
}));
