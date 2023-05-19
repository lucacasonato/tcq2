import * as esbuild from "$esbuild";
import { serveFile } from "$std/http/file_server.ts";

import { Context } from "../services/context.ts";
import { User } from "../services/models.ts";

await esbuild.initialize({});

export async function assets(
  req: Request,
  _ctx: Context,
  params: Record<string, string>,
) {
  const fullPath = `./frontend/${params.path}`;
  const extension = params.path.split(".").pop();
  if (extension !== "ts" && extension !== "tsx") {
    return serveFile(req, fullPath);
  }

  const contents = await Deno.readTextFile(fullPath);
  const out = await esbuild.transform(contents, {
    loader: extension,
    jsx: "automatic",
    jsxImportSource: "preact",
    platform: "browser",
    sourcemap: "inline",
    sourcefile: `/assets/${params.path}`,
  });

  return new Response(out.code, {
    status: 200,
    headers: {
      "content-type": "application/javascript",
    },
  });
}

export function html(page: string) {
  return async (
    _req: Request,
    user: User | null,
    _ctx: Context,
    params: Record<string, string>,
  ) => {
    const data = { page, params, user };
    const html = await Deno.readTextFile("./frontend/index.html");
    const importMap = await Deno.readTextFile("./frontend/import_map.json");
    const body = html
      .replace("$importmap", importMap)
      .replace("$data", JSON.stringify(data));
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  };
}
