// import { decode } from "@shelacek/ubjson";
// import { Button, FileTrigger } from "react-aria-components";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";

// import { parseReplay } from "~/parser";
// import { Controls } from "~/viewer/Controls";
// import { Replay } from "~/viewer/Replay";
// import { renderReplay } from "~/viewer/render";
// import { store } from "~/viewer/store";

// export default function Index() {
//   const {
//     setRenderData,
//     setReplay,
//     setFrame,
//     setPaused,
//     openedTimestamp,
//     setOpenedTimestamp,
//     replay,
//   } = store();

//   async function openFile(files: FileList | null) {
//     if (!files) return;
//     const { raw, metadata } = decode(await files[0].arrayBuffer(), {
//       useTypedArrays: true,
//     });
//     const replay = parseReplay(metadata, raw);
//     setReplay(replay);
//     setRenderData(renderReplay(replay));
//     setFrame(0);
//     setPaused(false);
//     setOpenedTimestamp(Date.now());
//   }

//   return (
//     <main className="flex h-screen flex-col gap-4 overflow-y-auto p-8">
//       <FileTrigger onSelect={openFile}>
//         <Button className="w-max rounded bg-emerald-700 px-3 py-0.5 text-emerald-50 hover:bg-emerald-600 hover:text-white">
//           Open Replay
//         </Button>
//       </FileTrigger>
//       {replay && (
//         <>
//           <div className="relative flex shrink flex-col overflow-y-auto rounded border border-neutral-700 bg-neutral-950">
//             <Replay key={openedTimestamp} />
//           </div>
//           <Controls />
//         </>
//       )}
//     </main>
//   );
// }

export default function Page() {
  return <ReplayList />;
}

function ReplayList() {
  return (
    <Tabs>
      <TabList className="flex gap-2 p-4 *:rounded *:px-2 *:outline-none *:transition-colors *:duration-200 [&>[data-selected]]:bg-neutral-200 [&>[data-selected]]:text-neutral-950">
        <Tab id="uploads">Uploads</Tab>
        <Tab id="events">Events</Tab>
        <Tab id="personal">Personal</Tab>
      </TabList>
      <TabPanel id="uploads">uploads</TabPanel>
      <TabPanel id="events">events</TabPanel>
      <TabPanel id="personal">personal</TabPanel>
    </Tabs>
  );
}
