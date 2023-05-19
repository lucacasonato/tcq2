import { Context } from "../services/context.ts";
import { User } from "../services/models.ts";
import { zfd } from "zod-form-data";
import {
  ServerSentEvent,
  ServerSentEventEncoderStream,
} from "../services/server_sent_events.ts";
import { ChairsEvent, MeetingEvent } from "../services/events.ts";

const createSchema = zfd.formData({ meetingName: zfd.text() });
const addChairSchema = zfd.formData({ username: zfd.text() });

export async function create(
  req: Request,
  user: User,
  ctx: Context,
): Promise<Response> {
  const { meetingName } = createSchema.parse(await req.formData());

  // random 6 char id
  const id = Math.random().toString(36).substring(2, 8);

  await ctx.db.transaction().execute(async (txr) => {
    await txr.insertInto("meetings")
      .values({
        id,
        name: meetingName,
      })
      .execute();

    await txr.insertInto("meetingChairs")
      .values({
        meetingId: id,
        userId: user.githubId,
      })
      .execute();
  });

  return new Response(null, {
    status: 302,
    headers: {
      location: `/meetings/${id}`,
    },
  });
}

export function events(
  _req: Request,
  ctx: Context,
  params: Record<string, string>,
): Response {
  const { id } = params;

  const bc = new BroadcastChannel(`meeting:${id}`);

  const events = new ReadableStream<ServerSentEvent>({
    async start(controller) {
      controller.enqueue({ retry: 1000 });

      // Get the meeting
      const meeting = await ctx.db
        .selectFrom("meetings")
        .selectAll()
        .where("id", "==", id)
        .executeTakeFirstOrThrow();
      const event1 = {
        type: "meeting",
        data: meeting,
      } satisfies MeetingEvent;
      controller.enqueue({ data: JSON.stringify(event1) });

      // List all the chairs (as users)
      const chairs = await ctx.db
        .selectFrom("meetingChairs")
        .rightJoin("users", "meetingChairs.userId", "users.githubId")
        .selectAll("users")
        .where("meetingId", "==", id)
        .execute();
      const event2 = {
        type: "chairs",
        data: chairs,
      } satisfies ChairsEvent;
      controller.enqueue({ data: JSON.stringify(event2) });

      bc.onmessage = (event) => {
        controller.enqueue({
          data: JSON.stringify(event.data),
        });
      };
    },
    cancel() {
      bc.close();
    },
  });

  const body = events
    .pipeThrough(new ServerSentEventEncoderStream())
    .pipeThrough(new TextEncoderStream());

  return new Response(body, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
}

export async function addChair(
  req: Request,
  user: User,
  ctx: Context,
  params: Record<string, string>,
): Promise<Response> {
  const { id } = params;
  const { username } = addChairSchema.parse(await req.formData());

  // check if current user is a chair
  const chair = await ctx.db
    .selectFrom("meetingChairs")
    .selectAll()
    .where("meetingId", "==", id)
    .where("userId", "==", user.githubId)
    .executeTakeFirst();
  if (!chair) {
    return new Response("You are not a chair", {
      status: 403,
    });
  }

  // check if user exists
  const userExists = await ctx.db
    .selectFrom("users")
    .selectAll()
    .where("login", "==", username)
    .executeTakeFirst();
  if (!userExists) {
    return new Response("User does not exist", {
      status: 404,
    });
  }

  // add user as chair
  await ctx.db.insertInto("meetingChairs")
    .values({ meetingId: id, userId: userExists.githubId })
    .execute();

  return new Response(null, {
    status: 302,
    headers: {
      location: `/meetings/${id}`,
    },
  });
}
