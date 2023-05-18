import { Kysely } from "kysely";

export type DB = Kysely<Database>;

export interface Database {
  users: User;
  sessions: Session;
}

export interface User {
  githubId: number;
  login: string;
  avatarUrl: string;
  affiliation: string | null;
}

export interface Session {
  hash: string;
  userId: number;
}
