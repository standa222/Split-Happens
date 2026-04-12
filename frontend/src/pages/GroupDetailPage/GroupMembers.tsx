import {TUser} from "../../types/TUser";
import {TDebt} from "../../types/TDebt";
import {COLORS} from "../../constants/colors";
import {
    Box,
    Button,
    Stack,
    Typography,
    IconButton,
    Divider,
    SwipeableDrawer,
    useMediaQuery,
    useTheme
} from "@mui/material";
import {ImageAvatar} from "../../components/ImageAvatar";
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
    const isCurrentUser = member.id === userId;

    // Default to false so the button shows on mobile for everyone
    const [ showDebts, setShowDebts ] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const balance = memberDebts.reduce((acc, debt) => member.id === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);
    const memberFullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();

    return (
        <>
            <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
                <Stack direction="row" gap={{ md: 2, xs: 0.5 }} alignItems="center" sx={{ px: {md: 3, xs: 1} }}>
                    <ImageAvatar type="user" id={member.id} />
                    <Stack direction="row" sx={{ width: "100%", pl: 3, alignItems: 'center',}}>
                        <Stack flex={1} gap={{md: 3, xs: 1}}>
                            <Typography variant="h6" sx={{
                                typography: { xs: 'body1', md: 'h6' },
                                fontWeight: 600,
                            }}>
                                {member.firstName} {member.lastName} {isCurrentUser ? (<FormattedMessage id="groupDetail.members.you" />) : ""}
                            </Typography>
                            <BalanceDisplay
                                sx={{
                                    typography: { xs: 'body2', md: 'h6' },
                                    fontWeight: { xs: 500, md: 600 },
                                }}
                                balance={balance}
                                currency={defaultCurrency}
                            />
                        </Stack>

                        {/* Desktop: Always show for current user. Mobile: Always hide this container */}
                        {isCurrentUser && (
                            <Stack flex={1} sx={{ display: { xs: "none", md: "block" } }}>
                                <DebtsList
                                    userDebts={memberDebts}
                                    user={member}
                                    showActionButtons={true}
                                    groupId={groupId}
                                    groupCurrency={defaultCurrency}
                                />
                            </Stack>
                        )}

                        {/* Desktop: Show list if toggled. Mobile: Always hide this container */}
                        {!isCurrentUser && showDebts && (
                            <Stack flex={1} sx={{ display: { xs: "none", md: "block" } }}>
                                <DebtsList
                                    userDebts={memberDebts}
                                    user={member}
                                    showActionButtons={true}
                                    groupId={groupId}
                                    groupCurrency={defaultCurrency}
                                />
                            </Stack>
                        )}

                        {/* Show button if:
                           1. It's mobile (isMobile)
                           2. OR it's a different user and debts aren't toggled yet
                        */}
                        {(isMobile || (!isCurrentUser && !showDebts)) && (
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
                                    // Hide the button on desktop if it's the current user
                                    display: isCurrentUser ? { xs: 'flex', md: 'none' } : 'flex'
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

            {isMobile && (
                <SwipeableDrawer
                    anchor="bottom"
                    open={showDebts}
                    onClose={() => setShowDebts(false)}
                    onOpen={() => setShowDebts(true)}
                    slotProps={{
                        paper: {
                            sx: {
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                maxHeight: '80vh',
                                backgroundColor: COLORS.SECONDARY,
                                color: COLORS.PRIMARY,
                            }
                        }
                    }}
                >
                    <Box sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
                            <Stack gap={0.5} minWidth={0}>
                                <Typography variant="h6" fontWeight={800} color={COLORS.PRIMARY} noWrap>
                                    {memberFullName}
                                </Typography>
                                <BalanceDisplay variant="body2" balance={balance} currency={defaultCurrency} />
                            </Stack>
                            <IconButton onClick={() => setShowDebts(false)} sx={{ mt: -0.5, mr: -0.5 }}>
                                <CloseIcon sx={{color: COLORS.PRIMARY}} />
                            </IconButton>
                        </Stack>

                        <Divider sx={{ my: 2, borderColor: COLORS.PRIMARY }} />

                        <DebtsList
                            userDebts={memberDebts}
                            user={member}
                            showActionButtons={true}
                            groupId={groupId}
                            groupCurrency={defaultCurrency}
                            showDividers={true}
                        />
                    </Box>
                </SwipeableDrawer>
            )}
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