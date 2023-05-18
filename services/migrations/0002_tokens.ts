import { Kysely } from "kysely";
import { Database } from "../models.ts";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("sessions")
    .addColumn("hash", "text", (col) => col.primaryKey().notNull())
    .addColumn(
      "userId",
      "integer",
      (col) => col.notNull().references("users.githubId"),
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("sessions").execute();
}
