/// <reference types="@remix-run/cloudflare" />
/// <reference types="vite/client" />
import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: {
      env: {
        DB: D1Database;
        BUCKET: R2Bucket;
      };
    };
  }
}
