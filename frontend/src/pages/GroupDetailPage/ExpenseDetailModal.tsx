import {Dialog, DialogContent, IconButton, Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {COLORS} from "../../constants/colors";
import {TTransaction} from "../../types/TTransaction";
import {ExpenseDetailView} from "./ExpenseDetailView";
import {useState} from "react";
import {AddExpenseForm} from "../../components/AddExpenseForm";
import {TGroupDetail} from "../../types/dto/TGroupDetail";

type Props = {
    open: boolean;
    onClose: () => void;
    transaction: TTransaction | null;
    group?: TGroupDetail;
};

export const ExpenseDetailModal = ({ open, onClose, transaction, group }: Props) => {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="lg"
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: COLORS.SECONDARY,
                            borderRadius: 10,
                            pt: 2,
                            border: `5px solid ${COLORS.PRIMARY}`,
                        },
                    },
                }}
            >
                <Stack
                    direction="row"
                    sx={{ position: "absolute", right: 12, top: 12 }}
                    gap={0.5}
                >
                    <IconButton
                        onClick={() => {
                            setEditOpen(true)
                            onClose()
                        }}
                        sx={{ color: COLORS.PRIMARY }}
                        disabled={!transaction}
                    >
                        <EditIcon sx={{ fontSize: 34 }} />
                    </IconButton>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ color: COLORS.PRIMARY }}
                    >
                        <CloseIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                </Stack>

                <DialogContent>
                    <ExpenseDetailView transaction={transaction} />
                </DialogContent>
            </Dialog>

            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                fullWidth
                maxWidth="lg"
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: COLORS.SECONDARY,
                            borderRadius: 10,
                            pt: 2,
                            border: `5px solid ${COLORS.PRIMARY}`,
                        },
                    },
                }}
            >
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
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
