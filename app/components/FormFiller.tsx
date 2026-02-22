import {
  Box,
  Button,
  Button as MuiButton,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useState } from "react";
import type { FormData } from "~/lib/formTypes";
import { parseOptions } from "~/lib/formTypes";
import { ConfirmationModal } from "~/components/ConfirmationModal";

interface FormFillerProps {
  form: FormData;
}

export function FormFiller({ form }: FormFillerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.fields.forEach((field) => {
      const value = values[field.id || field.label] || "";
      const options = typeof field.options === "string" ? parseOptions(field.options) : field.options;

      // Check required
      if (field.required && !value.trim()) {
        newErrors[field.id || field.label] = "Required field";
        return;
      }

      if (!value.trim()) return;

      // Check minLength/maxLength for text and textarea
      if (field.type === "text" || field.type === "textarea") {
        if (options.minLength && value.length < options.minLength) {
          newErrors[field.id || field.label] = `Minimum ${options.minLength} characters`;
        }
        if (options.maxLength && value.length > options.maxLength) {
          newErrors[field.id || field.label] = `Maximum ${options.maxLength} characters`;
        }
      }

      // Check min/max for number
      if (field.type === "number") {
        const numValue = Number(value);
        if (options.min !== undefined && numValue < options.min) {
          newErrors[field.id || field.label] = `Minimum ${options.min}`;
        }
        if (options.max !== undefined && numValue > options.max) {
          newErrors[field.id || field.label] = `Maximum ${options.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setConfirmOpen(false);
      setTimeout(() => {
        setSubmitted(false);
        setValues({});
        setErrors({});
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        ✅ Form submitted successfully! Thank you for your response.
      </Alert>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {form.fields.map((field) => {
            const fieldId = field.id || field.label;
            const options = typeof field.options === "string" ? parseOptions(field.options) : field.options;
            const error = errors[fieldId];
            const value = values[fieldId] || "";

            return (
              <Box key={fieldId}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  {field.label}
                  {field.required && <span style={{ color: "red" }}> *</span>}
                </Typography>

                {field.type === "textarea" ? (
                  <TextField
                    multiline
                    rows={options.rows || 4}
                    value={value}
                    onChange={(e) => handleChange(fieldId, e.target.value)}
                    placeholder={field.placeholder}
                    fullWidth
                    size="small"
                    error={!!error}
                    helperText={error}
                    inputProps={{
                      minLength: options.minLength,
                      maxLength: options.maxLength,
                    }}
                  />
                ) : (
                  <TextField
                    type={field.type}
                    value={value}
                    onChange={(e) => handleChange(fieldId, e.target.value)}
                    placeholder={field.placeholder}
                    fullWidth
                    size="small"
                    error={!!error}
                    helperText={error}
                    inputProps={{
                      ...(field.type === "text" && {
                        minLength: options.minLength,
                        maxLength: options.maxLength,
                      }),
                      ...(field.type === "number" && {
                        min: options.min,
                        max: options.max,
                        step: options.step || 1,
                      }),
                    }}
                  />
                )}
              </Box>
            );
          })}

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Stack>
      </form>

      <ConfirmationModal
        open={confirmOpen}
        data={values}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={submitting}
      />
    </>
  );
}
