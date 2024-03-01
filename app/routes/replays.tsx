import { decode } from "@shelacek/ubjson";
import { useState } from "react";
import {
  Button,
  FileTrigger,
  Key,
  ListBox,
  ListBoxItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "react-aria-components";
import { twMerge as cn } from "tailwind-merge";

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
  const {
    setRenderData,
    setReplay,
    setFrame,
    setPaused,
    setOpenedTimestamp,
    addFiles,
    localStubs,
    currentPage,
    setCurrentPage,
    selectedStub,
    setSelectedStub,
  } = store();

  const stubs = localStubs;

  async function openFile(files: FileList | null) {
    if (!files) return;
    addFiles(Array.from(files));
  }

  return (
    <div className="border-r border-r-zinc-700 bg-zinc-900 px-6 py-4">
      <div className="mb-0.5 ml-2 text-sm">Source</div>
      <Tabs onSelectionChange={setSource} selectedKey={source}>
        <TabList className="mb-4 flex w-max gap-3 rounded-lg border border-zinc-600 p-2 *:rounded *:px-2 *:outline-none *:transition-colors *:duration-200 [&>[data-hovered]]:cursor-pointer [&>[data-hovered]]:bg-zinc-700 [&>[data-hovered]]:text-zinc-100 [&>[data-selected]]:bg-zinc-300 [&>[data-selected]]:text-zinc-950">
          <Tab id="personal">Personal</Tab>
          <Tab id="uploads">Uploads</Tab>
          <Tab id="events">Events</Tab>
        </TabList>
        <TabPanel id="personal">
          <div className="mb-4 flex gap-4">
            <FileTrigger
              onSelect={openFile}
              acceptedFileTypes={[".slp"]}
              allowsMultiple
            >
              <Button className="rounded bg-zinc-300 px-3 py-0.5 text-zinc-950 hover:bg-zinc-100 hover:text-black">
                Open Files
              </Button>
            </FileTrigger>
            <FileTrigger acceptDirectory onSelect={openFile}>
              <Button className="rounded bg-zinc-300 px-3 py-0.5 text-zinc-950 hover:bg-zinc-100 hover:text-black">
                Open Folder
              </Button>
            </FileTrigger>
          </div>
        </TabPanel>
        <TabPanel id="uploads">uploads</TabPanel>
        <TabPanel id="events">events</TabPanel>
      </Tabs>
      <ListBox
        items={stubs.slice(currentPage * 10, currentPage * 10 + 10)}
        aria-label="Replays"
        selectionMode="single"
        className="flex flex-col gap-1"
        selectedKeys={
          selectedStub
            ? [
                `${selectedStub.matchId ?? selectedStub.startTimestamp}~${selectedStub.gameNumber}~${selectedStub.tiebreakerNumber}`,
              ]
            : []
        }
        onSelectionChange={async (keys) => {
          if (keys === "all") return;
          const id = [...keys.values()][0];
          const [stub, file] = stubs.find(
            ([stub]) =>
              `${stub.matchId ?? stub.startTimestamp}~${stub.gameNumber}~${stub.tiebreakerNumber}` ===
              id,
          )!;
          const { raw, metadata } = decode(await file.arrayBuffer(), {
            useTypedArrays: true,
          });
          const replay = parseReplay(metadata, raw);
          setSelectedStub(stub);
          setReplay(replay);
          setRenderData(renderReplay(replay));
          setFrame(0);
          setPaused(false);
          setOpenedTimestamp(Date.now());
        }}
      >
        {([stub, file]) => (
          <ListBoxItem
            id={`${stub.matchId ?? stub.startTimestamp}~${stub.gameNumber}~${stub.tiebreakerNumber}`}
            textValue={file.name}
            className={({ isHovered, isSelected }) =>
              cn(
                "group flex items-center gap-6 rounded px-4 py-2 focus:outline-none",
                isHovered && "cursor-pointer bg-zinc-700",
                isSelected && "bg-zinc-300 text-zinc-950",
              )
            }
          >
            <div className="text-sm">{stub.type}</div>
            <img
              src={`/stages/${stub.stageId}.png`}
              className="h-12 rounded  border border-zinc-700 group-aria-selected:border-zinc-400"
            />
            {stub.players.map((p) => (
              <div key={p.playerIndex} className="flex items-center gap-2">
                <img
                  src={`/stockicons/${p.externalCharacterId}/${p.costumeIndex}.png`}
                  className="size-6"
                />
                <div>
                  <div>{p.displayName}</div>
                  <div className="text-sm text-zinc-400 group-aria-selected:text-zinc-600">
                    {p.connectCode}
                  </div>
                </div>
              </div>
            ))}
            <div className="text-sm">
              <div>
                {new Date(stub.startTimestamp!).toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>
              <div>
                {new Date(stub.startTimestamp!).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </ListBoxItem>
        )}
      </ListBox>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
          className="i-tabler-chevron-left-pipe text-xl disabled:text-zinc-400"
        />
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
          className="i-tabler-chevron-left text-xl disabled:text-zinc-400"
        />
        <div>
          Page {currentPage + 1} of {Math.ceil(stubs.length / 10)}
        </div>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(stubs.length / 10) - 1}
          className="i-tabler-chevron-right text-xl disabled:text-zinc-400"
        />
        <button
          onClick={() => setCurrentPage(Math.ceil(stubs.length / 10) - 1)}
          disabled={currentPage === Math.ceil(stubs.length / 10) - 1}
          className="i-tabler-chevron-right-pipe text-xl disabled:text-zinc-400"
        />
      </div>
    </div>
  );
}
