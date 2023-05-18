import { OAuth2Client } from "$oauth2_client";
import { DB } from "./models.ts";

export interface Context {
  db: DB;
  oauth2Client: OAuth2Client;
}
