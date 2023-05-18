import { openDatabase } from "./db.ts";

Deno.test("open database", async () => {
  const db = await openDatabase(":memory:", { quiet: true });

  await db.insertInto("users")
    .values({
      login: "test",
      githubId: 123,
      avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
      affiliation: "@test",
    })
    .execute();

  await db.destroy();
});
