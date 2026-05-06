import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { COLORS } from "../../constants/colors";
import { useLogin } from "../../hooks/useLogin";
import { loginFormSchema, TLoginForm } from "../../types/form/TLoginForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormattedMessage, useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { tError } from "../../utils/localeUtils";
import { AppSnackbar } from "../../components/AppSnackbar";
import { formatApiError, getApiErrorMessage } from "../../utils/apiErrorUtils";

type Props = {
  onSwitchToRegister: () => void;
};

export function LoginForm({ onSwitchToRegister }: Props) {
  const intl = useIntl();
  const { mutate, isPending, isError, error } = useLogin();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (isError) setSnackbarOpen(true);
  }, [isError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginForm>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = (data: TLoginForm) => {
    mutate(data);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          label={<FormattedMessage id="login.email" />}
          type="text"
          {...register("email")}
          error={!!errors.email}
          helperText={tError(intl, errors.email?.message)}
        />

        <TextField
          label={<FormattedMessage id="login.password" />}
          type="password"
          {...register("password")}
          error={!!errors.password}
          helperText={tError(intl, errors.password?.message)}
        />
        <Button
          sx={{
            padding: "10px 30px",
            borderRadius: 800,
            backgroundColor: COLORS.PRIMARY,
            color: COLORS.SECONDARY,
            fontWeight: 600,
            transition: "background-color 0.15s, color 0.15s",
            whiteSpace: "nowrap",
          }}
          type="submit"
          variant="contained"
          fullWidth
          disabled={isPending}
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {isPending ? (
            <FormattedMessage id="login.submitting" />
          ) : (
            <FormattedMessage id="login.submit" />
          )}
        </Button>
        <Typography sx={{ fontSize: 20 }}>
          {<FormattedMessage id="login.noAccount" />}{" "}
          <Button
            onClick={onSwitchToRegister}
            sx={{
              padding: 0,
              minWidth: 0,
              color: COLORS.PRIMARY,
              fontWeight: 600,
              fontSize: 20,
              textTransform: "none",
            }}
          >
            {<FormattedMessage id="login.signUp" />}
          </Button>
        </Typography>
      </Box>

      <AppSnackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        message={formatApiError(intl, error)}
        severity="error"
      />
    </>
  );
}
