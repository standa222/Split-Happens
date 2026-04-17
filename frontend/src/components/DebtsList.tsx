import {Stack, Typography, Button, StackProps} from "@mui/material";
import {TDebt} from "../types/TDebt";
import {useAuthStore} from "../store/authStore";
import {TUser} from "../types/TUser";
import NotificationsIcon from "@mui/icons-material/Notifications";
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import {COLORS} from "../constants/colors";
import { FormattedMessage } from "react-intl";
import {useSettleDebt} from "../hooks/useSettleDebt";
import {QRPaymentDialog} from "./QRPaymentDialog";
import {useState} from "react";
import {getCurrencySymbol} from "../utils/currencyUtils";

type Props = {
    userDebts: TDebt[],
    user: TUser,
    showActionButtons?: boolean,
    groupId: number,
    /** Group default currency (QR payments are currently supported only for CZK). */
    groupCurrency?: string,
    display?: StackProps["display"],
    showDividers?: boolean,
}

const DebtActionButtons = ({ debt, groupId, groupCurrency }: { debt: TDebt, groupId: number, groupCurrency?: string }) => {
    const {mutate: settleDebt, isPending: isSettleDebtPending} = useSettleDebt();
    const [ qrModalOpen, setQrModalOpen ] = useState(false);

    const onMarkPaid = () => {
        settleDebt({ groupId, debtId: debt.id });
    };

    const onNotify = () => {
        console.log("notify debt", debt.id);
    };

    return (
        <>
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
                    onClick={() => setQrModalOpen(true)}
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
            <QRPaymentDialog
                open={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                debt={debt}
                groupCurrency={groupCurrency}
                onSettle={onMarkPaid}
                isSettlePending={isSettleDebtPending}
            />
        </>
    );
};

export const DebtsList = ({
        userDebts,
        user,
        showActionButtons = false,
        groupId,
        groupCurrency,
        display,
    }: Props) => {
    const currentUserId = useAuthStore((s) => s.currentUser.id);
    const currencySymbol = getCurrencySymbol(groupCurrency);

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
                                    currencySymbol,
                                }}
                            />
                        </Typography>
                        {showActionButtons &&
                            <DebtActionButtons debt={debt} groupId={groupId} groupCurrency={groupCurrency}/>
                        }
                    </Stack>
                );
            })}
        </Stack>
    );
}