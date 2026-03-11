import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {useAuthStore} from "../../store/authStore";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {Box, IconButton, Stack, Typography} from "@mui/material";
import {BalanceDisplay} from "../../components/BalanceDisplay";
import SettingsIcon from '@mui/icons-material/Settings';

export const GroupDetailOverview = ({ group }: { group: TGroupDetail }) => {
    const userId = useAuthStore.getState().currentUser.id;
    console.log(group);
    const userDebts = group.debts.filter((debt) =>
    debt.debtor.id === userId || debt.creditor.id === userId);
    const balance = userDebts.reduce((acc, debt) => acc + debt.amount, 0);

    return (
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
                onClick={() => {
                    // TODO - open settings modal or something like that
                    console.log("Group settings clicked");
                }}
            >
                <SettingsIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
            </IconButton>
        </Stack>
    )
}