import { Kysely } from "kysely";
import { Database } from "../models.ts";

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("users")
    .addColumn("affiliation", "text")
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("users").dropColumn("affiliation").execute();
}
