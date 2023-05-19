FROM denoland/deno:1.33.3

RUN apt-get update && apt-get install -y sqlite3

WORKDIR /app

COPY . /app/

# Cache the sqlite3 binary
RUN deno cache main.ts
RUN deno eval --unstable 'import { openDatabase } from "./services/db.ts";await openDatabase("/tmp/db.sqlite");'
RUN deno eval --unstable 'import * as esbuild from "$esbuild"; await esbuild.initialize({});esbuild.stop();'

CMD ["run", "-A", "--unstable", "main.ts"]

EXPOSE 8000