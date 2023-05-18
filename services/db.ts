import {
  Kysely,
  Migration,
  MigrationProvider,
  Migrator,
  SqliteDatabase,
  SqliteDialect,
  SqliteStatement,
} from "kysely";
import {
  Database as Sqlite3Database,
  Statement,
} from "https://deno.land/x/sqlite3@0.9.1/mod.ts";
import { Database, DB } from "./models.ts";

class KyselySqlite3Database implements SqliteDatabase {
  #sqlite: Sqlite3Database;

  constructor(dbPath: string) {
    this.#sqlite = new Sqlite3Database(dbPath);
  }

  prepare(sql: string): SqliteStatement {
    return new KyselySqlite3Statement(this.#sqlite.prepare(sql));
  }

  close(): void {
    this.#sqlite.close();
  }
}

class KyselySqlite3Statement implements SqliteStatement {
  #statement: Statement;

  constructor(statement: Statement) {
    this.#statement = statement;
  }

  get reader(): boolean {
    return this.#statement.sql.startsWith("select");
  }

  all(parameters: ReadonlyArray<unknown>): unknown[] {
    // deno-lint-ignore no-explicit-any
    return this.#statement.all(...parameters as any);
  }

  run(
    parameters: readonly unknown[],
  ): { changes: number | bigint; lastInsertRowid: number | bigint } {
    // deno-lint-ignore no-explicit-any
    this.#statement.run(...parameters as any);
    return {
      changes: this.#statement.db.changes,
      lastInsertRowid: this.#statement.db.lastInsertRowId,
    };
  }
}

class FsMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const dir = new URL(import.meta.resolve("./migrations/"));
    for await (const entry of Deno.readDir(dir)) {
      const name = entry.name.replace(/\.ts$/, "");
      const path = new URL(entry.name, dir);
      const migration = await import(path.href);
      migrations[name] = migration;
    }
    return migrations;
  }
}

export async function openDatabase(
  dbPath: string,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<DB> {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new KyselySqlite3Database(dbPath),
    }),
  });
  const migrator = new Migrator({
    db,
    provider: new FsMigrationProvider(),
  });
  const { error, results } = await migrator.migrateToLatest();
  for (const result of results ?? []) {
    if (result.status === "Success") {
      if (!quiet) {
        console.log(
          `%c[db] migration "${result.migrationName}" ok`,
          "color: green",
        );
      }
    } else if (result.status === "Error") {
      console.error(
        `%c[db] migration "${result.migrationName}" failed`,
        "color: red",
      );
    }
  }
  if (error) {
    console.error("%c[db] migration failed", "color: red");
    console.error(error);
    Deno.exit(1);
  }
  return db;
}
