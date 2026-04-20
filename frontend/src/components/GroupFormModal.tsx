import {TGroupDetail} from "../types/dto/TGroupDetail";
import {COLORS} from "../constants/colors";
import {Dialog, DialogContent, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {CreateGroupForm} from "./CreateGroupForm";
import { AppSnackbar } from "./AppSnackbar";
import { useIntl } from "react-intl";
import { useState } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    initGroup?: TGroupDetail;
}

export const GroupFormModal = ({ open, onClose, initGroup }: Props) => {
    const intl = useIntl();
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessageId, setSuccessMessageId] = useState<string>("group.create.success");

    const isEditMode = Boolean(initGroup);

    const handleClose = () => {
        onClose();
    };

    const handleSuccessAndClose = () => {
        setSuccessMessageId(isEditMode ? "group.edit.success" : "group.create.success");
        setSuccessOpen(true);
        onClose();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 10,
                    },
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
                >
                    <CloseIcon sx={{ fontSize: 40 }} />
                </IconButton>

                <DialogContent>
                    <CreateGroupForm
                        onClose={handleSuccessAndClose}
                        initGroup={initGroup}
                    />
                </DialogContent>
            </Dialog>

            <AppSnackbar
                open={successOpen}
                onClose={() => setSuccessOpen(false)}
                severity="success"
                message={intl.formatMessage({ id: successMessageId })}
            />
        </>
    )
}