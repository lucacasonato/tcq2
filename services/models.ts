import { Kysely } from "kysely";

export type DB = Kysely<Database>;

export interface Database {
  users: User;
  sessions: Session;
  meetings: Meeting;
  meetingChairs: MeetingChair;
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

export interface Meeting {
  id: string;
  name: string;
}

export interface MeetingChair {
  meetingId: string;
  userId: number;
}
