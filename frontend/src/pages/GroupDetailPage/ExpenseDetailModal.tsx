import { Dialog, DialogContent, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { COLORS } from "../../constants/colors";
import { TTransaction } from "../../types/TTransaction";
import { ExpenseDetailView } from "./ExpenseDetailView";
import { useState } from "react";
import { AddExpenseForm } from "../../components/AddExpenseForm";
import { TGroupDetail } from "../../types/dto/TGroupDetail";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, DialogActions, DialogTitle, Typography } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { AppSnackbar } from "../../components/AppSnackbar";
import { useDeleteExpense } from "../../hooks/useDeleteExpense";

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: TTransaction | null;
  group?: TGroupDetail;
};

export const ExpenseDetailModal = ({ open, onClose, transaction, group }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessageId, setSuccessMessageId] = useState<string>("expense.edit.success");
  const intl = useIntl();

  const { mutate: deleteMutate, isPending: isDeletePending } = useDeleteExpense({
    onSuccess: () => {
      setDeleteOpen(false);
      onClose();
    },
  });

  const handleConfirmDelete = () => {
    if (!transaction || !group?.id) return;
    deleteMutate({ transactionId: transaction.id, groupId: group.id });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <Stack direction="row" sx={{ position: "absolute", right: 12, top: 12 }} gap={0.5}>
          <IconButton
            onClick={() => {
              setEditOpen(true);
              onClose();
            }}
            sx={{ color: COLORS.PRIMARY }}
            disabled={!transaction}
          >
            <EditIcon sx={{ fontSize: { xs: 20, md: 34 } }} />
          </IconButton>
          <IconButton
            aria-label="delete"
            onClick={() => setDeleteOpen(true)}
            sx={{ color: COLORS.RED }}
            disabled={!transaction || !group?.id}
          >
            <DeleteIcon sx={{ fontSize: { xs: 20, md: 34 } }} />
          </IconButton>
          <IconButton aria-label="close" onClick={onClose} sx={{ color: COLORS.PRIMARY }}>
            <CloseIcon sx={{ fontSize: { xs: 25, md: 40 } }} />
          </IconButton>
        </Stack>

        <DialogContent>
          <ExpenseDetailView transaction={transaction} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <IconButton
          aria-label="close"
          onClick={() => setEditOpen(false)}
          sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
        >
          <CloseIcon sx={{ fontSize: 40 }} />
        </IconButton>

        <DialogContent>
          {transaction && (
            <AddExpenseForm
              initGroup={group}
              initTransaction={transaction}
              onClose={() => setEditOpen(false)}
              onSuccess={(mode) => {
                setSuccessMessageId(
                  mode === "edit" ? "expense.edit.success" : "expense.add.success"
                );
                setSuccessOpen(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AppSnackbar
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        severity={"success"}
        message={intl.formatMessage({ id: successMessageId, defaultMessage: successMessageId })}
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ color: COLORS.PRIMARY, fontWeight: 700 }}>
          <FormattedMessage id="expense.delete.title" defaultMessage="Delete expense?" />
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            <FormattedMessage
              id="expense.delete.confirm"
              defaultMessage="Are you sure you want to delete this expense? This action can’t be undone."
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={isDeletePending}
            sx={{ color: COLORS.PRIMARY }}
          >
            <FormattedMessage id="common.cancel" defaultMessage="Cancel" />
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={!transaction || !group?.id || isDeletePending}
            sx={{ backgroundColor: COLORS.RED, borderRadius: 40 }}
          >
            <FormattedMessage
              id={isDeletePending ? "expense.delete.deleting" : "expense.delete.action"}
              defaultMessage={isDeletePending ? "Deleting..." : "Delete"}
            />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
