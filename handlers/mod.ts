import { router } from "https://deno.land/x/rutt@0.1.0/mod.ts";
import { Context } from "../services/context.ts";

import * as auth from "./auth.ts";
import * as meetings from "./meetings.ts";
import * as frontend from "./frontend.ts";
import { html } from "./frontend.ts";

export default router<Context>({
  "GET@/": auth.withUser(html("index")),
  "GET@/login": auth.login,
  "GET@/login/callback": auth.callback,
  "GET@/logout": auth.logout,
  "POST@/meetings": auth.authenticated(meetings.create),
  "GET@/meetings/:id": auth.withUser(html("meeting")),
  "GET@/meetings/:id/events": meetings.events,
  "POST@/meetings/:id/chairs": auth.authenticated(meetings.addChair),
  "GET@/assets/:path+": frontend.assets,
});
