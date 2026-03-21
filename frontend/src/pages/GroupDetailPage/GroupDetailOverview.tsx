import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {useAuthStore} from "../../store/authStore";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {Box, IconButton, Stack, Typography} from "@mui/material";
import {BalanceDisplay} from "../../components/BalanceDisplay";
import SettingsIcon from '@mui/icons-material/Settings';
import {useState} from "react";
import {GroupFormModal} from "../../components/GroupFormModal";

export const GroupDetailOverview = ({ group }: { group: TGroupDetail }) => {
    const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
    const userId = useAuthStore((s) => s.currentUser.id)
    const userDebts = group.debts.filter((debt) =>
    debt.debtor.id === userId || debt.creditor.id === userId);
    const balance = userDebts.reduce((acc, debt) => userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);

    return (
        <>
            <Stack direction="row" gap={6} alignItems="center">
                <Box
                    sx={{
                        minWidth: 296,
                        minHeight: 140,
                        border: `2px dashed ${COLORS.PRIMARY}`,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <PhotoCameraIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
                </Box>
                <Stack gap={2} flexGrow={1}>
                    <Typography variant="h5" fontWeight={600}>{group.name}</Typography>
                    <BalanceDisplay variant="h6" balance={balance} />
                </Stack>
                <IconButton
                    onClick={() => setEditGroupModalOpen(true)}
                >
                    <SettingsIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
                </IconButton>
            </Stack>
            <GroupFormModal
                open={editGroupModalOpen}
                onClose={() => setEditGroupModalOpen(false)}
                initGroup={group}
            />
        </>
    )
}