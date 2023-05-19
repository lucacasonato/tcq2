import { Meeting, User } from "./models.ts";

export type Event = MeetingEvent | ChairsEvent;

export interface MeetingEvent {
  type: "meeting";
  data: Meeting;
}

export interface ChairsEvent {
  type: "chairs";
  data: User[];
}
