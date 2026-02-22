import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  Button,
} from "@mui/material";
import type { Route } from "./+types/forms.$id";
import { FormFiller } from "~/components/FormFiller";
import { parseOptions } from "~/lib/formTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getPrismaClient } from "~/lib/prisma.server";

export const loader = async ({ params }: Route.LoaderArgs) => {
  try {
    const prisma = getPrismaClient();
    const form = await prisma.form.findFirst({
      where: {
        id: params.id,
        published: true,
      },
      include: {
        fields: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!form) {
      return new Response(JSON.stringify({ error: "Form not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Transform form data for component
    const formData = {
      id: form.id,
      title: form.title,
      description: form.description || "",
      published: form.published,
      fields: form.fields.map((f: any) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        required: f.required,
        order: f.order,
        options: parseOptions(f.options),
      })),
    };

    return { form: formData };
  } catch (error) {
    console.error("Error fetching form:", error);
    return new Response(JSON.stringify({ error: "Error fetching form" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export default function FormPage({ loaderData }: Route.ComponentProps) {
  const { form, error } = loaderData;

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          href="/"
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        href="/"
        sx={{ mb: 3 }}
      >
        Return to Home
      </Button>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            {form.title}
          </Typography>
          {form.description && (
            <Typography variant="body1" color="textSecondary">
              {form.description}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <FormFiller form={form} />
        </CardContent>
      </Card>
    </Container>
  );
}
