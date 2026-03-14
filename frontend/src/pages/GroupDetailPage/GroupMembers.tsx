import {TUser} from "../../types/TUser";
import {TDebt} from "../../types/TDebt";
import {COLORS} from "../../constants/colors";
import {Box, Button, Stack, Typography} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {BalanceDisplay} from "../../components/BalanceDisplay";
import {useAuthStore} from "../../store/authStore";
import {useState} from "react";
import {DebtsList} from "../../components/DebtsList";

type Props = {
    members: TUser[];
    debts: TDebt[];
}

type MemberProps = {
    member: TUser;
    memberDebts: TDebt[];
}

const MemberItem = ({member, memberDebts}: MemberProps) => {
    const userId = useAuthStore((s) => s.currentUser.id);
    const [ showDebts, setShowDebts ] = useState(member.id === userId);
    const balance = memberDebts.reduce((acc, debt) => member.id === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);

    return (
        <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 3}}>
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: `2px dashed ${COLORS.PRIMARY}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <PhotoCameraIcon sx={{ color: COLORS.PRIMARY, fontSize: 24 }} />
                </Box>
                <Stack direction="row" sx={{ width: "100%", pl: 3, alignItems: 'center',}}>
                    <Stack flex={1} gap={3}>
                        <Typography variant="h6" sx={{fontWeight: 600 }}>
                            {member.firstName} {member.lastName} {member.id === userId ? "(You)" : ""}
                        </Typography>
                        <BalanceDisplay variant={"h6"} sx={{ fontWeight: 600 }} balance={balance}/>
                    </Stack>
                {showDebts ? (
                    <Stack flex={1}>
                        <DebtsList userDebts={memberDebts} user={member} showActionButtons={true} />
                    </Stack>
                ) : (
                    <Button
                        onClick={() => setShowDebts(true)}
                        sx={{
                            backgroundColor: COLORS.PRIMARY,
                            color: COLORS.SECONDARY,
                            borderRadius: 10,
                            textTransform: 'none',
                            fontSize: 15,
                            padding: "12px 20px"
                        }}
                    >
                        Show debts
                    </Button>
                )}
                </Stack>
            </Stack>
        </Box>
    )
}

export const GroupMembers = ({members, debts}: Props) => {
    const debtsByMemberId = members.reduce<Record<string, TDebt[]>>((acc, member) => {
        acc[member.id] = debts.filter((d) => d.creditor.id === member.id || d.debtor.id === member.id);
        return acc;
    }, {});

    return (
        <>
            {members.map((member) => (
                <MemberItem
                    key={member.id}
                    member={member}
                    memberDebts={debtsByMemberId[member.id]}
                />
            ))}
        </>
    );
}