import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { decode } from "@shelacek/ubjson";
import { InferInsertModel } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { generateSlug } from "random-word-slugs";
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
import * as schema from "~/schema";
import { queries } from "~/search/queries";
import { search } from "~/search/search";
import { CharacterFilter, StageFilter, store } from "~/store";
import { Controls } from "~/viewer/Controls";
import { Replay } from "~/viewer/Replay";
import { renderReplay } from "~/viewer/render";

const pageSize = 10;

export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  const replays = await db.select().from(schema.replays);
  return json({
    replays,
  });
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { DB, BUCKET } = context.cloudflare.env;
  const db = drizzle(DB);
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 20_000_000,
  });
  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const file = form.get("replay");
  if (!(file instanceof File)) {
    return new Response("No file found", { status: 400 });
  }
  const buffer = new Uint8Array(await file.arrayBuffer());
  const { raw, metadata } = decode(buffer, { useTypedArrays: true });
  const replay = parseReplay(metadata, raw);

  const id = crypto.randomUUID();
  const slug = generateSlug(3, { format: "camel" });
  const dbReplay: InferInsertModel<typeof schema.replays> = {
    id,
    slug,
    type: replay.type,
    stageId: replay.settings.stageId,
    startTimestamp: replay.settings.startTimestamp,
    matchId: replay.settings.matchId,
    gameNumber: replay.settings.gameNumber,
    tiebreakerNumber: replay.settings.tiebreakerNumber,
  };
  const dbPlayers: InferInsertModel<typeof schema.replayPlayers>[] =
    replay.settings.playerSettings.filter(Boolean).map((player) => ({
      replayId: id,
      playerIndex: player.playerIndex,
      connectCode: player.connectCode,
      displayName: player.displayName,
      nametag: player.nametag,
      teamId: player.teamId,
      externalCharacterId: player.externalCharacterId,
      costumeIndex: player.costumeIndex,
    }));

  await BUCKET.put(id, buffer);
  await db.batch([
    db.insert(schema.replays).values(dbReplay),
    ...dbPlayers.map((dbPlayer) =>
      db.insert(schema.replayPlayers).values(dbPlayer),
    ),
  ]);

  return json({ slug });
}

