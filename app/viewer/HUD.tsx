import { store } from "~/viewer/store";

export function HUD() {
  const { replay, frame } = store();
  return (
    <>
      <div className="absolute left-0 top-1 flex w-full justify-center text-white">
        {timer(frame)}
      </div>
      <div className="absolute bottom-1 left-0 flex w-full justify-around text-white">
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
            <div className="text-lg font-bold">
              {Math.round(replay.frames[frame].players[i].state.percent)}%
            </div>
            <div className="text-sm">{settings.connectCode}</div>
          </div>
        ))}
      </div>
    </>
  );
}

const meleeHundredths = [
  "00",
  "02",
  "04",
  "06",
  "07",
  "09",
  "11",
  "12",
  "14",
  "16",
  "17",
  "19",
  "21",
  "22",
  "24",
  "26",
  "27",
  "29",
  "31",
  "32",
  "34",
  "36",
  "37",
  "39",
  "41",
  "42",
  "44",
  "46",
  "47",
  "49",
  "51",
  "53",
  "54",
  "56",
  "58",
  "59",
  "61",
  "63",
  "64",
  "66",
  "68",
  "69",
  "71",
  "73",
  "74",
  "76",
  "78",
  "79",
  "81",
  "83",
  "84",
  "86",
  "88",
  "89",
  "91",
  "93",
  "94",
  "96",
  "98",
  "99",
];

function timer(frame: number) {
  const frames = Math.min(60 * 60 * 8, 60 * 60 * 8 - frame + 123);
  const minutes = Math.floor(frames / (60 * 60))
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((frames % (60 * 60)) / 60)
    .toString()
    .padStart(2, "0");
  const hundredths = meleeHundredths[frames % 60];
  return `${minutes}:${seconds}:${hundredths}`;
}
