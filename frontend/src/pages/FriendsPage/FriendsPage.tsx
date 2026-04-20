import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { COLORS } from "../../constants/colors";
import { useMemo, useState } from "react";
import type { TUser } from "../../types/TUser";
import { useUsersSearchQuery } from "../../hooks/useUsersSearchQuery";
import {
  useAcceptFriendRequestMutation,
  useCreateFriendRequestMutation,
  useFriendsQuery,
  useIncomingFriendRequestsQuery,
  useOutgoingFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from "../../hooks/useFriends";
import { AppSnackbar } from "../../components/AppSnackbar";
import { formatApiError } from "../../utils/apiErrorUtils";
import { ImageAvatar } from "../../components/ImageAvatar";
import { FriendUserOption } from "../../components/FriendUserOption";

export const FriendsPage = () => {
  const intl = useIntl();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);

  const { data: userOptions = [], isFetching: usersLoading } = useUsersSearchQuery({
    query: searchTerm,
    limit: 20,
  });

  const incoming = useIncomingFriendRequestsQuery();
  const outgoing = useOutgoingFriendRequestsQuery();
  const friends = useFriendsQuery();

  const sendRequest = useCreateFriendRequestMutation({
    onSuccess: () => {
      setSelectedUser(null);
      setSearchTerm("");
      setSnackbar({
        open: true,
        severity: "success",
        message: intl.formatMessage({
          id: "friends.request.sent",
          defaultMessage: "Friend request sent.",
        }),
      });
    },
  });

  const accept = useAcceptFriendRequestMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        severity: "success",
        message: intl.formatMessage({
          id: "friends.request.accepted",
          defaultMessage: "Friend request accepted.",
        }),
      });
    },
  });

  const reject = useRejectFriendRequestMutation({
    onSuccess: () => {
      setSnackbar({
        open: true,
        severity: "success",
        message: intl.formatMessage({
          id: "friends.request.rejected",
          defaultMessage: "Friend request rejected.",
        }),
      });
    },
  });

  const isAnyPending =
    sendRequest.isPending || accept.isPending || reject.isPending;

  const disableSend = !selectedUser || isAnyPending;

  const incomingList = useMemo(() => incoming.data ?? [], [incoming.data]);
  const outgoingList = useMemo(() => outgoing.data ?? [], [outgoing.data]);
  const friendsList = useMemo(() => friends.data ?? [], [friends.data]);

  return (
    <Box width="100%" sx={{ py: 2 }}>
      <Stack spacing={2.5}>
        <Typography
          variant="h4"
          sx={{
            color: COLORS.PRIMARY,
            fontWeight: 700,
            textAlign: { xs: "left", md: "center" },
            mt: 1,
          }}
        >
          <FormattedMessage id="friends.title" defaultMessage="Friends" />
        </Typography>

        {/* Add friend */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            backgroundColor: "transparent",
            border: `1px solid rgba(0,0,0,0.08)`,
          }}
        >
          <Stack spacing={1.5}>
            <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 700 }}>
              <FormattedMessage
                id="friends.add.title"
                defaultMessage="Add friend"
              />
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={1.5}
              alignItems={{ md: "center" }}
            >
              <Autocomplete
                fullWidth
                options={userOptions}
                loading={usersLoading}
                value={selectedUser}
                onChange={(_, v) => setSelectedUser(v)}
                onInputChange={(_, value) => setSearchTerm(value)}
                getOptionLabel={(u) =>
                  `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email
                }
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderOption={(props, option) => (
                  <li {...props}>
                    <FriendUserOption option={option} />
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={
                      <FormattedMessage
                        id="friends.add.search.label"
                        defaultMessage="Search users"
                      />
                    }
                    placeholder={intl.formatMessage({
                      id: "friends.add.search.placeholder",
                      defaultMessage: "Type at least 2 characters...",
                    })}
                    size="small"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {usersLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />

              <Button
                variant="contained"
                disabled={disableSend}
                onClick={() => {
                  if (!selectedUser) return;
                  sendRequest.mutate(
                    { receiverUserId: selectedUser.id },
                    {
                      onError: (e) => {
                        setSnackbar({
                          open: true,
                          severity: "error",
                          message: formatApiError(intl, e),
                        });
                      },
                    }
                  );
                }}
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  backgroundColor: COLORS.PRIMARY,
                  color: COLORS.SECONDARY,
                  px: 3,
                  minWidth: { xs: "100%", md: 180 },
                }}
              >
                {sendRequest.isPending ? (
                  <FormattedMessage
                    id="friends.add.sending"
                    defaultMessage="Sending..."
                  />
                ) : (
                  <FormattedMessage
                    id="friends.add.send"
                    defaultMessage="Send request"
                  />
                )}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              <FormattedMessage
                id="friends.add.hint"
                defaultMessage="Search by name or email."
              />
            </Typography>
          </Stack>
        </Paper>

        <Divider sx={{ borderColor: COLORS.PRIMARY, opacity: 0.15 }} />

        {/* Incoming requests */}
        <Stack spacing={1.5}>
          <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 700 }}>
            <FormattedMessage
              id="friends.incoming.title"
              defaultMessage="Incoming requests"
            />
          </Typography>

          {incoming.isLoading ? (
            <Typography color="text.secondary">
              <FormattedMessage
                id="friends.incoming.loading"
                defaultMessage="Loading..."
              />
            </Typography>
          ) : incoming.isError ? (
            <Typography color="error">
              <FormattedMessage
                id="friends.incoming.error"
                defaultMessage="Failed to load incoming requests."
              />
            </Typography>
          ) : incomingList.length === 0 ? (
            <Typography color="text.secondary">
              <FormattedMessage
                id="friends.incoming.empty"
                defaultMessage="No incoming requests."
              />
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {incomingList.map((r) => (
                <Paper
                  key={r.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 4,
                    backgroundColor: "transparent",
                    border: `1px solid rgba(0,0,0,0.08)`,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    gap={1.5}
                  >
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <ImageAvatar
                        type="user"
                        id={r.sender.id}
                        width={44}
                        height={44}
                        shape="circle"
                        iconSize={18}
                      />
                      <FriendUserOption option={r.sender} />
                    </Stack>

                    <Stack direction="row" gap={1} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        disabled={isAnyPending}
                        onClick={() =>
                          reject.mutate(
                            { requestId: r.id },
                            {
                              onError: (e) =>
                                setSnackbar({
                                  open: true,
                                  severity: "error",
                                  message: formatApiError(intl, e),
                                }),
                            }
                          )
                        }
                        sx={{
                          borderRadius: 999,
                          textTransform: "none",
                          fontWeight: 700,
                          borderColor: COLORS.PRIMARY,
                          color: COLORS.PRIMARY,
                        }}
                      >
                        <FormattedMessage
                          id="friends.request.reject"
                          defaultMessage="Reject"
                        />
                      </Button>

                      <Button
                        variant="contained"
                        disabled={isAnyPending}
                        onClick={() =>
                          accept.mutate(
                            { requestId: r.id },
                            {
                              onError: (e) =>
                                setSnackbar({
                                  open: true,
                                  severity: "error",
                                  message: formatApiError(intl, e),
                                }),
                            }
                          )
                        }
                        sx={{
                          borderRadius: 999,
                          textTransform: "none",
                          fontWeight: 700,
                          backgroundColor: COLORS.PRIMARY,
                          color: COLORS.SECONDARY,
                        }}
                      >
                        <FormattedMessage
                          id="friends.request.accept"
                          defaultMessage="Accept"
                        />
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>

        {/* Outgoing requests */}
        <Stack spacing={1.5}>
          <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 700 }}>
            <FormattedMessage
              id="friends.outgoing.title"
              defaultMessage="Outgoing requests"
            />
          </Typography>

          {outgoing.isLoading ? (
            <Typography color="text.secondary">
              <FormattedMessage
                id="friends.outgoing.loading"
                defaultMessage="Loading..."
              />
            </Typography>
          ) : outgoing.isError ? (
            <Typography color="error">
              <FormattedMessage
                id="friends.outgoing.error"
                defaultMessage="Failed to load outgoing requests."
              />
            </Typography>
          ) : outgoingList.length === 0 ? (
            <Typography color="text.secondary">
              <FormattedMessage
                id="friends.outgoing.empty"
                defaultMessage="No outgoing requests."
              />
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {outgoingList.map((r) => (
                <Paper
                  key={r.id}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 4,
                    backgroundColor: "transparent",
                    border: `1px solid rgba(0,0,0,0.08)`,
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <ImageAvatar
                      type="user"
                      id={r.receiver.id}
                      width={44}
                      height={44}
                      shape="circle"
                      iconSize={18}
                    />
                    <Stack sx={{ flex: 1 }}>
                      <FriendUserOption option={r.receiver} />
                      <Typography variant="caption" color="text.secondary">
                        <FormattedMessage
                          id="friends.outgoing.pending"
                          defaultMessage="Pending"
                        />
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>

        {/* Friends */}
        <Stack spacing={1.5}>
          <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 700 }}>
            <FormattedMessage id="friends.list.title" defaultMessage="Your friends" />
          </Typography>

          {friends.isLoading ? (
            <Typography color="text.secondary">
              <FormattedMessage
                id="friends.list.loading"
                defaultMessage="Loading..."
              />
            </Typography>
          ) : friends.isError ? (
            <Typography color="error">
              <FormattedMessage
                id="friends.list.error"
                defaultMessage="Failed to load friends."
              />
            </Typography>
          ) : friendsList.length === 0 ? (
            <Typography color="text.secondary">
              <FormattedMessage
                id="friends.list.empty"
                defaultMessage="You don’t have any friends yet."
              />
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {friendsList.map((f, idx) => (
                <Paper
                  // backend might not provide stable id for friendship yet
                  key={`${f.user?.id ?? "friend"}-${idx}`}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 4,
                    backgroundColor: "transparent",
                    border: `1px solid rgba(0,0,0,0.08)`,
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <ImageAvatar
                      type="user"
                      id={f.user.id}
                      width={44}
                      height={44}
                      shape="circle"
                      iconSize={18}
                    />
                    <FriendUserOption option={f.user} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>

      <AppSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
};
