import {TUser} from "../../types/TUser";
import {TDebt} from "../../types/TDebt";
import {COLORS} from "../../constants/colors";
import {
    Box,
    Button,
    Stack,
    Typography,
    Dialog,
    DialogContent,
    IconButton,
    Divider,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {BalanceDisplay} from "../../components/BalanceDisplay";
import {useAuthStore} from "../../store/authStore";
import {useState} from "react";
import {DebtsList} from "../../components/DebtsList";
import { FormattedMessage } from "react-intl";
import {TGroupDetail} from "../../types/dto/TGroupDetail";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from '@mui/icons-material/Close';

type Props = {
    group: TGroupDetail;
}

type MemberProps = {
    member: TUser;
    memberDebts: TDebt[];
    groupId: number;
    defaultCurrency: string;
}

const MemberItem = ({member, memberDebts, groupId, defaultCurrency}: MemberProps) => {
    const userId = useAuthStore((s) => s.currentUser.id);
    const [ showDebts, setShowDebts ] = useState(member.id === userId);
    const balance = memberDebts.reduce((acc, debt) => member.id === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);

    const memberFullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();

    return (
        <>
            <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
                <Stack direction="row" gap={{ md: 2, xs: 0.5 }} alignItems="center" sx={{ px: {md: 3, xs: 1} }}>
                    <Box
                        sx={{
                            width: {xs: 60, md: 120},
                            height: {xs: 60, md: 120},
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
                        <Stack flex={1} gap={{md: 3, xs: 1}}>
                            <Typography variant="h6" sx={{
                                typography: {
                                    xs: 'body1',
                                    md: 'h6',
                                },
                                fontWeight: {
                                    xs: 600,
                                    md: 600,
                                },
                            }}>
                                {member.firstName} {member.lastName} {member.id === userId ? (<FormattedMessage id="groupDetail.members.you" />) : ""}
                            </Typography>
                            <BalanceDisplay
                                sx={{
                                    typography: {
                                        xs: 'body2',
                                        md: 'h6',
                                    },
                                    fontWeight: {
                                        xs: 500,
                                        md: 600,
                                    },
                                }}
                                balance={balance}
                            />
                        </Stack>
                        {showDebts ? (
                            <Stack flex={1} sx={{ display: { xs: "none", md: "block" } }}>
                                <DebtsList userDebts={memberDebts} user={member} showActionButtons={true} groupId={groupId} groupCurrency={defaultCurrency} />
                            </Stack>
                        ) : (
                            <Button
                                onClick={() => setShowDebts(true)}
                                sx={{
                                    backgroundColor: COLORS.PRIMARY,
                                    color: COLORS.SECONDARY,
                                    width: { xs: 30, md: "auto" },
                                    height: { xs: 30, md: "auto" },
                                    minWidth: { xs: 30, md: "auto" },
                                    borderRadius: { xs: "50%", md: 10 },
                                    textTransform: 'none',
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: "none", md: "inline" }, mx: 1 }}>
                                    <FormattedMessage id="groupDetail.members.showDebts" />
                                </Box>
                                <MoreHorizIcon sx={{ display: { xs: "block", md: "none" } }} />
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>

            {/* Mobile-only modal for debts */}
            <Dialog
                open={showDebts}
                onClose={() => setShowDebts(false)}
                fullWidth
                maxWidth="xs"
                sx={{ display: { xs: 'block', md: 'none' } }}
            >
                <DialogContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
                        <Stack gap={0.5} minWidth={0}>
                            <Typography variant="h6" fontWeight={800} color={COLORS.PRIMARY} noWrap>
                                {memberFullName}
                            </Typography>
                            <BalanceDisplay variant="body2" balance={balance} />
                        </Stack>
                        <IconButton onClick={() => setShowDebts(false)} sx={{ mt: -0.5, mr: -0.5 }}>
                            <CloseIcon sx={{color: COLORS.PRIMARY}} />
                        </IconButton>
                    </Stack>

                    <Divider sx={{ my: 2, color: COLORS.PRIMARY }} />

                    <DebtsList
                        userDebts={memberDebts}
                        user={member}
                        showActionButtons={true}
                        groupId={groupId}
                        groupCurrency={defaultCurrency}
                        showDividers={true}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

export const GroupMembers = ({group}: Props) => {
    const debtsByMemberId = group.members.reduce<Record<string, TDebt[]>>((acc, member) => {
        acc[member.id] = group.debts.filter((d) => d.creditor.id === member.id || d.debtor.id === member.id);
        return acc;
    }, {});

    return (
        <>
            {group.members.map((member) => (
                <MemberItem
                    key={member.id}
                    member={member}
                    memberDebts={debtsByMemberId[member.id]}
                    groupId={group.id}
                    defaultCurrency={group.defaultCurrency}
                />
            ))}
        </>
    );
}