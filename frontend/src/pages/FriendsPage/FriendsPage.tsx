import {
    Badge,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { FormattedMessage, useIntl } from "react-intl";
import { COLORS } from "../../constants/colors";
import { useMemo, useState } from "react";
import { AppSnackbar } from "../../components/AppSnackbar";
import { ImageAvatar } from "../../components/ImageAvatar";
import {useFriendsQuery, useIncomingFriendRequestsQuery} from "../../hooks/useFriends";
import { FriendRequestsModal } from "../../components/FriendRequestsModal";

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
                  <Stack direction="row" alignItems="center" gap={{xs: 2, md: 5}} sx={{ minWidth: 0 }}>
                    <ImageAvatar
                      type="user"
                      id={f.user.id}
                      width={{ xs: 60, md: 110 }}
                      height={{ xs: 60, md: 110 }}
                      shape="circle"
                      iconSize={24}
                    />

                    <Box sx={{ minWidth: 0 }}>
                      {/* Bigger typography without changing your FriendUserOption layout logic too much */}
                      <Typography
                        sx={{
                          typography: { xs: "h6", md: "h5" },
                          fontWeight: 700,
                          lineHeight: 1.1,
                        }}
                      >
                        {`${f.user.firstName ?? ""} ${f.user.lastName ?? ""}`.trim() ||
                          f.user.email}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.25,
                          typography: { xs: "body2", md: "body1" },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: { xs: 190, sm: 320, md: 460 },
                        }}
                      >
                        {f.user.email}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Prepared Detail button (same style as GroupList) */}
                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: { xs: "8px 20px", md: "12px 32px" },
                      fontSize: { xs: 14, md: 20 },
                      borderRadius: 9999,
                      backgroundColor: COLORS.PRIMARY,
                      color: COLORS.SECONDARY,
                      textTransform: "none",
                      fontWeight: 700,
                      flexShrink: 0,
                      opacity: 0.7,
                    }}
                  >
                    <FormattedMessage id="common.detail" defaultMessage="Detail" />
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>

      <FriendRequestsModal
        open={requestsOpen}
        onClose={() => setRequestsOpen(false)}
        onSuccessMessage={(message) =>
          setSnackbar({ open: true, severity: "success", message })
        }
        onErrorMessage={(message) =>
          setSnackbar({ open: true, severity: "error", message })
        }
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
