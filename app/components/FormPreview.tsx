import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { FormFieldData, FormData } from "~/lib/formTypes";
import AddIcon from "@mui/icons-material/Add";

interface FormPreviewProps {
  form: FormData;
}

export function FormPreview({ form }: FormPreviewProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {form.title || "Untitled Form"}
        </Typography>
        {form.description && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {form.description}
          </Typography>
        )}

        <Stack spacing={2}>
          {form.fields.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No fields
            </Typography>
          ) : (
            form.fields.map((field) => (
              <Box key={field.id || field.order}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {field.label}
                  {field.required && (
                    <span style={{ color: "red" }}> *</span>
                  )}
                </Typography>

                {field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder}
                    disabled
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <input
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder}
                    disabled
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                    }}
                  />
                )}
              </Box>
            ))
          )}
        </Stack>

        {form.fields.length > 0 && (
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, width: "100%" }}
            disabled
          >
            Submit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
