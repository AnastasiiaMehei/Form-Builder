import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useFetcher, useLoaderData } from "react-router";
import type { Route } from "./+types/admin";
import { getSessionUser } from "~/lib/session.server";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getPrismaClient } from "~/lib/prisma.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getSessionUser(request);

  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/login" },
    });
  }

  try {
    const prisma = getPrismaClient();
    const forms = await prisma.form.findMany({
      where: { userId: user.userId },
      include: { _count: { select: { fields: true } } },
      orderBy: { createdAt: "desc" },
    });

    return { forms, user };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return { forms: [], user, error: "Error fetching forms" };
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "DELETE") {
    return null;
  }

  const user = await getSessionUser(request);

  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    const formId = new URL(request.url).searchParams.get("id");

    if (!formId) {
      return { error: "Form ID is required" };
    }

    const prisma = getPrismaClient();
    // Verify ownership
    const form = await prisma.form.findFirst({
      where: { id: formId, userId: user.userId },
    });

    if (!form) {
      return { error: "Form not found" };
    }

    // Delete form (fields will be deleted via cascade)
    await prisma.form.delete({ where: { id: formId } });

    return { success: true };
  } catch (error) {
    console.error("Error deleting form:", error);
    return { error: "Failed to delete form" };
  }
};

export default function AdminPage({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const { forms, user, error } = loaderData;

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this form?")) {
      fetcher.submit(null, {
        method: "DELETE",
        action: `/admin?id=${id}`,
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <div>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Admin Panel
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your forms, {user.username}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          href="/admin/new"
        >
          Create New Form
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {forms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
            You don't have any forms yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/admin/new"
          >
            Create Your First Form
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Fields
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form: any) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {form.title}
                    </Typography>
                    {form.description && (
                      <Typography variant="caption" color="textSecondary">
                        {form.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{form._count.fields}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color: form.published ? "#4caf50" : "#999",
                        fontWeight: 500,
                      }}
                    >
                      {form.published ? "Published" : "Draft"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(form.createdAt).toLocaleDateString("uk-UA")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        href={`/admin/${form.id}`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(form.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
