import { Kysely } from "kysely";
import { Database } from "../models.ts";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("meetings")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("name", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("meetingChairs")
    .addColumn(
      "meetingId",
      "text",
      (col) => col.notNull().references("meetings.id"),
    )
    .addColumn(
      "userId",
      "integer",
      (col) => col.notNull().references("users.githubId"),
    )
    .addPrimaryKeyConstraint("primary_key", ["meetingId", "userId"])
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("meetingChairs").execute();
  await db.schema.dropTable("meetings").execute();
}
