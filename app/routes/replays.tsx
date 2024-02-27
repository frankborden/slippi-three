import { decode } from "@shelacek/ubjson";
import { useState } from "react";
import {
  Button,
  FileTrigger,
  Key,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";

import { parseReplay } from "~/parser";
import { store } from "~/store";
import { Controls } from "~/viewer/Controls";
import { Replay } from "~/viewer/Replay";
import { renderReplay } from "~/viewer/render";

export default function Page() {
  const { openedTimestamp, replay } = store();

  return (
    <div className="flex grow">
      <ReplayList />
      <div className="grow bg-zinc-800 p-4">
        {replay && (
          <>
            <div className="relative flex flex-col overflow-y-auto rounded border border-zinc-700 bg-zinc-950">
              <Replay key={openedTimestamp} />
            </div>
            <Controls />
          </>
        )}
      </div>
    </div>
  );
}

function ReplayList() {
  const [source, setSource] = useState<Key>("personal");
  const { setRenderData, setReplay, setFrame, setPaused, setOpenedTimestamp } =
    store();

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
    setOpenedTimestamp(Date.now());
  }

  return (
    <div className="border-r border-r-zinc-700 bg-zinc-900 px-6 py-4">
      <div className="mb-0.5 ml-2 text-sm">Source</div>
      <Tabs onSelectionChange={setSource} selectedKey={source}>
        <TabList className="mb-4 flex gap-3 rounded-lg border border-zinc-600 p-2 *:rounded *:px-2 *:outline-none *:transition-colors *:duration-200 [&>[data-hovered]]:cursor-pointer [&>[data-hovered]]:bg-zinc-700 [&>[data-hovered]]:text-zinc-100 [&>[data-selected]]:bg-zinc-200 [&>[data-selected]]:text-zinc-950">
          <Tab id="personal">Personal</Tab>
          <Tab id="uploads">Uploads</Tab>
          <Tab id="events">Events</Tab>
        </TabList>
        <TabPanel id="personal">
          <FileTrigger onSelect={openFile}>
            <Button className="w-max rounded bg-zinc-700 px-3 py-0.5 text-zinc-50 hover:bg-zinc-600 hover:text-white">
              Open File
            </Button>
          </FileTrigger>
        </TabPanel>
        <TabPanel id="uploads">uploads</TabPanel>
        <TabPanel id="events">events</TabPanel>
      </Tabs>
    </div>
  );
}
