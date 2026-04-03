import {TGroupDetail} from "../types/dto/TGroupDetail";
import {COLORS} from "../constants/colors";
import {Dialog, DialogContent, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {CreateGroupForm} from "./CreateGroupForm";

type Props = {
    open: boolean;
    onClose: () => void;
    initGroup?: TGroupDetail;
}

export const GroupFormModal = ({ open, onClose, initGroup }: Props) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: { xs: 0, md: 10 },
                },
            }}
        >
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
            >
                <CloseIcon sx={{ fontSize: 40 }} />
            </IconButton>

            <DialogContent>
                <CreateGroupForm
                    onClose={onClose}
                    initGroup={initGroup}
                />
            </DialogContent>
        </Dialog>
    )
}