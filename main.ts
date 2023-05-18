import "$std/dotenv/load.ts";

import handler from "./handlers/mod.ts";
import { Context } from "./services/context.ts";
import { openDatabase } from "./services/db.ts";

import { OAuth2Client } from "$oauth2_client";

const DATABASE_PATH = Deno.env.get("DATABASE_PATH") ?? "db.sqlite";
const db = await openDatabase(DATABASE_PATH);

const baseURL = Deno.env.get("BASE_URL") ?? "http://localhost:8000";

const clientId = Deno.env.get("GITHUB_CLIENT_ID");
if (!clientId) throw new Error("Missing GITHUB_CLIENT_ID");
const clientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");
if (!clientSecret) throw new Error("Missing GITHUB_CLIENT_SECRET");

const oauth2Client = new OAuth2Client({
  authorizationEndpointUri: "https://github.com/login/oauth/authorize",
  tokenUri: "https://github.com/login/oauth/access_token",
  redirectUri: `${baseURL}/login/callback`,
  clientId,
  clientSecret,
});

const SHARED_CTX: Context = {
  db,
  oauth2Client,
};

Deno.serve((req, ctx) => {
  // deno-lint-ignore no-explicit-any
  const ctx2: any = Object.assign(ctx, SHARED_CTX);
  return handler(req, ctx2);
});
