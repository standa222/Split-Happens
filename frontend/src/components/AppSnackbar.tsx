import { Alert, Snackbar } from "@mui/material";
import type { SnackbarProps } from "@mui/material";
import { COLORS } from "../constants/colors";

export type AppSnackbarSeverity = "error" | "warning" | "info" | "success";

export type AppSnackbarProps = {
  open: boolean;
  onClose: () => void;
  message: string;
  severity: AppSnackbarSeverity;
  /** If true, uses MUI's filled variant (more visible). */
  filled?: boolean;
  /** Max width of the snackbar container (default 600). */
  maxWidth?: number;
};

export function AppSnackbar({
  open,
  onClose,
  message,
  severity,
  filled = true,
  maxWidth = 600,
}: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      sx={{
        maxWidth,
        mx: { xs: 2, sm: 0 },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant={filled ? "filled" : "standard"}
        sx={{
          width: "100%",
          fontSize: 16,
          borderRadius: 40,
          color: filled ? COLORS.SECONDARY : undefined,
          backgroundColor: filled && severity === "error" ? COLORS.RED : undefined,
          alignItems: "center",
          "& .MuiAlert-action": {
            pt: 0,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
