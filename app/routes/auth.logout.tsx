import { redirect } from "react-router";
import type { Route } from "./+types/auth.logout";
import { logout } from "~/lib/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return redirect("/");
  }

  return await logout(request);
};

export const loader = async () => {
  return redirect("/");
};
