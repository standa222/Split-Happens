import { Badge, Box, Button, IconButton, Stack, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { FormattedMessage, useIntl } from "react-intl";
import { COLORS } from "../../constants/colors";
import { useMemo, useState } from "react";
import { AppSnackbar } from "../../components/AppSnackbar";
import { ImageAvatar } from "../../components/ImageAvatar";
import {
  useFriendsQuery,
  useIncomingFriendRequestsQuery,
  useRemoveFriendMutation,
} from "../../hooks/useFriends";
import { FriendRequestsModal } from "../../components/FriendRequestsModal";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../enums/routes";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

export const FriendsPage = () => {
  const intl = useIntl();
  const incoming = useIncomingFriendRequestsQuery();
  const incomingCount = incoming.data?.length ?? 0;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [requestsOpen, setRequestsOpen] = useState(false);

  const friends = useFriendsQuery();
  const friendsList = useMemo(() => friends.data ?? [], [friends.data]);
  const { mutate: remove } = useRemoveFriendMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        severity: "success",
        message: intl.formatMessage({
          id: "friends.remove.success",
          defaultMessage: "Friend removed successfully.",
        }),
      });
    },
  });

  return (
    <Box width="100%" sx={{ py: 2, color: COLORS.PRIMARY }}>
      <Stack spacing={2.5}>
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: "left", mt: 1 }}>
            <FormattedMessage id="friends.title" defaultMessage="Friends" />
          </Typography>

          <IconButton
            aria-label={intl.formatMessage({
              id: "friends.requests.manageAria",
              defaultMessage: "Manage friend requests",
            })}
            onClick={() => setRequestsOpen(true)}
            sx={{
              color: COLORS.PRIMARY,
              mt: 1,
            }}
          >
            <Badge
              badgeContent={incomingCount}
              color="error"
              invisible={incomingCount === 0}
              overlap="circular"
            >
              <PersonAddIcon sx={{ fontSize: 40 }} />
            </Badge>
          </IconButton>
        </Stack>

        {/* Friends list (main content) */}
        <Stack>
          {friends.isLoading ? (
            <Typography>
              <FormattedMessage id="friends.list.loading" defaultMessage="Loading..." />
            </Typography>
          ) : friends.isError ? (
            <Typography color="error">
              <FormattedMessage id="friends.list.error" defaultMessage="Failed to load friends." />
            </Typography>
          ) : friendsList.length === 0 ? (
            <Typography>
              <FormattedMessage
                id="friends.list.empty"
                defaultMessage="You don’t have any friends yet."
              />
            </Typography>
          ) : (
            <Stack>
              {friendsList.map((f, idx) => (
                <Stack
                  key={`${f.user?.id ?? "friend"}-${idx}`}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={2}
                  sx={{
                    py: { md: 3, xs: 2 },
                    borderTop: `2px solid ${COLORS.PRIMARY}`,
                    px: { md: 3, xs: 1 },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={{ xs: 2, md: 5 }}
                    sx={{ minWidth: 0 }}
                    flex={1}
                  >
                    <ImageAvatar
                      type="user"
                      id={f.user.id}
                      width={{ xs: 60, md: 110 }}
                      height={{ xs: 60, md: 110 }}
                      shape="circle"
                      iconSize={24}
                    />
                    <Stack sx={{ minWidth: 0 }} gap={1}>
                      <Typography
                        sx={{
                          typography: { xs: "h6", md: "h5" },
                          fontWeight: 700,
                        }}
                      >
                        {`${f.user.firstName ?? ""} ${f.user.lastName ?? ""}`.trim() ||
                          f.user.email}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          typography: { xs: "body2", md: "body1" },
                        }}
                      >
                        {f.user.email}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    component={NavLink}
                    to={ROUTES.FRIENDS.detail(f.friendGroupId)}
                    sx={{
                      padding: { xs: "8px 10px", md: "12px 32px" },
                      fontSize: { xs: 14, md: 20 },
                      lineHeight: 1.2,
                      borderRadius: 9999,
                      backgroundColor: COLORS.PRIMARY,
                      color: COLORS.SECONDARY,
                      textTransform: "none",
                    }}
                  >
                    <FormattedMessage id="common.detail" defaultMessage="Detail" />
                  </Button>
                  <IconButton
                    onClick={() => remove(f.user.id)}
                    sx={{
                      color: COLORS.RED,
                    }}
                  >
                    <PersonRemoveIcon
                      sx={{ width: { xs: 20, md: 40 }, height: { xs: 20, md: 40 } }}
                    />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>

      <FriendRequestsModal
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
        onSuccessMessage={(message) => setSnackbar({ open: true, severity: "success", message })}
        onErrorMessage={(message) => setSnackbar({ open: true, severity: "error", message })}
      />

      <AppSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
};
