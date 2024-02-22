import {
  Label,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "react-aria-components";

import { store } from "~/viewer/store";

export function Controls() {
  const { replay, frame, setFrame } = store();
  return (
    <Slider
      value={frame}
      minValue={0}
      maxValue={replay?.frames.length ?? 10}
      onChange={(f) => setFrame(f)}
      className="my-4 w-[500px]"
    >
      <div className="flex justify-between">
        <Label>Frame</Label>
        <SliderOutput />
      </div>
      <SliderTrack className="relative h-4 w-full">
        {({ state }) => (
          <>
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/40" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
              style={{ width: `${state.getThumbPercent(0) * 100}%` }}
            />
            <SliderThumb className="top-1/2 h-4 w-4 rounded-full border border-slate-900 bg-white ring-black transition" />
          </>
        )}
      </SliderTrack>
    </Slider>
  );
}
