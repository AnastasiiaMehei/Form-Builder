import { Alert, Box, Button, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import { redirect } from "react-router";
import type { Route } from "./+types/admin.$id";
import { getSessionUser } from "~/lib/session.server";
import { PrismaClient } from "@prisma/client";
import { useState } from "react";
import { FieldEditor } from "~/components/FieldEditor";
import { FormPreview } from "~/components/FormPreview";
import { AddFieldDialog } from "~/components/AddFieldDialog";
import type { FormFieldData, FormData } from "~/lib/formTypes";
import { validateForm, parseOptions } from "~/lib/formTypes";
import SaveIcon from "@mui/icons-material/Save";
import { getPrismaClient } from "~/lib/prisma.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const user = await getSessionUser(request);

  if (!user) {
    return redirect("/auth/login");
  }

  try {
    const prisma = getPrismaClient();
    const form = await prisma.form.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
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

    return { form, user };
  } catch (error) {
    console.error("Error fetching form:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch form" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return null;
  }

  const user = await getSessionUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await request.json();
    const { title, description, published, fields } = body;

    const errors = validateForm({ title, description, published, fields, id: params.id });
    if (errors.length > 0) {
      return new Response(JSON.stringify({ errors }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    // Verify ownership
    const prisma = getPrismaClient();
    const existingForm = await prisma.form.findFirst({
      where: { id: params.id, userId: user.userId },
    });

    if (!existingForm) {
      return new Response(JSON.stringify({ error: "Form not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const updatedForm = await prisma.form.update({
      where: { id: params.id },
      data: {
        title,
        description: description || "",
        published,
        fields: {
          deleteMany: {},
          create: fields.map(
            (field: FormFieldData, index: number) => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required,
              order: index,
              options: JSON.stringify(field.options || {}),
            })
          ),
        },
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return new Response(JSON.stringify({ success: true, form: updatedForm }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error updating form:", error);
    return new Response(JSON.stringify({ error: "Failed to update form" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export default function EditFormPage({ loaderData, actionData }: Route.ComponentProps) {
  const { form: initialForm } = loaderData;

  const [formData, setFormData] = useState<FormData>({
    id: initialForm.id,
    title: initialForm.title,
    description: initialForm.description || "",
    published: initialForm.published,
    fields: initialForm.fields.map((f: any) => ({
      id: f.id,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      required: f.required,
      order: f.order,
      options: parseOptions(f.options),
    })),
  });

  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const errors = validateForm(formData);
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/admin/${formData.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Form successfully saved!");
      } else {
        const error = await response.json();
        alert(error.errors?.join("\n") || error.error || "Error saving form");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form");
    } finally {
      setSaving(false);
    }
  };

  const handleAddField = (field: Omit<FormFieldData, "id">) => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { ...field, id: `new-${Date.now()}` }],
    });
  };

  const handleUpdateField = (index: number, field: FormFieldData) => {
    const newFields = [...formData.fields];
    newFields[index] = field;
    setFormData({ ...formData, fields: newFields });
  };

  const handleDeleteField = (index: number) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter((_, i) => i !== index),
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Editing Form
        </Typography>
      </Box>

      {actionData?.errors && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionData.errors.join("\n")}
        </Alert>
      )}

      {actionData?.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionData.error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <div>
              <TextField
                label="Form Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              />

              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                <Button
                  variant={formData.published ? "contained" : "outlined"}
                  onClick={() =>
                    setFormData({ ...formData, published: !formData.published })
                  }
                >
                  {formData.published ? "Published" : "Draft"}
                </Button>
              </Box>
            </div>

            <Typography variant="h6">Form fields</Typography>

            {formData.fields.map((field, index) => (
              <FieldEditor
                key={field.id || index}
                field={field}
                onUpdate={(updated) => handleUpdateField(index, updated)}
                onDelete={() => handleDeleteField(index)}
              />
            ))}

            <Button
              variant="outlined"
              onClick={() => setAddFieldOpen(true)}
            >
              + Add Field
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? "Saving..." : "Save Form"}
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Form Preview
          </Typography>
          <FormPreview form={formData} />
        </Grid>
      </Grid>

      <AddFieldDialog
        open={addFieldOpen}
        onClose={() => setAddFieldOpen(false)}
        onAdd={handleAddField}
        fields={formData.fields}
      />
    </Container>
  );
}
