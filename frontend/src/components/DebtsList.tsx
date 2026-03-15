import {Stack, Typography, Button} from "@mui/material";
import {TDebt} from "../types/TDebt";
import {useAuthStore} from "../store/authStore";
import {TUser} from "../types/TUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {COLORS} from "../constants/colors";

type Props = {
    userDebts: TDebt[],
    user: TUser,
    showActionButtons?: boolean,
}

const DebtActionButtons = ({ debt }: { debt: TDebt }) => {
    const onMarkPaid = () => {
        console.log("mark paid", debt.id);
    };

    const onGenerateQr = () => {
        console.log("generate qr", debt.id);
    };

    const onNotify = () => {
        console.log("notify", debt.id);
    };

    return (
        <Stack direction="row" gap={2} alignItems="center">
            <Button
                variant="text"
                size="small"
                onClick={onMarkPaid}
                sx={{
                    minWidth: 0,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    textTransform: "none",
                    color: COLORS.PRIMARY
                }}
            >
                <CheckBoxIcon fontSize="small" />
                <Typography variant="caption">Mark Paid</Typography>
            </Button>

            <Button
                variant="text"
                size="small"
                onClick={onGenerateQr}
                sx={{
                    minWidth: 0,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    textTransform: "none",
                    color: COLORS.PRIMARY
                }}
            >
                <QrCode2Icon fontSize="small" />
                <Typography variant="caption">Generate QR</Typography>
            </Button>

            <Button
                variant="text"
                size="small"
                onClick={onNotify}
                sx={{
                    minWidth: 0,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    textTransform: "none",
                    color: COLORS.PRIMARY
                }}
            >
                <NotificationsIcon fontSize="small" />
                <Typography variant="caption">Notify</Typography>
            </Button>
        </Stack>
    );
};

export const DebtsList = ({
        userDebts,
        user,
        showActionButtons = false,
    }: Props) => {
    const currentUserId = useAuthStore((s) => s.currentUser.id);
    if (userDebts.length === 0) {
        return <Typography variant="body1">{user.id === currentUserId ? "You are" : user.firstName + " is"} You are settled in this group.</Typography>;
    } else {
        return (
            <Stack gap={1}>
                {userDebts.map(debt => (
                    <Stack direction="row" alignItems="center" justifyContent="space-between" key={debt.id}>
                        <Typography variant="body1">
                            {debt.debtor.id === currentUserId ? "You owe" : debt.debtor.firstName + " owes"}{" "}
                            {debt.amount.toFixed(2)} $ to{" "}
                            {debt.creditor.id === currentUserId ? "you" : debt.creditor.firstName}
                        </Typography>
                        {showActionButtons &&
                            <DebtActionButtons debt={debt} />
                        }
                    </Stack>
                ))}
            </Stack>
        )
    }
}