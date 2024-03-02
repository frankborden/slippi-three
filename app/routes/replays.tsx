import { decode } from "@shelacek/ubjson";
import { useState } from "react";
import {
  Button,
  FileTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TagGroup,
  TagList,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import { twMerge as cn } from "tailwind-merge";

import { shortCharactersExt, stages } from "~/common/names";
import { ReplayType } from "~/common/types";
import { parseReplay } from "~/parser";
import { queries } from "~/search/queries";
import { search } from "~/search/search";
import { CharacterFilter, StageFilter, store } from "~/store";
import { Controls } from "~/viewer/Controls";
import { Replay } from "~/viewer/Replay";
import { renderReplay } from "~/viewer/render";

const pageSize = 10;

export default function Page() {
  const {
    openedTimestamp,
    replay,
    highlights: allHighlights,
    setFrame,
  } = store();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    Object.entries(allHighlights)[0][0],
  );

  return (
    <div className="flex grow">
      <div className="flex w-[445px] flex-col items-center gap-3 border-r border-r-zinc-700 bg-zinc-900 px-4 py-2">
        <Sources />
        <Filters />
        <Replays />
      </div>
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
      <div className="w-[190px] border-l border-l-zinc-700 px-4 py-2">
        <Select
          aria-label="Highlights category"
          selectedKey={selectedCategory}
          onSelectionChange={(key) => setSelectedCategory(key as string)}
          className="rounded border border-zinc-700 bg-black px-2 py-0.5 text-sm"
        >
          <Button className="flex w-full items-center justify-between gap-1">
            <SelectValue />
            <div aria-hidden="true" className="i-tabler-chevron-down text-xl" />
          </Button>
          <Popover
            offset={0}
            className="w-[--trigger-width] rounded border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-sm"
          >
            <ListBox items={Object.entries(allHighlights)}>
              {([name]) => <ListBoxItem id={name}>{name}</ListBoxItem>}
            </ListBox>
          </Popover>
        </Select>
        <ListBox
          items={allHighlights[selectedCategory]}
          aria-label="Highlights"
          selectionMode="single"
          selectedKeys={[]}
          onSelectionChange={(keys) => {
            if (keys === "all" || keys.size === 0) return;
            const key = [...keys.values()][0] as string;
            setFrame(Math.max(0, Number(key.split("-")[1]) - 30));
          }}
          className="mt-2"
        >
          {(highlight) => (
            <ListBoxItem
              id={`${highlight.playerIndex}-${highlight.startFrame}-${highlight.endFrame}`}
              textValue={`Player ${highlight.playerIndex + 1}: ${highlight.startFrame}-${highlight.endFrame}`}
              className="rounded px-2 py-0.5 text-sm hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-100 focus:outline-none"
            >
              Player {highlight.playerIndex + 1}: {highlight.startFrame}-
              {highlight.endFrame}
            </ListBoxItem>
          )}
        </ListBox>
      </div>
    </div>
  );
}

function Sources() {
  const { addFiles, setCurrentSource, setCurrentPage, currentSource } = store();

  return (
    <Tabs
      onSelectionChange={(key) => {
        setCurrentSource(key as any);
        setCurrentPage(0);
      }}
      selectedKey={currentSource}
    >
      <TabList className="mb-3 flex w-max gap-3 rounded-lg border border-zinc-600 bg-zinc-950 p-1 text-sm *:rounded *:px-2 *:outline-none *:transition-colors *:duration-200 [&>[data-hovered]]:cursor-pointer [&>[data-hovered]]:bg-zinc-700 [&>[data-hovered]]:text-zinc-100 [&>[data-selected]]:bg-zinc-300 [&>[data-selected]]:text-zinc-950">
        <Tab id="personal">Personal</Tab>
        <Tab id="uploads">Uploads</Tab>
        <Tab id="events">Events</Tab>
      </TabList>
      <TabPanel id="personal">
        <div className="flex gap-4 text-sm">
          <FileTrigger
            onSelect={(files: FileList | null) => {
              if (!files) return;
              addFiles(Array.from(files));
            }}
            acceptedFileTypes={[".slp"]}
            allowsMultiple
          >
            <Button className="rounded bg-zinc-300 px-2 text-zinc-950 hover:bg-zinc-100 hover:text-black">
              Open Files
            </Button>
          </FileTrigger>
          <FileTrigger
            acceptDirectory
            onSelect={(files: FileList | null) => {
              if (!files) return;
              addFiles(Array.from(files));
            }}
          >
            <Button className="rounded bg-zinc-300 px-3 py-0.5 text-zinc-950 hover:bg-zinc-100 hover:text-black">
              Open Folder
            </Button>
          </FileTrigger>
        </div>
      </TabPanel>
      <TabPanel id="uploads">uploads</TabPanel>
      <TabPanel id="events">events</TabPanel>
    </Tabs>
  );
}

