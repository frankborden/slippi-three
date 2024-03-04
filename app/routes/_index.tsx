import { type LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { drizzle } from "drizzle-orm/d1";

import { replays as replaysSchema } from "~/schema";

export async function loader({ context }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);
  const replays = await db.select().from(replaysSchema);

  return json({
    replays,
  });
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="grid grow place-items-center">
      <div>
        <div>Replays:</div>
        {data.replays.length > 0 ? (
          <ul>
            {data.replays.map((replay) => (
              <li key={replay.id}>{replay.slug}</li>
            ))}
          </ul>
        ) : (
          <div>None</div>
        )}
      </div>
    </main>
  );
}
