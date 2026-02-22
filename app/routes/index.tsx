import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Alert,
} from "@mui/material";
import type { Route } from "./+types/index";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getPrismaClient } from "~/lib/prisma.server";

export const loader = async () => {
  try {
    const prisma = getPrismaClient();
    const forms = await prisma.form.findMany({
      where: { published: true },
      include: { _count: { select: { fields: true } } },
      orderBy: { createdAt: "desc" },
    });

    return { forms };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return { forms: [], error: "Error fetching forms" };
  }
};

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { forms, error } = loaderData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: "center" }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
          Form Builder
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Select a form and fill it out
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {forms.length === 0 ? (
        <Alert severity="info">
          No published forms available. Comeback later!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {forms.map((form: any) => (
            <Grid item xs={12} sm={6} md={4} key={form.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s",
                  "&:hover": {
                   
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    {form.title}
                  </Typography>
                  {form.description && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {form.description}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        p: 0.75,
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        borderRadius: 1,
                      }}
                    >
                      Fields: {form._count.fields}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        p: 0.75,
                        backgroundColor: "#f3e5f5",
                        color: "#7b1fa2",
                        borderRadius: 1,
                      }}
                    >
                      {new Date(form.createdAt).toLocaleDateString("uk-UA")}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    href={`/forms/${form.id}`}
                  >
                    Fill Out
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