function Filters() {
  const { filters, setFilters, setCurrentPage } = store();

  return (
    <TagGroup
      aria-label="Filters"
      className="flex items-center gap-2"
      onRemove={(key) => {
        setFilters(filters.filter((_, i) => !key.has(String(i))));
        setCurrentPage(0);
      }}
    >
      <TagList
        items={filters.map((f, i) => [f, i] as const)}
        className="flex flex-wrap items-center gap-2"
      >
        {([filter, i]) => (
          <Tag
            id={String(i)}
            textValue={String(
              filter.type === "character"
                ? shortCharactersExt[filter.externalCharacterId]
                : filter.type === "stage"
                  ? stages[filter.stageId]
                  : "crst",
            )}
            className="flex items-center gap-1 rounded border px-1 text-sm transition-colors duration-200 has-[button:hover]:bg-zinc-700 focus:outline-none"
          >
            <div>
              {filter.type === "character"
                ? shortCharactersExt[filter.externalCharacterId]
                : filter.type === "stage"
                  ? stages[filter.stageId]
                  : "crst"}
            </div>
            <Button slot="remove" className="i-tabler-x" />
          </Tag>
        )}
      </TagList>
    </TagGroup>
  );
}

function Replays() {
  const {
    setRenderData,
    setReplay,
    setFrame,
    setPaused,
    setOpenedTimestamp,
    localStubs,
    currentPage,
    setSelectedStub,
    selectedStub,
    filters,
    setCurrentPage,
    setHighlights,
  } = store();

  const stubs = localStubs;
  const filteredStubs = stubs.filter(([stub]) => {
    const allowedStages = filters
      .filter((f): f is StageFilter => f.type === "stage")
      .map((f) => f.stageId);
    if (allowedStages.length > 0 && !allowedStages.includes(stub.stageId)) {
      return false;
    }

    const requiredCharacters = filters
      .filter((f): f is CharacterFilter => f.type === "character")
      .map((f) => f.externalCharacterId);
    if (
      requiredCharacters.length > 0 &&
      requiredCharacters.some(
        (c) => !stub.players.some((p) => p.externalCharacterId === c),
      )
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <ListBox
        items={filteredStubs.slice(
          currentPage * pageSize,
          currentPage * pageSize + pageSize,
        )}
        aria-label="Replays"
        selectionMode="single"
        className="-ml-2 grid w-full grid-cols-[repeat(5,auto)] gap-x-2 gap-y-1"
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
          const [stub, file] = filteredStubs.find(
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
          setHighlights(
            Object.fromEntries(
              Object.entries(queries).map(([name, query]) => [
                name,
                search(replay, ...query),
              ]),
            ),
          );
        }}
      >
        {([stub, file]) => (
          <ListBoxItem
            id={`${stub.matchId ?? stub.startTimestamp}~${stub.gameNumber}~${stub.tiebreakerNumber}`}
            textValue={file.name}
            className={({ isHovered, isSelected }) =>
              cn(
                "group col-span-full grid grid-cols-subgrid items-center rounded px-3 py-2 focus:outline-none",
                isHovered && "cursor-pointer bg-zinc-700",
                isSelected && "bg-zinc-300 text-zinc-950",
              )
            }
          >
            <TooltipTrigger delay={300} closeDelay={50}>
              <Button className={cn(replayTypeIcons[stub.type], "text-2xl")} />
              <Tooltip className="rounded border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-sm capitalize">
                {stub.type}
              </Tooltip>
            </TooltipTrigger>
            <div>
              <div>
                {new Date(stub.startTimestamp!).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="text-sm text-zinc-400 group-aria-selected:text-zinc-600">
                {new Date(stub.startTimestamp!).toLocaleTimeString(undefined, {
                  minute: "2-digit",
                  hour: "numeric",
                })}
              </div>
            </div>
            <img
              src={`/stages/${stub.stageId}.png`}
              className="h-12 rounded border border-zinc-700 group-aria-selected:border-zinc-400"
            />
            {stub.players.map((p) => (
              <div key={p.playerIndex} className="flex items-center gap-2">
                <img
                  src={`/stockicons/${p.externalCharacterId}/${p.costumeIndex}.png`}
                  className="size-6"
                />
                <div>
                  <div className="max-w-[8ch] overflow-x-hidden text-ellipsis whitespace-nowrap">
                    {p.displayName ?? shortCharactersExt[p.externalCharacterId]}
                  </div>
                  <div className="text-sm text-zinc-400 group-aria-selected:text-zinc-600">
                    {p.connectCode ?? `Port ${p.playerIndex + 1}`}
                  </div>
                </div>
              </div>
            ))}
          </ListBoxItem>
        )}
      </ListBox>
      {filteredStubs.length > 0 && (
        <div className="mt-auto grid w-full grid-cols-[auto_auto_1fr_auto_auto] items-center gap-4">
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
          <div className="text-center">
            Page {currentPage + 1} of{" "}
            {Math.ceil(filteredStubs.length / pageSize)}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(filteredStubs.length / pageSize) - 1
            }
            className="i-tabler-chevron-right text-xl disabled:text-zinc-400"
          />
          <button
            onClick={() =>
              setCurrentPage(Math.ceil(filteredStubs.length / pageSize) - 1)
            }
            disabled={
              currentPage === Math.ceil(filteredStubs.length / pageSize) - 1
            }
            className="i-tabler-chevron-right-pipe text-xl disabled:text-zinc-400"
          />
        </div>
      )}
    </>
  );
}

const replayTypeIcons: Record<ReplayType, string> = {
  direct: "i-tabler-plug-connected",
  offline: "i-tabler-sofa",
  "old online": "i-tabler-world",
  ranked: "i-tabler-trophy",
  unranked: "i-tabler-balloon",
};
