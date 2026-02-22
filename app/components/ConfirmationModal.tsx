import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Divider,
} from "@mui/material";

interface ConfirmationModalProps {
  open: boolean;
  data: Record<string, any>;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmationModal({
  open,
  data,
  onClose,
  onConfirm,
  loading = false,
}: ConfirmationModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify input data</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {Object.entries(data).map(([key, value]) => (
            <Box key={key}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                {key}
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 1,
                  wordBreak: "break-word",
                }}
              >
                <Typography variant="body2">{String(value || "-")}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
        >
          {loading ? "Sending..." : "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
