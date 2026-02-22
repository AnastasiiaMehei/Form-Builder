import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import type { FormFieldData } from "~/lib/formTypes";
import AddIcon from "@mui/icons-material/Add";

interface AddFieldDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (field: Omit<FormFieldData, "id">) => void;
  fields: FormFieldData[];
}

export function AddFieldDialog({ open, onClose, onAdd, fields }: AddFieldDialogProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"text" | "number" | "textarea">("text");
  const [placeholder, setPlaceholder] = useState("");

  const handleAdd = () => {
    if (!label.trim()) return;

    onAdd({
      label,
      type,
      placeholder: placeholder || undefined,
      required: false,
      order: fields.length,
      options: {},
    });

    setLabel("");
    setType("text");
    setPlaceholder("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Field</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          <TextField
            autoFocus
            label="Field Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Field Type</InputLabel>
            <Select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "text" | "number" | "textarea")
              }
              label="Field Type"
            >
              <MenuItem value="text">Text (single-line)</MenuItem>
              <MenuItem value="number">Number (numeric)</MenuItem>
              <MenuItem value="textarea">Textarea (multi-line)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Tooltip / Placeholder"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!label.trim()}>
          Add Field
        </Button>
      </DialogActions>
    </Dialog>
  );
}
