import { createCookieSessionStorage } from "react-router";

const SESSION_SECRET = process.env.SESSION_SECRET || "default-secret-key";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function commitSession(session: ReturnType<typeof sessionStorage.getSession>) {
  return sessionStorage.commitSession(session);
}

export async function destroySession(session: ReturnType<typeof sessionStorage.getSession>) {
  return sessionStorage.destroySession(session);
}

export interface SessionData {
  userId: string;
  email: string;
  username: string;
}

export async function getSessionUser(request: Request): Promise<SessionData | null> {
  const session = await getSession(request);
  const userId = session.get("userId");
  
  if (!userId) {
    return null;
  }
  
  return {
    userId,
    email: session.get("email") || "",
    username: session.get("username") || "",
  };
}

export async function createUserSession(
  userId: string,
  email: string,
  username: string,
  redirectTo: string
) {
  const session = await sessionStorage.getSession();
  
  session.set("userId", userId);
  session.set("email", email);
  session.set("username", username);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": await destroySession(session),
    },
  });
}
