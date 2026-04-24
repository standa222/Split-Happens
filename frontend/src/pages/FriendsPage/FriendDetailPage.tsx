import { Box, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { FormattedMessage } from "react-intl";
import {
  Button,
  Divider,
  IconButton,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

import { COLORS } from "../../constants/colors";
import { useGroupDetail } from "../../hooks/useGroupsQuery";
import { useAuthStore } from "../../store/authStore";
import { AddExpenseButton } from "../../components/AddExpenseButton";
import { DebtsList } from "../../components/DebtsList";
import { GroupExpenses } from "../GroupDetailPage/GroupExpenses";
import { ImageAvatar } from "../../components/ImageAvatar";
import type { TGroupDetail } from "../../types/dto/TGroupDetail";

const FriendOverview = ({ group }: { group: TGroupDetail }) => {
  const currentUserId = useAuthStore((s) => s.currentUser.id);
  const [showDebts, setShowDebts] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const me = group.members.find((m) => m.id === currentUserId);
  const friend = group.members.find((m) => m.id !== currentUserId);

  const myDebts = group.debts;

  const friendName = friend
    ? `${friend.firstName ?? ""} ${friend.lastName ?? ""}`.trim() || friend.email
    : "";

  return (
    <Stack
      alignItems="flex-start"
      justifyContent="space-between"
      gap={{ xs: 2, md: 2 }}
    >
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
        >
          <Stack direction="row" alignItems="center" gap={2}>
            {friend ? (
              <ImageAvatar
                type="user"
                id={friend.id}
                width={{ xs: 64, md: 90 }}
                height={{ xs: 64, md: 90 }}
                shape="circle"
                iconSize={28}
              />
            ) : null}

            <Stack gap={0.25} minWidth={0}>
              <Typography
                variant="h5"
                sx={{
                  color: COLORS.PRIMARY,
                  fontWeight: 700,
                }}
              >
                {friendName}
              </Typography>

              {/* Optional helper line */}
              <Typography variant="body2" sx={{ color: COLORS.PRIMARY }}>
                <FormattedMessage id="friends.detail.subtitle" defaultMessage="Friend balance" />
              </Typography>
            </Stack>
          </Stack>
            {/* Desktop: show debts inline. Mobile: show behind a drawer. */}
            {!isMobile && (
                <DebtsList
                    userDebts={myDebts}
                    user={me}
                    groupId={group.id}
                    groupCurrency={group.defaultCurrency}
                    showActionButtons={true}
                />
            )}

            {isMobile && (
                <>
                    <Button
                        onClick={() => setShowDebts(true)}
                        sx={{
                            backgroundColor: COLORS.PRIMARY,
                            color: COLORS.SECONDARY,
                            width: 30,
                            height: 30,
                            minWidth: 30,
                            borderRadius: "50%",
                            textTransform: "none",
                        }}
                    >
                        <MoreHorizIcon />
                    </Button>

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
                                    maxHeight: "80vh",
                                    border: `4px solid ${COLORS.PRIMARY}`,
                                    borderBottom: "none",
                                    backgroundColor: COLORS.SECONDARY,
                                    color: COLORS.PRIMARY,
                                },
                            },
                        }}
                    >
                        <Box sx={{ p: 3 }}>
                            <Stack
                                direction="row"
                                alignItems="flex-start"
                                justifyContent="space-between"
                                gap={2}
                            >
                                <Stack gap={0.5} minWidth={0}>
                                    <Typography variant="h6" fontWeight={800} color={COLORS.PRIMARY} noWrap>
                                        {friendName}
                                    </Typography>
                                </Stack>
                                <IconButton
                                    onClick={() => setShowDebts(false)}
                                    sx={{ mt: -0.5, mr: -0.5 }}
                                >
                                    <CloseIcon sx={{ color: COLORS.PRIMARY }} />
                                </IconButton>
                            </Stack>

                            <Divider sx={{ my: 2, borderColor: COLORS.PRIMARY }} />

                            <DebtsList
                                userDebts={myDebts}
                                user={me}
                                groupId={group.id}
                                groupCurrency={group.defaultCurrency}
                                showActionButtons={true}
                                showDividers={true}
                            />
                        </Box>
                    </SwipeableDrawer>
                </>
            )}
        </Stack>

      <Stack gap={1.5} width={{ xs: "100%", md: "auto" }}>
          <AddExpenseButton
            variant={{ xs: "body1", md: "h6" }}
            group={group}
            direction="row"
            size={{ xs: "small", md: "small" }}
          />
      </Stack>
    </Stack>
  );
};

export const FriendDetailPage = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const groupId = friendId ? Number(friendId) : NaN;

  const { data: group, isLoading, isError } = useGroupDetail(Number.isFinite(groupId) ? groupId : 0);

  if (isLoading) {
    return (
      <Typography sx={{ color: COLORS.PRIMARY }}>
        <FormattedMessage id="friends.detail.loading" defaultMessage="Loading..." />
      </Typography>
    );
  }

  if (isError || !group) {
    return (
      <Typography sx={{ color: COLORS.PRIMARY }}>
        <FormattedMessage id="friends.detail.error" defaultMessage="Failed to load friend detail." />
      </Typography>
    );
  }

  return (
    <Box mt={{ xs: 2, md: 4 }} width="100%">
      <FriendOverview group={group} />

      <Box mt={{ xs: 2, md: 3 }}>
        {/* Reuse the exact same expenses component. For FRIEND groups there are always 2 members, so this should stay simple. */}
        <GroupExpenses transactions={group.transactions} group={group} />
      </Box>
    </Box>
  );
};