export default function Page() {
  const { openedTimestamp, replay } = store();
  const fetcher = useFetcher({ key: "uploadReplay" });
  const { selectedStub, localStubs } = store();

  function upload() {
    const form = new FormData();
    const file = localStubs.find(([stub]) => stub === selectedStub)?.[1];
    if (file) {
      form.append("replay", file);
      fetcher.submit(form, { method: "POST", encType: "multipart/form-data" });
    }
  }

  return (
    <div className="flex grow">
      <div className="flex w-[445px] flex-col items-center gap-3 border-r border-r-zinc-700 bg-zinc-900 px-4 py-2">
        <Sources />
        <Filters />
        <Replays />
      </div>
      <div className="flex grow flex-col bg-zinc-800 p-4">
        {replay && (
          <>
            <button onClick={() => upload()}>Upload</button>
            <div className="relative flex flex-col overflow-y-auto rounded border border-zinc-700 bg-zinc-950">
              <Replay key={openedTimestamp} />
            </div>
            <Controls />
            <div className="mx-auto grid w-full grid-cols-4 gap-4">
              <Controller playerIndex={0} />
              <Controller playerIndex={1} />
              <Controller playerIndex={2} />
              <Controller playerIndex={3} />
            </div>
          </>
        )}
      </div>
      <div className="w-[190px] border-l border-l-zinc-700 px-4 py-2">
        <Highlights />
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
    setSpeed,
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
          setSpeed(1);
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

function Highlights() {
  const { highlights: allHighlights, setFrame } = store();
  const [selectedCategory, setSelectedCategory] = useState<string>(
    Object.entries(allHighlights)[0][0],
  );

  return (
    <>
      <Select
        aria-label="Highlights category"
        selectedKey={selectedCategory}
        onSelectionChange={(key) => setSelectedCategory(key as string)}
        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-sm"
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
    </>
  );
}

// https://www.svgrepo.com/svg/90779/nintendo-gamecube-control
function Controller({ playerIndex }: { playerIndex: number }) {
  const { renderData, frame } = store();
  const player = renderData?.[frame].find(
    (rd) => rd.playerSettings.playerIndex === playerIndex,
  );

  if (!player) return <div />;

  const inputs = player.playerInputs;

  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 585.781 585.782"
        className="p-4"
      >
        <path
          id="shell"
          fill={["red", "blue", "yellow", "green"][playerIndex]}
          d="M376.4 33.6c-6 0-11.9 3.9-11.1 11.8 1 11.8-2.6 21.8-12.6 28.8-10 7.2-24.4 4.3-35.2 10.2a53.6 53.6 0 0 0-28.1 40.6c-116.9 1.6-160.5 25.4-160.5 25.4-68.1-13.9-77.4 34-77.4 34-67.5 45-47.9 128.2-47.9 128.2-7 84.3-9.5 239.6 46.8 239.6s56-145.5 56-145.5 9.8 16.2 17.3 37.6c7.5 21.3 63.5 79.7 124.1 15.6 60.7-64.1-23-128.2-23-128.2v-10.2c20.2-5.6 68-6.6 68-6.6s48 1 68.2 6.6v10.2s-83.7 64-23 128.2c60.6 64 116.6 5.7 124-15.6 7.6-21.4 17.4-37.6 17.4-37.6s-.3 145.5 56 145.5 53.7-155.3 46.8-239.6c0 0 19.6-83.1-48-128.2 0 0-9.2-47.9-77.3-34 0 0-39.3-21.4-143-25 5-25.9 37.2-20 54.9-32.7a52.6 52.6 0 0 0 21-47.3c-.8-7.8-7.2-11.8-13.4-11.8z"
        />
        <path
          id="dPadCutout"
          fill="transparent"
          d="M178.6 361.5h20.8c4.8 0 8.8 4 8.8 8.9V392H230c4.8 0 8.8 4 8.8 8.9v20.8c0 4.8-4 8.8-8.8 8.8h-21.8v21.8c0 4.8-4 8.8-8.8 8.8h-20.8c-4.9 0-8.9-4-8.9-8.8v-21.8H148c-4.9 0-8.9-4-8.9-8.8V401a9 9 0 0 1 8.9-8.9h21.7v-21.7a9 9 0 0 1 8.9-8.9z"
        />
        <path
          id="dPad"
          fill="gray"
          stroke="black"
          strokeWidth={2.5}
          d="M202 370.4c0-1.5-1.2-2.7-2.6-2.7h-20.8a2.7 2.7 0 0 0-2.7 2.7v27.9h-28a2.7 2.7 0 0 0-2.6 2.7v20.8c0 1.5 1.2 2.7 2.7 2.7h27.9v27.9c0 1.5 1.2 2.7 2.7 2.7h20.8c1.5 0 2.7-1.2 2.7-2.7v-28H230c1.5 0 2.7-1.1 2.7-2.6V401c0-1.5-1.2-2.7-2.7-2.7h-28z"
        />
        <path
          id="startCutout"
          fill="transparent"
          d="M292.9 252a19.8 19.8 0 1 1 0 39.7 19.8 19.8 0 0 1 0-39.6zm-188.2-52.7a75.3 75.3 0 1 1-.2 150.6 75.3 75.3 0 0 1 .2-150.6z"
        />
        {/* here */}
        <path
          id="controlStickCutout"
          fill="transparent"
          d="m 104.65234,199.2793 c 41.488,0 75.23438,33.75128 75.23438,75.23828 0,41.487 -33.74638,75.24023 -75.23438,75.24023 -41.486996,0 -75.238278,-33.75323 -75.238278,-75.24023 0,-41.487 33.751282,-75.23828 75.238278,-75.23828 z"
        />
        <circle
          id="controlStickGate"
          fill="lightgray"
          stroke="black"
          strokeWidth={2.5}
          cx={104.7}
          cy={274.5}
          r={69.1}
        />
        <circle
          id="controlStick"
          fill="gray"
          stroke="black"
          strokeWidth={2.5}
          cx={104.7 + (inputs.processed.joystickX ?? 0) * 34}
          cy={274.5 - (inputs.processed.joystickY ?? 0) * 34}
          r={35.1}
        />
        <path
          id="cStickCutout"
          fill="transparent"
          d="M402 361.3c.4 0 .8.1 1.1.3l31.2 18a3 3 0 0 1 1.4 1.8l10.3 34.1a3 3 0 0 1-.3 2.4L427 451.2a3 3 0 0 1-1.9 1.5l-36.2 9.2a3 3 0 0 1-2.3-.3l-32.2-18.9a3 3 0 0 1-1.4-2l-8.7-37.1a3 3 0 0 1 .4-2.4l19.3-30a3 3 0 0 1 1.8-1.3l35-8.6h1.2z"
        />
        <circle
          id="cStickGate"
          fill="gold"
          stroke="black"
          strokeWidth={2.5}
          cx={395.2}
          cy={411.6}
          r={44.1}
        />
        <circle
          id="cStick"
          fill="yellow"
          stroke="black"
          strokeWidth={2.5}
          cx={395.2 + (inputs.processed.cStickX ?? 0) * 19.5}
          cy={411.6 - (inputs.processed.cStickY ?? 0) * 19.5}
          r={24.6}
        />
        <circle
          id="startButton"
          fill={inputs.processed.start ? "white" : "gray"}
          stroke="black"
          strokeWidth={2.5}
          cx="292.9"
          cy="271.9"
          r="13.7"
        />
        <path
          id="faceButtonsCutout"
          fill="transparent"
          d="M478.2 187.8a21.5 21.5 0 0 1 21.6 24.8 69 69 0 0 1 26.6 16 21.4 21.4 0 0 1 13.8-5c9.8 0 18.4 6.6 21 16l.2 1c5.7 18.8 5.7 18.8 9.7 36l.2.9a21.9 21.9 0 0 1-21 27.2 21 21 0 0 1-7.8-1.6 69 69 0 0 1-109.8 26.2 29 29 0 1 1-23.7-45.7h.8l-.2-5.6c0-16.5 5.8-31.6 15.5-43.5a21.6 21.6 0 0 1 10-35.9l1-.3c18.8-5.7 18.8-5.7 36-9.7l.8-.2c1.7-.4 3.5-.6 5.3-.6z"
        />
        <circle
          id="aButton"
          // Use physical A because processed A is bugged. processed A is true
          // whenever physical Z is pressed
          fill={inputs.physical.a ? "white" : "green"}
          stroke="black"
          strokeWidth={2.5}
          cx={479.4}
          cy={279.7}
          r={33.9}
        />
        <path
          id="bButton"
          fill={inputs.processed.b ? "white" : "red"}
          stroke="black"
          strokeWidth={2.5}
          d="M417.1 291.3c-2-.8-4.2-1.2-6.5-1.4l-1.6-.2a23 23 0 0 0 0 45.9 22.9 22.9 0 0 0 8.1-44.3z"
        />
        <path
          id="yButton"
          fill={inputs.processed.y ? "white" : "gray"}
          stroke="black"
          strokeWidth={2.5}
          d="M429.3 229.8a16 16 0 0 0 15.4 4.7c.5-.1 2.3-1 3.7-1.8 3.7-2.1 8.9-5 14.4-6.5 6.7-1.8 15.9-2 19.5-2h.6c3.8-1.1 7-3.6 9-7.1l.2-.3a15.4 15.4 0 0 0-13.9-22.9 17 17 0 0 0-3.9.5l-.8.1c-17 4-17 4-35.6 9.6l-1.2.4a15.6 15.6 0 0 0-11 19 15 15 0 0 0 3.6 6.3zM565.1 278c-4-17-4-17-9.6-35.7l-.3-1a15.8 15.8 0 0 0-19-11 15.5 15.5 0 0 0-9.6 7.5 15.5 15.5 0 0 0-1.4 11.5c.1.5 1.1 2.2 1.9 3.6 2 3.8 4.9 9 6.4 14.4 2 7.4 2 17.8 2 20.1a16 16 0 0 0 19 10.6c8-2.2 12.9-10.6 10.9-19.1zM130 150l-75 35v-10c0-55 55-55 75-35v10zm330 0 75 35v-10c0-55-55-55-75-35v10z"
        />
        <path
          id="xButton"
          fill={inputs.processed.x ? "white" : "gray"}
          stroke="black"
          strokeWidth={2.5}
          d="M565.1,278 c -4,-16.9 -4,-16.9 -9.6,-35.6 l -0.3,-1 c -2.2,-8.2 -10.9,-13.3 -19.1,-11.1 -2.1,0.6 -4,1.6 -5.6,2.8 -1.6,1.3 -3,2.9 -4,4.7 -1.9,3.4 -2.5,7.5 -1.4,11.5 0.1,0.5 1.1,2.2 1.9,3.6 2.1,3.8 4.9,8.9 6.4,14.4 2,7.4 2,17.8 2.0,20.1 0.7,2.4 2,4.4 3.7,6.1 1.5,1.6 3.3,2.8 5.4,3.7 3.1,1.3 6.5,1.7 9.9,0.8 8.1,-2.2 12.9,-10.6 10.9,-19.1 z"
        />
        <path
          id="lTrigger"
          fill={inputs.processed.lTriggerDigital ? "white" : "gray"}
          stroke="black"
          strokeWidth={2.5}
          d="m 130,150 l -75,35 l 0,-10 c 0,-55 55,-55 75,-35 l 0,10 z"
        />
        <path
          id="rTrigger"
          fill={inputs.processed.rTriggerDigital ? "white" : "gray"}
          stroke="black"
          strokeWidth={2.5}
          d="m 460,150 l 75,35 l 0,-10 c 0,-55 -55,-55 -75,-35 l 0,10 z"
        />
        <path
          id="zButton"
          fill={inputs.processed.z ? "white" : "purple"}
          stroke="black"
          strokeWidth={2.5}
          d="M460 155v-15l75 35v15z"
        />
      </svg>
      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        <div>{player.animationFrame}</div>
        <div>{player.animationName}</div>
        <div>
          {player.playerState.isInHitstun
            ? player.playerState.hitstunRemaining
            : 0}
        </div>
        <div>Hitstun</div>
        <div>{player.playerState.hitlagRemaining}</div>
        <div>Hitlag</div>
      </div>
    </div>
  );
}
