import { store } from "~/viewer/store";

export function HUD() {
  const { replay, frame } = store();
  return (
    <div className="absolute bottom-1 left-0 w-full text-white">
      <div className="flex justify-around">
        {replay?.settings.playerSettings.map((settings, i) => (
          <div
            key={i}
            className="flex flex-col items-center"
            style={{
              WebkitTextStroke: "0.1px black",
            }}
          >
            <div className="flex">
              {[
                ...Array(
                  replay.frames[frame].players[i].state.stocksRemaining,
                ).keys(),
              ].map((i) => (
                <img
                  key={i}
                  src={`/stockicons/${settings.externalCharacterId}/0.png`}
                  className="size-4"
                />
              ))}
            </div>
            <div>
              {Math.round(replay.frames[frame].players[i].state.percent)}%
            </div>
            <div>{settings.connectCode}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
