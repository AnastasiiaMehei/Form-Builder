import type { Route } from "./+types/api.forms";
import { getSessionUser } from "~/lib/session.server";
import { getPrismaClient } from "~/lib/prisma.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const user = await getSessionUser(request);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const prisma = getPrismaClient();
    const forms = await prisma.form.findMany({
      where: { userId: user.userId },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return new Response(JSON.stringify(forms), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch forms" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const user = await getSessionUser(request);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await request.json();
    const { title, description, fields } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: "Title is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const prisma = getPrismaClient();
    const form = await prisma.form.create({
      data: {
        title,
        description: description || "",
        userId: user.userId,
        fields: {
          create: fields?.map(
            (field: { label: string; type: string; required?: boolean }, index: number) => ({
              label: field.label,
              type: field.type,
              required: field.required || false,
              order: index,
            })
          ) || [],
        },
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return new Response(JSON.stringify(form), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error creating form:", error);
    return new Response(JSON.stringify({ error: "Failed to create form" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
