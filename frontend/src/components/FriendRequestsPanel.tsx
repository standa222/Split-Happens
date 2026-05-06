import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useMemo, useState } from "react";
import type { TUser } from "../types/TUser";
import { useUsersSearchQuery } from "../hooks/useUsersSearchQuery";
import {
  useAcceptFriendRequestMutation,
  useCreateFriendRequestMutation,
  useIncomingFriendRequestsQuery,
  useOutgoingFriendRequestsQuery,
  useRejectFriendRequestMutation,
} from "../hooks/useFriends";
import { COLORS } from "../constants/colors";
import { ImageAvatar } from "./ImageAvatar";
import { FriendUserOption } from "./FriendUserOption";
import { formatApiError } from "../utils/apiErrorUtils";

export function FriendRequestsPanel({
  onSuccessMessage,
  onErrorMessage,
}: {
  onSuccessMessage?: (msg: string) => void;
  onErrorMessage?: (msg: string) => void;
}) {
  const intl = useIntl();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);

  const { data: userOptions = [], isFetching: usersLoading } = useUsersSearchQuery({
    query: searchTerm,
    limit: 20,
  });

  const incoming = useIncomingFriendRequestsQuery();
  const outgoing = useOutgoingFriendRequestsQuery();

  const sendRequest = useCreateFriendRequestMutation({
    onSuccess: () => {
      setSelectedUser(null);
      setSearchTerm("");
      onSuccessMessage?.(
        intl.formatMessage({
          id: "friends.request.sent",
          defaultMessage: "Friend request sent.",
        })
      );
    },
  });

  const accept = useAcceptFriendRequestMutation({
    onSuccess: () => {
      onSuccessMessage?.(
        intl.formatMessage({
          id: "friends.request.accepted",
          defaultMessage: "Friend request accepted.",
        })
      );
    },
  });

  const reject = useRejectFriendRequestMutation({
    onSuccess: () => {
      onSuccessMessage?.(
        intl.formatMessage({
          id: "friends.request.rejected",
          defaultMessage: "Friend request rejected.",
        })
      );
    },
  });

  const isAnyPending = sendRequest.isPending || accept.isPending || reject.isPending;

  const incomingList = useMemo(() => incoming.data ?? [], [incoming.data]);
  const outgoingList = useMemo(() => outgoing.data ?? [], [outgoing.data]);

  return (
    <Stack spacing={2.5}>
      {/* Add friend */}
      <Stack spacing={1.25}>
        <Typography sx={{ fontWeight: 700 }}>
          <FormattedMessage id="friends.add.title" defaultMessage="Add friend" />
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
          <Autocomplete
            fullWidth
            options={userOptions}
            loading={usersLoading}
            value={selectedUser}
            onChange={(_, v) => setSelectedUser(v)}
            onInputChange={(_, value) => setSearchTerm(value)}
            getOptionLabel={(u) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email}
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
                  <FormattedMessage id="friends.add.search.label" defaultMessage="Search users" />
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
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
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
            disabled={!selectedUser || isAnyPending}
            onClick={() => {
              if (!selectedUser) return;
              sendRequest.mutate(
                { receiverUserId: selectedUser.id },
                {
                  onError: (e) => onErrorMessage?.(formatApiError(intl, e)),
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
              <FormattedMessage id="friends.add.sending" defaultMessage="Sending..." />
            ) : (
              <FormattedMessage id="friends.add.send" defaultMessage="Send request" />
            )}
          </Button>
        </Stack>

        <Typography variant="caption">
          <FormattedMessage id="friends.add.hint" defaultMessage="Search by name or email." />
        </Typography>
      </Stack>

      <Divider sx={{ borderColor: COLORS.PRIMARY, opacity: 0.2 }} />

      {/* Incoming */}
      <Stack spacing={1.25}>
        <Typography sx={{ fontWeight: 700 }}>
          <FormattedMessage id="friends.incoming.title" defaultMessage="Incoming requests" />
        </Typography>

        {incoming.isLoading ? (
          <Typography>
            <FormattedMessage id="friends.incoming.loading" defaultMessage="Loading..." />
          </Typography>
        ) : incoming.isError ? (
          <Typography color="error">
            <FormattedMessage
              id="friends.incoming.error"
              defaultMessage="Failed to load incoming requests."
            />
          </Typography>
        ) : incomingList.length === 0 ? (
          <Typography>
            <FormattedMessage id="friends.incoming.empty" defaultMessage="No incoming requests." />
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {incomingList.map((r) => (
              <Box key={r.id}>
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
                            onError: (e) => onErrorMessage?.(formatApiError(intl, e)),
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
                      <FormattedMessage id="friends.request.reject" defaultMessage="Reject" />
                    </Button>

                    <Button
                      variant="contained"
                      disabled={isAnyPending}
                      onClick={() =>
                        accept.mutate(
                          { requestId: r.id },
                          {
                            onError: (e) => onErrorMessage?.(formatApiError(intl, e)),
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
                      <FormattedMessage id="friends.request.accept" defaultMessage="Accept" />
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Outgoing */}
      <Stack spacing={1.25}>
        <Typography sx={{ fontWeight: 700 }}>
          <FormattedMessage id="friends.outgoing.title" defaultMessage="Outgoing requests" />
        </Typography>

        {outgoing.isLoading ? (
          <Typography>
            <FormattedMessage id="friends.outgoing.loading" defaultMessage="Loading..." />
          </Typography>
        ) : outgoing.isError ? (
          <Typography color="error">
            <FormattedMessage
              id="friends.outgoing.error"
              defaultMessage="Failed to load outgoing requests."
            />
          </Typography>
        ) : outgoingList.length === 0 ? (
          <Typography>
            <FormattedMessage id="friends.outgoing.empty" defaultMessage="No outgoing requests." />
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {outgoingList.map((r) => (
              <Box key={r.id}>
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
                    <Typography variant="caption">
                      <FormattedMessage id="friends.outgoing.pending" defaultMessage="Pending" />
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
