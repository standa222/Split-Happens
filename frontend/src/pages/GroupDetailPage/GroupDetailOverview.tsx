import { TGroupDetail } from "../../types/dto/TGroupDetail";
import { useAuthStore } from "../../store/authStore";
import { COLORS } from "../../constants/colors";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { BalanceDisplay } from "../../components/BalanceDisplay";
import SettingsIcon from "@mui/icons-material/Settings";
import { ChangeEvent, useRef, useState } from "react";
import { GroupFormModal } from "../../components/GroupFormModal";
import { AddExpenseButton } from "../../components/AddExpenseButton";
import { LeaveGroupModal } from "../../components/LeaveGroupModal";
import { ImageAvatar } from "../../components/ImageAvatar";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { compressToWebp } from "../../utils/imageUtils";
import { useUploadGroupImage } from "../../hooks/useUploadGroupImage";
import { useIntl } from "react-intl";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";

export const GroupDetailOverview = ({ group }: { group: TGroupDetail }) => {
  const intl = useIntl();
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [leaveGroupModalOpen, setLeaveGroupModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const userId = useAuthStore((s) => s.currentUser.id);
  const userDebts = group.debts.filter(
    (debt) => debt.debtor.id === userId || debt.creditor.id === userId
  );
  const balance = userDebts.reduce(
    (acc, debt) => (userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount),
    0
  );

  const { mutate: uploadGroupImage, isPending: isGroupImageUploading } = useUploadGroupImage(
    group.id,
    {
      onSuccess: () => {
        setLocalPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      },
    }
  );

  const onPickImage = () => {
    fileInputRef.current?.click();
  };

  const onImageSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file again triggers onChange.
    e.target.value = "";

    // Local immediate preview (before compression/upload).
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    try {
      const webpFile = await compressToWebp(file, { maxSize: 960, quality: 0.8 });
      uploadGroupImage(webpFile);
    } catch (err) {
      console.error("Failed to process/upload group image", err);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  return (
    <>
      {/* Desktop header */}
      <Stack
        direction="row"
        gap={6}
        alignItems="center"
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        <Stack gap={1.25} alignItems="flex-start">
          {localPreviewUrl ? (
            <Box
              component="img"
              src={localPreviewUrl}
              alt=""
              sx={{
                width: 296,
                height: 140,
                minWidth: 296,
                minHeight: 140,
                borderRadius: "20px",
                objectFit: "cover",
                border: `2px solid ${COLORS.PRIMARY}`,
              }}
            />
          ) : (
            <ImageAvatar
              type="group"
              id={group.id}
              width={296}
              height={140}
              shape="rounded"
              iconSize={40}
              sx={{
                minWidth: 296,
                minHeight: 140,
                borderRadius: "20px",
              }}
              imgSx={{
                minWidth: 296,
                minHeight: 140,
                borderRadius: "20px",
              }}
            />
          )}

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
            disabled={isGroupImageUploading}
            startIcon={<PhotoCameraIcon />}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: COLORS.PRIMARY,
              color: COLORS.SECONDARY,
              px: 3,
              alignSelf: "center",
            }}
          >
            {isGroupImageUploading
              ? intl.formatMessage({ id: "group.image.uploading", defaultMessage: "Uploading..." })
              : intl.formatMessage({ id: "group.image.change", defaultMessage: "Change image" })}
          </Button>
        </Stack>

        <Stack gap={2} flexGrow={1}>
          <Typography variant="h5" fontWeight={600}>
            {group.name}
          </Typography>
          <BalanceDisplay variant="h6" balance={balance} currency={group.defaultCurrency} />
        </Stack>
        <Stack direction={"row"} alignItems="center" gap={1}>
          <IconButton onClick={() => setEditGroupModalOpen(true)}>
            <SettingsIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
          </IconButton>
          <IconButton onClick={() => setEditGroupModalOpen(true)}>
            <GroupAddIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
          </IconButton>
          <IconButton onClick={() => setLeaveGroupModalOpen(true)}>
            <GroupRemoveIcon sx={{ fontSize: 40, color: COLORS.RED }} />
          </IconButton>
        </Stack>
      </Stack>

      {/* Mobile header */}
      <Stack sx={{ display: { xs: "flex", md: "none" } }} gap={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            gap: 1.5,
            pb: 1,
          }}
        >
          <Stack gap={0.25} flex={1} minWidth={0}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                color: COLORS.PRIMARY,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {group.name}
            </Typography>
            <BalanceDisplay variant="body2" balance={balance} currency={group.defaultCurrency} />
          </Stack>

          <Stack direction="row" alignItems="center" gap={0.5}>
            <IconButton
              onClick={onPickImage}
              disabled={isGroupImageUploading}
              sx={{ color: COLORS.PRIMARY }}
            >
              <AddAPhotoIcon />
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onImageSelected}
            />
            <IconButton onClick={() => setEditGroupModalOpen(true)}>
              <SettingsIcon sx={{ fontSize: 24, color: COLORS.PRIMARY }} />
            </IconButton>
            <IconButton onClick={() => setEditGroupModalOpen(true)}>
              <GroupAddIcon sx={{ fontSize: 24, color: COLORS.PRIMARY }} />
            </IconButton>
            <IconButton onClick={() => setLeaveGroupModalOpen(true)}>
              <GroupRemoveIcon sx={{ fontSize: 24, color: COLORS.RED }} />
            </IconButton>
          </Stack>
        </Stack>
        <Stack>
          <AddExpenseButton
            variant={{ xs: "body2", sm: "body2" }}
            group={group}
            direction="row"
            size={{ xs: "small", md: "large" }}
          />
        </Stack>
      </Stack>

      <GroupFormModal
        open={editGroupModalOpen}
        onClose={() => setEditGroupModalOpen(false)}
        initGroup={group}
      />

      <LeaveGroupModal
        open={leaveGroupModalOpen}
        onClose={() => setLeaveGroupModalOpen(false)}
        groupId={group.id}
        groupName={group.name}
      />
    </>
  );
};
