import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";
import {
  Button,
  ListBox,
  ListBoxItem,
  Tooltip,
  TooltipTrigger,
} from "react-aria-components";
import { twMerge as cn } from "tailwind-merge";

import { shortCharactersExt } from "~/common/names";
import { ReplayStub, ReplayType } from "~/common/types";
import * as schema from "~/schema";
import { CharacterFilter, StageFilter, store } from "~/store";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB, { schema });

  const results = await db.query.replays.findMany({
    with: { replayPlayers: true },
  });
  const stubs: (ReplayStub & { slug: string })[] = results.map((replay) => ({
    type: replay.type as ReplayType,
    slug: replay.slug,
    stageId: replay.stageId,
    startTimestamp: replay.startTimestamp,
    matchId: replay.matchId ?? undefined,
    gameNumber: replay.gameNumber ?? undefined,
    tiebreakerNumber: replay.tiebreakerNumber ?? undefined,
    players: replay.replayPlayers.map((player) => ({
      replayId: replay.id,
      playerIndex: player.playerIndex,
      connectCode: player.connectCode ?? undefined,
      displayName: player.displayName ?? undefined,
      nametag: player.nametag ?? undefined,
      teamId: player.teamId ?? undefined,
      externalCharacterId: player.externalCharacterId,
      costumeIndex: player.costumeIndex,
    })),
  }));

  return json({
    stubs,
  });
}

const pageSize = 10;

export default function Page() {
  const { stubs: cloudStubs } = useLoaderData<typeof loader>();

  const {
    localStubs,
    currentPage,
    selectedStub,
    filters,
    currentSource,
    setCurrentPage,
  } = store();

  const stubs =
    currentSource === "personal"
      ? localStubs
      : cloudStubs.map((s) => [s, new File([], s.slug)] as const);
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
      >
        {([stub, file]) => (
          <ListBoxItem
            id={`${stub.matchId ?? stub.startTimestamp}~${stub.gameNumber}~${stub.tiebreakerNumber}`}
            textValue={file.name}
            href={`/replays?slug=local-${file.name}`}
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
