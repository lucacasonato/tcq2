import { router } from "https://deno.land/x/rutt@0.1.0/mod.ts";
import { Context } from "../services/context.ts";

import * as auth from "./auth.ts";

export default router<Context>({
  "/": auth.withUser((_, user) => {
    if (!user) {
      return new Response("Hello, stranger! <a href='/login'>Login</a>", {
        headers: { "content-type": "text/html" },
      });
    }
    let body = `Hello, @${user.login}`;
    if (user.affiliation) {
      body += ` from ${user.affiliation}`;
    }
    body += `! <a href='/logout'>Logout</a>`;
    return new Response(body, { headers: { "content-type": "text/html" } });
  }),
  "/login": auth.login,
  "/login/callback": auth.callback,
  "/logout": auth.logout,
});
