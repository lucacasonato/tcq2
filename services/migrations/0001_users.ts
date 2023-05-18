import { Kysely } from "kysely";
import { Database } from "../models.ts";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("users")
    .addColumn("githubId", "integer", (col) => col.primaryKey().notNull())
    .addColumn("login", "text", (col) => col.notNull())
    .addColumn("avatarUrl", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("users").execute();
}
