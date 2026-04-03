import {Stack, Typography, Button, StackProps, Divider} from "@mui/material";
import {TDebt} from "../types/TDebt";
import {useAuthStore} from "../store/authStore";
import {TUser} from "../types/TUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {COLORS} from "../constants/colors";
import { FormattedMessage } from "react-intl";
import {useSettleDebt} from "../hooks/useSettleDebt";

type Props = {
    userDebts: TDebt[],
    user: TUser,
    showActionButtons?: boolean,
    groupId: number,
    display?: StackProps["display"],
    showDividers?: boolean,
}

const DebtActionButtons = ({ debt, groupId }: { debt: TDebt, groupId: number }) => {
    const {mutate: settleDebt, isPending: isSettleDebtPending} = useSettleDebt();

    const onMarkPaid = () => {
        settleDebt({ groupId, debtId: debt.id });
    };

    const onGenerateQr = () => {
        console.log("generate qr", debt.id);
    };

    const onNotify = () => {
        console.log("notify", debt.id);
    };

    return (
        <Stack
            direction="row"
            gap={2}
            alignItems="center"
            width={{xs: "100%", md: "auto"}}
            justifyContent="space-around"
        >
            <Button
                variant="text"
                size="small"
                onClick={onMarkPaid}
                disabled={isSettleDebtPending}
                sx={{
                    minWidth: 0,
                    p: 0,
                    display: "flex",
                    flexDirection: "column",
                    textTransform: "none",
                    color: COLORS.PRIMARY
                }}
            >
                <CheckBoxIcon sx={{ fontSize: { xs: 32, md: 20 } }} />
                <Typography variant="caption">
                    <FormattedMessage id="debts.actions.markPaid" />
                </Typography>
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
                <QrCode2Icon sx={{ fontSize: { xs: 32, md: 20 } }} />
                <Typography variant="caption">
                    <FormattedMessage id="debts.actions.generateQr" />
                </Typography>
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
                <NotificationsIcon sx={{ fontSize: { xs: 32, md: 20 } }} />
                <Typography variant="caption">
                    <FormattedMessage id="debts.actions.notify" />
                </Typography>
            </Button>
        </Stack>
    );
};

export const DebtsList = ({
        userDebts,
        user,
        showActionButtons = false,
        groupId,
        display,
    }: Props) => {
    const currentUserId = useAuthStore((s) => s.currentUser.id);

    if (userDebts.length === 0) {
        const isCurrentUser = user.id === currentUserId;
        const name = `${user.firstName ?? ""}`.trim();
        return (
            <Typography variant="body1" sx={{display}}>
                <FormattedMessage
                    id="debts.settled"
                    values={{ isCurrentUser, name }}
                />
            </Typography>
        );
    }

    return (
        <Stack gap={1} sx={{display}}>
            {userDebts.map(debt => {
                const debtorIsCurrent = debt.debtor.id === currentUserId;
                const creditorIsCurrent = debt.creditor.id === currentUserId;

                const debtorName = (debt.debtor.firstName ?? debt.debtor.email ?? "").trim();
                const creditorName = (debt.creditor.firstName ?? debt.creditor.email ?? "").trim();

                return (
                    <Stack
                        direction={{xs: "column", md: "row"}}
                        alignItems={{xs: "start", md: "center"}}
                        justifyContent={{xs: "space-between", md: "space-between"}}
                        key={debt.id}
                        gap={2}
                    >
                        <Typography variant="body1" color={COLORS.PRIMARY}>
                            <FormattedMessage
                                id="debts.owesLine"
                                values={{
                                    debtorIsCurrent,
                                    creditorIsCurrent,
                                    debtorName,
                                    creditorName,
                                    amount: debt.amount.toFixed(2),
                                }}
                            />
                        </Typography>
                        {showActionButtons &&
                            <DebtActionButtons debt={debt} groupId={groupId}/>
                        }
                    </Stack>
                );
            })}
        </Stack>
    );
}