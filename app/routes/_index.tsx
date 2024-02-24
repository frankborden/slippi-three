import { decode } from "@shelacek/ubjson";
import { Button, FileTrigger } from "react-aria-components";

import { parseReplay } from "~/parser";
import { Controls } from "~/viewer/Controls";
import { Replay } from "~/viewer/Replay";
import { renderReplay } from "~/viewer/render";
import { store } from "~/viewer/store";

export default function Index() {
  const { setRenderData, setReplay, setFrame, setPaused } = store();

  async function openFile(files: FileList | null) {
    if (!files) return;
    const { raw, metadata } = decode(await files[0].arrayBuffer(), {
      useTypedArrays: true,
    });
    const replay = parseReplay(metadata, raw);
    setReplay(replay);
    setRenderData(renderReplay(replay));
    setFrame(0);
    setPaused(false);
  }

  return (
    <div className="p-8">
      <FileTrigger onSelect={openFile}>
        <Button className="rounded bg-emerald-700 px-3 py-0.5 text-emerald-50 hover:bg-emerald-600 hover:text-white">
          Open Replay
        </Button>
      </FileTrigger>
      <Controls />
      <Replay />
    </div>
  );
}
