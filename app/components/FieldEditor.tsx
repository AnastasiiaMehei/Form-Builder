import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { FormFieldData, FieldOption } from "~/lib/formTypes";
import { getFieldOptionKeys } from "~/lib/formTypes";

interface FieldEditorProps {
  field: FormFieldData;
  onUpdate: (field: FormFieldData) => void;
  onDelete: () => void;
}

export function FieldEditor({ field, onUpdate, onDelete }: FieldEditorProps) {
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState<FieldOption>(
    typeof field.options === "string"
      ? JSON.parse(field.options)
      : field.options
  );

  const optionKeys = getFieldOptionKeys(field.type);

  const handleOptionChange = (key: keyof FieldOption, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    const updatedOptions = { ...options, [key]: numValue };
    setOptions(updatedOptions);
    onUpdate({
      ...field,
      options: updatedOptions,
    });
  };

  const handleFieldChange = (key: string, value: any) => {
    onUpdate({
      ...field,
      [key]: value,
    });
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        backgroundColor: expanded ? "#f5f5f5" : "#fff",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div onClick={(e) => e.stopPropagation()}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Field {field.order + 1}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {field.label || "Unlabeled"} ({field.type})
            </Typography>
          </div>
          <Button
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </Button>
        </Box>

        {expanded && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2} onClick={(e) => e.stopPropagation()}>
              <TextField
                label="Field label"
                value={field.label}
                onChange={(e) => handleFieldChange("label", e.target.value)}
                size="small"
                fullWidth
              />

              <TextField
                label="Tooltip / Placeholder"
                value={field.placeholder || ""}
                onChange={(e) =>
                  handleFieldChange("placeholder", e.target.value || undefined)
                }
                size="small"
                fullWidth
              />

              <FormGroup>
                <FormControlLabel
                  control={
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) =>
                        handleFieldChange("required", e.target.checked)
                      }
                    />
                  }
                  label="Required"
                />
              </FormGroup>

              {optionKeys.map((key) => (
                <TextField
                  key={key}
                  label={key}
                  type="number"
                  value={options[key] ?? ""}
                  onChange={(e) => handleOptionChange(key, e.target.value)}
                  size="small"
                  fullWidth
                />
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
