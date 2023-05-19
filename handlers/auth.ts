import { getCookies } from "$std/http/cookie.ts";
import { toHashString } from "$std/crypto/to_hash_string.ts";

import { Context } from "../services/context.ts";
import { getAuthenticatedUser } from "../services/github.ts";
import { User } from "../services/models.ts";

const oauthSessions = new Map<string, OauthSession>();

interface OauthSession {
  state: string;
  codeVerifier: string;
}

export async function login(_req: Request, ctx: Context): Promise<Response> {
  const id = crypto.randomUUID();
  const state = crypto.randomUUID();
  const { uri, codeVerifier } = await ctx.oauth2Client.code
    .getAuthorizationUri({ state });
  const oauthSession = {
    state,
    codeVerifier,
  };
  oauthSessions.set(id, oauthSession);
  return new Response("", {
    status: 302,
    headers: {
      location: uri.href,
      "set-cookie":
        `oauthSessionId=${id}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

export async function callback(req: Request, ctx: Context): Promise<Response> {
  const cookies = getCookies(req.headers);
  const oauthSessionId = cookies.oauthSessionId;
  if (!oauthSessionId) {
    return new Response("Missing oauthSessionId cookie", {
      status: 400,
    });
  }
  const oauthSession = oauthSessions.get(oauthSessionId);
  if (!oauthSession) {
    return new Response("Invalid oauthSessionId cookie", {
      status: 400,
    });
  }
  const { accessToken } = await ctx.oauth2Client.code.getToken(req.url, {
    codeVerifier: oauthSession.codeVerifier,
    state: oauthSession.state,
  });

  const ghUser = await getAuthenticatedUser(accessToken);

  await ctx.db
    .insertInto("users")
    .values({
      githubId: ghUser.id,
      login: ghUser.login,
      avatarUrl: ghUser.avatar_url,
      affiliation: ghUser.company,
    })
    .onConflict((conflict) =>
      conflict.column("githubId").doUpdateSet({
        login: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        affiliation: ghUser.company,
      })
    )
    .executeTakeFirst();

  const token = crypto.randomUUID();
  const hash = await hashToken(token);

  await ctx.db
    .insertInto("sessions")
    .values({
      hash,
      userId: ghUser.id,
    })
    .executeTakeFirst();

  return new Response("", {
    status: 302,
    headers: {
      location: "/",
      "set-cookie":
        `token=${token}; Max-Age=31536000; Secure; HttpOnly; SameSite=Lax; Path=/`,
    },
  });
}

export async function logout(req: Request, ctx: Context): Promise<Response> {
  const { token } = getCookies(req.headers);
  if (token) {
    const hash = await hashToken(token);
    await ctx.db
      .deleteFrom("sessions")
      .where("hash", "==", hash)
      .executeTakeFirst();
  }
  return new Response("", {
    status: 302,
    headers: {
      location: "/",
    },
  });
}

async function hashToken(token: string) {
  const tokenBytes = new TextEncoder().encode(token);
  const hashBytes = await crypto.subtle.digest("SHA-256", tokenBytes);
  return toHashString(hashBytes);
}

export function withUser(
  handler: (
    req: Request,
    user: User | null,
    ctx: Context,
    params: Record<string, string>,
  ) => Response | Promise<Response>,
): (
  req: Request,
  ctx: Context,
  params: Record<string, string>,
) => Promise<Response> {
  return async (req, ctx, params) => {
    const cookies = getCookies(req.headers);
    const token = cookies.token;
    if (!token) {
      return handler(req, null, ctx, params);
    }
    const hash = await hashToken(token);
    const user = await ctx.db
      .selectFrom("users")
      .selectAll()
      .leftJoin("sessions", "sessions.userId", "users.githubId")
      .where("sessions.hash", "==", hash)
      .executeTakeFirst() ?? null;
    return handler(req, user, ctx, params);
  };
}

export function authenticated(
  handler: (
    req: Request,
    user: User,
    ctx: Context,
    params: Record<string, string>,
  ) => Response | Promise<Response>,
): (
  req: Request,
  ctx: Context,
  params: Record<string, string>,
) => Promise<Response> {
  return withUser((req, user, ctx, params) => {
    if (!user) {
      return new Response("/", {
        status: 401,
      });
    }
    return handler(req, user, ctx, params);
  });
}
