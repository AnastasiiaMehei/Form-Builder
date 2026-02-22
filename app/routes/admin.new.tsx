import { Alert, Button, Container, Grid, Stack, TextField, Typography, Box } from "@mui/material";
import * as reactRouterPkg from "react-router";
const { redirect, json } = (reactRouterPkg as any).default ?? reactRouterPkg;
import type { Route } from "./+types/admin.new";
import { useState } from "react";
import { FieldEditor } from "~/components/FieldEditor";
import { FormPreview } from "~/components/FormPreview";
import { AddFieldDialog } from "~/components/AddFieldDialog";
import type { FormFieldData, FormData } from "~/lib/formTypes";
import { validateForm } from "~/lib/formTypes";
import SaveIcon from "@mui/icons-material/Save";


export const loader = async ({ request }: Route.LoaderArgs) => {
  const { getSessionUser } = await import("~/lib/session.server");
  const user = await getSessionUser(request);

  if (!user) {
    return redirect("/auth/login");
  }

  return { user };
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return null;
  }

  const { getSessionUser } = await import("~/lib/session.server");
  const user = await getSessionUser(request);

  if (!user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, fields, published } = body;

    if (!title?.trim()) {
      return json({ errors: ["Form title is required"] }, { status: 400 });
    }

    const { getPrismaClient } = await import("~/lib/prisma.server");
    const prisma = getPrismaClient();

    console.log('admin.new action - session user:', user);
    // ensure user exists in DB
    try {
      const existingUser = await prisma.user.findUnique({ where: { id: user.userId } });
      console.log('admin.new action - existingUser:', existingUser);
      if (!existingUser) {
        try {
          const created = await prisma.user.create({
            data: {
              id: user.userId,
              email: user.email || `seed+${Date.now()}@example.local`,
              username: user.username || `user_${Date.now()}`,
              password: `__seeded__${Date.now()}`,
            },
          });
          console.log('admin.new action - created user:', created);
        } catch (createErr) {
          console.warn('admin.new action - user.create error:', createErr);
        }
      }
    } catch (findErr) {
      console.warn('admin.new action - user.findUnique error:', findErr);
    }

    const createdForm = await prisma.form.create({
      data: {
        title,
        description: description || "",
        published: !!published,
        userId: user.userId,
        fields: {
          create: fields?.map(
            (field: FormFieldData, index: number) => ({
              label: field.label,
              type: field.type,
              placeholder: field.placeholder,
              required: field.required,
              order: index,
              options: JSON.stringify(field.options || {}),
            })
          ) || [],
        },
      },
      include: { fields: { orderBy: { order: "asc" } } },
    });

    return json({ success: true, formId: createdForm.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating form:", error);
    return json({ error: "Failed to create form" }, { status: 500 });
  }
};

export default function NewFormPage({ loaderData, actionData }: Route.ComponentProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    published: false,
    fields: [],
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
      const response = await fetch("/admin/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const { formId } = await response.json();
        window.location.href = `/admin/${formId}`;
      } else {
        const error = await response.json();
        alert(error.errors?.join("\n") || error.error || "Error creating form");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      window.location.href = `/admin/`;
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
          Create New Form
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
                required
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

            {formData.fields.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                No fields yet. Add your first field.
              </Typography>
            )}

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
              {saving ? "Creating..." : "Create Form"}
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
