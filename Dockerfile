FROM denoland/deno:1.33.3

WORKDIR /app

COPY . /app/

# Cache the sqlite3 binary
RUN deno eval --unstable 'import { openDatabase } from "./services/db.ts";await openDatabase("/tmp/db.sqlite");'
RUN deno cache main.ts

CMD ["run", "-A", "--unstable", "main.ts"]

EXPOSE 8000