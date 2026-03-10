import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {useAuthStore} from "../../store/authStore";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {Box, Stack, Typography} from "@mui/material";
import {BalanceDisplay} from "../../components/BalanceDisplay";

export const GroupDetailOverview = ({ group }: { group: TGroupDetail }) => {
    const userId = useAuthStore.getState().currentUser.id;
    console.log(group);
    const userDebts = group.debts.filter((debt) =>
    debt.debtor.id === userId || debt.creditor.id === userId);
    const balance = userDebts.reduce((acc, debt) => acc + debt.amount, 0);

    return (
        <Stack direction="row" gap={4} alignItems="center">
            <Box
                sx={{
                    width: '100%',
                    flex: 1,
                    border: `2px dashed ${COLORS.PRIMARY}`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <PhotoCameraIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
            </Box>
            <Stack gap={2}>
                <Typography>{group.name}</Typography>
                <BalanceDisplay balance={balance} />
            </Stack>
        </Stack>
    )
}