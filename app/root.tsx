import {
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "@remix-run/react";
import { RouterProvider } from "react-aria-components";
import { twMerge as cn } from "tailwind-merge";

import "~/root.css";

if (globalThis.navigator && "serviceWorker" in globalThis.navigator) {
  globalThis.navigator.serviceWorker.register("/serviceworker.js");
}

export default function App() {
  let navigate = useNavigate();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-zinc-900 text-zinc-200">
        <RouterProvider navigate={navigate}>
          <div className="flex h-screen">
            <nav className="flex flex-col items-center gap-8 border-r border-r-zinc-800 bg-zinc-950 p-6">
              <Link
                className="mb-4 flex flex-col items-center gap-1 text-emerald-400 transition-colors duration-200 ease-in-out hover:text-emerald-300"
                to="/"
              >
                <div className="i-mynaui-play-hexagon text-5xl" />
              </Link>
              <PageLink
                icon="i-tabler-device-tv-old"
                to="/replays"
                name="Replays"
              />
              <PageLink
                icon="i-tabler-notebook"
                to="/framedata"
                name="Frame Data"
              />
              <PageLink
                icon="i-tabler-angle"
                to="/calculator"
                name="Calculator"
              />
              <PageLink
                className="mt-auto"
                icon="i-tabler-user-circle"
                to="account"
                name="Account"
              />
              <PageLink
                icon="i-tabler-settings"
                to="/settings"
                name="Settings"
              />
            </nav>
            <Outlet />
          </div>
        </RouterProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function PageLink({
  to,
  icon,
  name,
  className,
}: {
  to: string;
  icon: string;
  name: string;
  className?: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          className,
          "flex flex-col items-center gap-1 transition-colors duration-200 ease-in-out",
          !isActive && "text-zinc-400 hover:text-zinc-300",
        )
      }
    >
      <div className={cn(icon, "text-4xl")} />
      <div className="text-sm">{name}</div>
    </NavLink>
  );
}
