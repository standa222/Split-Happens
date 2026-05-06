import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { FormattedMessage, useIntl } from "react-intl";
import { useAuthStore } from "../../store/authStore";
import { COLORS } from "../../constants/colors";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TUpdateProfileForm, updateProfileFormSchema } from "../../types/form/TUpdateProfileForm";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { tError } from "../../utils/localeUtils";
import { ImageAvatar } from "../../components/ImageAvatar";
import { compressToWebp } from "../../utils/imageUtils";
import { useUploadUserImage } from "../../hooks/useUploadUserImage";
import { AppSnackbar } from "../../components/AppSnackbar";
import CloseIcon from "@mui/icons-material/Close";

function formatBankAccount(bankAccount: {
  prefix: string;
  accountNumber: string;
  bankCode: string;
}) {
  const prefix = bankAccount.prefix?.trim();
  const accountNumber = bankAccount.accountNumber?.trim();
  const bankCode = bankAccount.bankCode?.trim();

  const left = prefix ? `${prefix}-${accountNumber}` : accountNumber;
  return `${left}/${bankCode}`;
}

export function ProfilePage() {
  const intl = useIntl();
  const currentUser = useAuthStore((s) => s.currentUser);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [isEditOpen, setIsEditOpen] = useState(false);

  const defaultValues = useMemo<TUpdateProfileForm>(
    () => ({
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? "",
      bankAccount: {
        prefix: currentUser?.bankAccount?.prefix ?? "",
        accountNumber: currentUser?.bankAccount?.accountNumber ?? "",
        bankCode: currentUser?.bankAccount?.bankCode ?? "",
      },
    }),
    [currentUser]
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

  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => {
      setIsEditOpen(false);

      setSnackbar({
        open: true,
        severity: "success",
        message: intl.formatMessage({
          id: "profile.edit.success",
          defaultMessage: "Profile updated successfully.",
        }),
      });
    },
  });

  const { mutate: uploadUserImage, isPending: isImageUploading } = useUploadUserImage({
    onSuccess: () => {
      // Remove local preview once upload is complete; ImageAvatar will refetch.
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      setSnackbar({
        open: true,
        severity: "success",
        message: intl.formatMessage({
          id: "profile.image.uploadSuccess",
          defaultMessage: "Profile photo updated.",
        }),
      });
    },
  });

  const openEdit = () => {
    reset(defaultValues);
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    reset(defaultValues);
  };

  const onSubmit = (data: TUpdateProfileForm) => {
    const parsed = updateProfileFormSchema.parse(data);
    updateProfile(parsed);
  };

  const onPickImage = () => {
    fileInputRef.current?.click();
  };

  const onImageSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    try {
      const webpFile = await compressToWebp(file, { maxSize: 640, quality: 0.8 });
      uploadUserImage(webpFile);
    } catch (err) {
      console.error("Failed to process/upload image", err);
      setSnackbar({
        open: true,
        severity: "error",
        message: intl.formatMessage({
          id: "profile.image.uploadError",
          defaultMessage: "Failed to upload profile photo.",
        }),
      });
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Typography variant="h4" fontWeight={700} sx={{ color: COLORS.PRIMARY }}>
          <FormattedMessage id="profile.title" defaultMessage="Profile" />
        </Typography>

        <IconButton
          aria-label={intl.formatMessage({ id: "profile.edit", defaultMessage: "Edit profile" })}
          onClick={openEdit}
          sx={{
            color: COLORS.PRIMARY,
          }}
        >
          <EditIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
        </IconButton>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={3} alignItems={{ md: "flex-start" }}>
        <Stack alignItems="center" gap={1.5} sx={{ minWidth: { md: 200 } }}>
          {localPreviewUrl ? (
            <Box
              component="img"
              src={localPreviewUrl}
              alt=""
              sx={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${COLORS.PRIMARY}`,
              }}
            />
          ) : currentUser?.id ? (
            <ImageAvatar
              type="user"
              id={currentUser.id}
              width={160}
              height={160}
              shape="circle"
              iconSize={40}
              sx={{ borderWidth: 3 }}
            />
          ) : null}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onImageSelected}
          />

          <Button
            variant="contained"
            onClick={onPickImage}
            disabled={isImageUploading || !currentUser?.id}
            startIcon={<PhotoCameraIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: COLORS.PRIMARY,
              color: COLORS.SECONDARY,
              px: 3,
            }}
          >
            {isImageUploading ? (
              <FormattedMessage id="profile.image.uploading" defaultMessage="Uploading..." />
            ) : (
              <FormattedMessage id="profile.image.change" defaultMessage="Change photo" />
            )}
          </Button>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            backgroundColor: "transparent",
            flex: 1,
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "baseline" }}
            >
              <Typography fontWeight={700} sx={{ minWidth: 180, color: COLORS.PRIMARY }}>
                <FormattedMessage id="profile.firstName" defaultMessage="First name" />
              </Typography>
              <Typography sx={{ color: COLORS.PRIMARY }}>
                {currentUser?.firstName ?? (
                  <FormattedMessage id="profile.unknown" defaultMessage="—" />
                )}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: COLORS.PRIMARY, opacity: 0.2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "baseline" }}
            >
              <Typography fontWeight={700} sx={{ minWidth: 180, color: COLORS.PRIMARY }}>
                <FormattedMessage id="profile.lastName" defaultMessage="Last name" />
              </Typography>
              <Typography sx={{ color: COLORS.PRIMARY }}>
                {currentUser?.lastName ?? (
                  <FormattedMessage id="profile.unknown" defaultMessage="—" />
                )}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: COLORS.PRIMARY, opacity: 0.2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "baseline" }}
            >
              <Typography fontWeight={700} sx={{ minWidth: 180, color: COLORS.PRIMARY }}>
                <FormattedMessage id="profile.email" defaultMessage="Email" />
              </Typography>
              <Typography sx={{ color: COLORS.PRIMARY }}>
                {currentUser?.email ?? <FormattedMessage id="profile.unknown" defaultMessage="—" />}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: COLORS.PRIMARY, opacity: 0.2 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ sm: "baseline" }}
            >
              <Typography fontWeight={700} sx={{ minWidth: 180, color: COLORS.PRIMARY }}>
                <FormattedMessage id="profile.bankAccount" defaultMessage="Bank account" />
              </Typography>
              <Box>
                {currentUser?.bankAccount ? (
                  <Typography sx={{ color: COLORS.PRIMARY }}>
                    {formatBankAccount(currentUser.bankAccount)}
                  </Typography>
                ) : (
                  <Typography sx={{ color: COLORS.PRIMARY, opacity: 0.8 }}>
                    <FormattedMessage id="profile.bankAccount.notSet" defaultMessage="Not set" />
                  </Typography>
                )}
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <Dialog
        open={isEditOpen}
        onClose={closeEdit}
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: { borderRadius: 10 },
          },
        }}
      >
        <IconButton
          aria-label="close"
          onClick={closeEdit}
          sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
        >
          <CloseIcon sx={{ fontSize: 40 }} />
        </IconButton>
        <DialogTitle sx={{ color: COLORS.PRIMARY }}>
          <FormattedMessage id="profile.edit.title" defaultMessage="Edit profile" />
        </DialogTitle>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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

            <Typography variant="subtitle1" fontWeight={700} sx={{ color: COLORS.PRIMARY }}>
              <FormattedMessage id="profile.bankAccount" defaultMessage="Bank account" />
            </Typography>

            <TextField
              label={<FormattedMessage id="register.bankAccountPrefix" defaultMessage="Prefix" />}
              {...register("bankAccount.prefix")}
              error={!!errors.bankAccount?.prefix}
              helperText={tError(intl, errors.bankAccount?.prefix?.message)}
            />

            <TextField
              label={
                <FormattedMessage id="register.bankAccountNumber" defaultMessage="Account number" />
              }
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

      <AppSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Stack>
  );
}
