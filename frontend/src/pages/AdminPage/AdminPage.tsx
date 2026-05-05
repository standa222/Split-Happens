import {
  Box,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Page404 } from "../Page404";
import {
  useAdminGroupsQuery,
  useAdminQuery,
  useAdminUsersQuery,
} from "../../hooks/useAdminQuery";
import {FormattedMessage} from "react-intl";

export const AdminPage = () => {
  const {
    data: probe,
    isLoading: probeLoading,
    isError: probeError,
  } = useAdminQuery();

  const isForbidden = probe ? !probe.groupsOk || !probe.usersOk : false;

  const {
    data: groups,
    isLoading: groupsLoading,
    isError: groupsError,
  } = useAdminGroupsQuery(!isForbidden);

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useAdminUsersQuery(!isForbidden);

  const isLoading = probeLoading || groupsLoading || usersLoading;
  const isError = probeError || groupsError || usersError;

  if (isForbidden) return <Page404 />;

  if (isLoading) {
    return (
      <Stack gap={2} sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight={700}>
              <FormattedMessage id="admin.title" />
          </Typography>
          <CircularProgress />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack gap={2} sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          <FormattedMessage id="admin.title" />
        </Typography>
        <Typography>
            <FormattedMessage id="admin.error" />
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ py: 4 }} gap={5}>
        <Typography variant="h4" fontWeight={700}>
          <FormattedMessage id="admin.title" />
        </Typography>

        <Stack direction="row" gap={20} justifyContent="space-between">
            <Stack width="100%" gap={1}>
              <Typography variant="h5" fontWeight={600}>
                <FormattedMessage id="admin.groups" />
              </Typography>
              <TableContainer component={Box}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <FormattedMessage id="admin.group.name" />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(groups ?? []).map((g) => (
                      <TableRow key={g.id}>
                        <TableCell>{g.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>

            <Stack width="100%" gap={1}>
                <Typography variant="h5" fontWeight={600}>
                    <FormattedMessage id="admin.users" />
                </Typography>
                <TableContainer component={Box}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <FormattedMessage id="admin.user.name" />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>
                                    <FormattedMessage id="admin.user.email" />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(users ?? []).map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.firstName + u.lastName}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Stack>
    </Stack>
  );
};

