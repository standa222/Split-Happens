import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import { COLORS } from "../constants/colors";
import type { TUser } from "../types/TUser";
import {
  type TUpdateProfileForm,
  updateProfileFormSchema,
} from "../types/form/TUpdateProfileForm";
import { tError } from "../utils/localeUtils";
import { useUpdateProfile } from "../hooks/useUpdateProfile";

type Props = {
  open: boolean;
  user: TUser | null;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export const AdminUserEditModal = ({
  open,
  user,
  onClose,
  onSuccess,
  onError,
}: Props) => {
  const intl = useIntl();

  const defaultValues = useMemo<TUpdateProfileForm>(
    () => ({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      bankAccount: {
        prefix: user?.bankAccount?.prefix ?? "",
        accountNumber: user?.bankAccount?.accountNumber ?? "",
        bankCode: user?.bankAccount?.bankCode ?? "",
      },
    }),
    [user]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TUpdateProfileForm>({
    resolver: zodResolver(updateProfileFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [defaultValues, open, reset]);

  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const close = () => {
    onClose();
    reset(defaultValues);
  };

  const onSubmit = (data: TUpdateProfileForm) => {
    try {
      const parsed = updateProfileFormSchema.parse(data);
      updateProfile(parsed, {
        onError: (e) => onError?.(e),
      });
    } catch (e) {
      onError?.(e);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : close}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 10 },
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={close}
        sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
        disabled={isPending}
      >
        <CloseIcon sx={{ fontSize: 40 }} />
      </IconButton>

      <DialogTitle sx={{ color: COLORS.PRIMARY }}>
        <FormattedMessage id="profile.edit.title" defaultMessage="Edit profile" />
      </DialogTitle>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        onReset={() => reset(defaultValues)}
      >
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label={<FormattedMessage id="profile.firstName" defaultMessage="First name" />}
            {...register("firstName")}
            error={!!errors.firstName}
            helperText={tError(intl, errors.firstName?.message)}
            autoFocus
          />

          <TextField
            label={<FormattedMessage id="profile.lastName" defaultMessage="Last name" />}
            {...register("lastName")}
            error={!!errors.lastName}
            helperText={tError(intl, errors.lastName?.message)}
          />

          <Stack spacing={0.5}>
            <FormattedMessage id="profile.bankAccount" defaultMessage="Bank account" />
          </Stack>

          <TextField
            label={<FormattedMessage id="register.bankAccountPrefix" defaultMessage="Prefix" />}
            {...register("bankAccount.prefix")}
            error={!!errors.bankAccount?.prefix}
            helperText={tError(intl, errors.bankAccount?.prefix?.message)}
          />

          <TextField
            label={<FormattedMessage id="register.bankAccountNumber" defaultMessage="Account number" />}
            {...register("bankAccount.accountNumber")}
            error={!!errors.bankAccount?.accountNumber}
            helperText={tError(intl, errors.bankAccount?.accountNumber?.message)}
          />

          <TextField
            label={<FormattedMessage id="register.bankCode" defaultMessage="Bank code" />}
            {...register("bankAccount.bankCode")}
            error={!!errors.bankAccount?.bankCode}
            helperText={tError(intl, errors.bankAccount?.bankCode?.message)}
          />

          <Stack sx={{ alignItems: "center", width: "100%", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                width: "30%",
                px: 6,
                py: 1.5,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                backgroundColor: COLORS.PRIMARY,
                color: COLORS.SECONDARY,
              }}
              disabled={isPending}
            >
              {isPending ? (
                <FormattedMessage id="profile.edit.saving" defaultMessage="Saving..." />
              ) : (
                <FormattedMessage id="profile.edit.save" defaultMessage="Save" />
              )}
            </Button>
          </Stack>
        </DialogContent>
      </Box>
    </Dialog>
  );
};
