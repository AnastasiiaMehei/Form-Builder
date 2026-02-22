import type { Route } from "./+types/api.forms.$id";
import { getSessionUser } from "~/lib/session.server";
import { getPrismaClient } from "~/lib/prisma.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const user = await getSessionUser(request);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const prisma = getPrismaClient();
    const form = await prisma.form.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    if (!form) {
      return new Response(JSON.stringify({ error: "Form not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify(form), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error fetching form:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch form" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const user = await getSessionUser(request);
  
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const prisma = getPrismaClient();
    // Verify ownership
    const form = await prisma.form.findFirst({
      where: { id: params.id, userId: user.userId },
    });

    if (!form) {
      return new Response(JSON.stringify({ error: "Form not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Update form
    if (request.method === "PATCH") {
      const body = await request.json();
      const { title, description, fields } = body;

      const updatedForm = await prisma.form.update({
        where: { id: params.id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(fields && {
            fields: {
              deleteMany: {},
              create: fields.map(
                (field: { label: string; type: string; required?: boolean }, index: number) => ({
                  label: field.label,
                  type: field.type,
                  required: field.required || false,
                  order: index,
                })
              ),
            },
          }),
        },
        include: { fields: { orderBy: { order: "asc" } } },
      });

      return new Response(JSON.stringify(updatedForm), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Delete form
    if (request.method === "DELETE") {
      await prisma.form.delete({
        where: { id: params.id },
      });

      return new Response(JSON.stringify({ success: true }), { status: 204, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error updating/deleting form:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
