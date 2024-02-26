import {
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { twMerge as cn } from "tailwind-merge";

import "~/root.css";

if (globalThis.navigator && "serviceWorker" in globalThis.navigator) {
  globalThis.navigator.serviceWorker.register("/serviceworker.js");
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-neutral-950 text-neutral-200">
        <div className="flex h-screen gap-4">
          <nav className="flex flex-col items-center gap-8 rounded-lg bg-neutral-900 p-6">
            <Link
              className="mb-4 grid size-10 place-items-center rounded bg-neutral-200 font-bold leading-none text-neutral-950"
              to="/"
            >
              SL
            </Link>
            <PageLink icon="i-tabler-device-tv" to="/replay" />
            <PageLink icon="i-tabler-notebook" to="/framedata" />
            <PageLink icon="i-tabler-user-circle" to="account" />
            <PageLink icon="i-tabler-settings" to="/settings" />
            <a
              href="https://github.com/frankborden/slippilab"
              target="_blank"
              className="i-tabler-brand-github text-4xl text-neutral-400 hover:text-neutral-300"
            />
            <a
              href="https://twitter.com/slippilab"
              target="_blank"
              className="i-tabler-brand-twitter text-4xl text-neutral-400 hover:text-neutral-300"
            />
          </nav>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function PageLink({ to, icon }: { to: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          icon,
          "text-4xl transition-colors duration-200 ease-in-out",
          !isActive && "text-neutral-400 hover:text-neutral-300",
        )
      }
    />
  );
}
