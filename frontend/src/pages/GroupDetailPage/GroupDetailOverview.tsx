import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {useAuthStore} from "../../store/authStore";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {Box, IconButton, Stack, Typography} from "@mui/material";
import {BalanceDisplay} from "../../components/BalanceDisplay";
import SettingsIcon from '@mui/icons-material/Settings';
import {useState} from "react";
import {GroupFormModal} from "../../components/GroupFormModal";
import {BigAddExpenseButton} from "../../components/BigAddExpenseButton";

export const GroupDetailOverview = ({ group }: { group: TGroupDetail }) => {
    const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
    const userId = useAuthStore((s) => s.currentUser.id)
    const userDebts = group.debts.filter((debt) =>
    debt.debtor.id === userId || debt.creditor.id === userId);
    const balance = userDebts.reduce((acc, debt) => userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);

    return (
        <>
            {/* Desktop header */}
            <Stack direction="row" gap={6} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
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
                <IconButton onClick={() => setEditGroupModalOpen(true)}>
                    <SettingsIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
                </IconButton>
            </Stack>

            {/* Mobile header */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    display: { xs: 'flex', md: 'none' },
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
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {group.name}
                    </Typography>
                    <BalanceDisplay variant="body2" balance={balance} />
                </Stack>

                <Stack direction="row" alignItems="center" gap={0.5}>
                    <Stack sx={{ width: 120 }}>
                        <BigAddExpenseButton variant={{ xs: 'body2', sm: 'body2' }} group={group} direction={"row"}/>
                    </Stack>
                    <IconButton onClick={() => setEditGroupModalOpen(true)}>
                        <SettingsIcon sx={{ fontSize: 24, color: COLORS.PRIMARY }} />
                    </IconButton>
                </Stack>
            </Stack>

            <GroupFormModal
                open={editGroupModalOpen}
                onClose={() => setEditGroupModalOpen(false)}
                initGroup={group}
            />
        </>
    )
}