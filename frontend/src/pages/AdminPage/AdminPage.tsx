import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Page404 } from "../Page404";
import {
  useAdminGroupsQuery,
  useAdminQuery,
  useAdminUsersQuery,
} from "../../hooks/useAdminQuery";
import { FormattedMessage, useIntl } from "react-intl";
import { COLORS } from "../../constants/colors";
import { useMemo, useState, useEffect } from "react";
import { GroupFormModal } from "../../components/GroupFormModal";
import { useGroupDetail } from "../../hooks/useGroupsQuery";
import { useAdminDeleteGroupMutation } from "../../hooks/useAdminMutations";
import { AppSnackbar } from "../../components/AppSnackbar";
import { formatApiError } from "../../utils/apiErrorUtils";
import {TGroupLight} from "../../types/dto/TGroupLight";

export const AdminPage = () => {
  const intl = useIntl();

  const {
    data: probe,
    isLoading: probeLoading,
    isError: probeError,
  } = useAdminQuery();

  const isForbidden = probe ? !probe.groupsOk || !probe.usersOk : false;

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
  } = useAdminGroupsQuery(!isForbidden);

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useAdminUsersQuery(!isForbidden);

  const isLoading = probeLoading || groupsLoading || usersLoading;
  const isError = probeError || groupsError || usersError;

  // Two-step edit flow:
  // 1) click edit => set pendingGroupId to start loading detail
  // 2) when detail is loaded => open modal by setting openGroupId
  const [pendingGroupId, setPendingGroupId] = useState<number | null>(null);
  const [openGroupId, setOpenGroupId] = useState<number | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<TGroupLight | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; severity: "success" | "error"; message: string }>(
    { open: false, severity: "success", message: "" }
  );

  const { data: pendingGroupDetail, isLoading: isPendingGroupLoading } = useGroupDetail(
    pendingGroupId ?? -1,
    { enabled: typeof pendingGroupId === "number" }
  );

  const isEditModalOpen = typeof openGroupId === "number";

  // When the detail arrives, open the modal.
  useEffect(() => {
    if (typeof pendingGroupId !== "number") return;
    if (isPendingGroupLoading) return;
    if (!pendingGroupDetail) return;

    setOpenGroupId(pendingGroupId);
    setPendingGroupId(null);
  }, [pendingGroupDetail, isPendingGroupLoading, pendingGroupId]);

  const { data: openGroupDetail } = useGroupDetail(openGroupId ?? -1, {
    enabled: isEditModalOpen,
  });

  const { mutate: deleteGroupMutate, isPending: isDeletePending } =
    useAdminDeleteGroupMutation({
      onSuccess: () => {
        setDeleteGroup(null);
        setSnackbar({
          open: true,
          severity: "success",
          message: intl.formatMessage({ id: "admin.group.delete.success" }),
        });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          severity: "error",
          message: formatApiError(intl, error),
        });
      },
    });

  const onConfirmDelete = () => {
    if (!deleteGroup || isDeletePending) return;
    deleteGroupMutate({ groupId: deleteGroup.id });
  };

  const deleteConfirmText = useMemo(() => {
    return intl.formatMessage(
      { id: "admin.group.delete.confirmation" },
      { groupName: deleteGroup?.name ?? "" }
    );
  }, [deleteGroup?.name, intl]);

  if (isForbidden) return <Page404 />;

  if (isLoading) {
    return (
      <Stack gap={2} sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          <FormattedMessage id="admin.title" />
        </Typography>
        <CircularProgress />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack gap={2} sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          <FormattedMessage id="admin.title" />
        </Typography>
        <Typography>
            <FormattedMessage id="admin.error" />
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      <Stack sx={{ py: 4 }} gap={5}>
        <Typography variant="h4" fontWeight={700}>
          <FormattedMessage id="admin.title" />
        </Typography>

        <Stack direction="row" gap={20} justifyContent="space-between">
          <Stack width="100%" gap={1}>
            <Typography variant="h5" fontWeight={600}>
              <FormattedMessage id="admin.groups" />
            </Typography>
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <FormattedMessage id="admin.group.name" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right" width={110}>
                      <FormattedMessage id="common.actions" defaultMessage="Actions" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(groups ?? []).map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.name}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" gap={0.5}>
                          <IconButton
                            aria-label="edit"
                            onClick={() => setPendingGroupId(g.id)}
                            sx={{ color: COLORS.PRIMARY }}
                            size="small"
                            disabled={isPendingGroupLoading && pendingGroupId === g.id}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            aria-label="delete"
                            onClick={() => setDeleteGroup(g)}
                            sx={{ color: COLORS.RED }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack width="100%" gap={1}>
            <Typography variant="h5" fontWeight={600}>
              <FormattedMessage id="admin.users" />
            </Typography>
            <TableContainer component={Box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <FormattedMessage id="admin.user.name" />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <FormattedMessage id="admin.user.email" />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(users ?? []).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{`${u.firstName} ${u.lastName}`.trim()}</TableCell>
                      <TableCell>{u.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </Stack>

      <GroupFormModal
        open={isEditModalOpen}
        onClose={() => setOpenGroupId(null)}
        initGroup={openGroupDetail}
      />

      <Dialog
        open={!!deleteGroup}
        onClose={isDeletePending ? undefined : () => setDeleteGroup(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: COLORS.PRIMARY, fontWeight: 700 }}>
          <FormattedMessage id="admin.group.delete.action" />
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>{deleteConfirmText}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteGroup(null)}
            disabled={isDeletePending}
            color="inherit"
            sx={{ borderRadius: 40 }}
          >
            <FormattedMessage id="common.cancel" defaultMessage="Cancel" />
          </Button>
          <Button
            onClick={onConfirmDelete}
            variant="contained"
            sx={{ bgcolor: COLORS.RED, borderRadius: 40, "&:hover": { bgcolor: COLORS.RED } }}
            disabled={isDeletePending}
          >
            {isDeletePending ? (
              <FormattedMessage id="admin.group.delete.deleting" />
            ) : (
              <FormattedMessage id="admin.group.delete.action" />
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </>
  );
};
