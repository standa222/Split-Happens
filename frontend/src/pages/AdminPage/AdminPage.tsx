import {
  Box,
  CircularProgress,
  FormControlLabel,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Page404 } from "../Page404";
import {
  useAdminGroupsQuery,
  useAdminQuery,
  useAdminUsersQuery,
} from "../../hooks/useAdminQuery";

type ViewMode = "groups" | "users";

export const AdminPage = () => {
  const [mode, setMode] = useState<ViewMode>("groups");

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
  } = useAdminGroupsQuery(!isForbidden && mode === "groups");

  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
  } = useAdminUsersQuery(!isForbidden && mode === "users");

  const isLoading = probeLoading || (mode === "groups" ? groupsLoading : usersLoading);
  const isError = probeError || (mode === "groups" ? groupsError : usersError);

  const rows = useMemo(() => {
    if (mode === "groups") {
      return (groups ?? []).map((g) => ({ key: `g-${g.id}`, label: g.name }));
    }

    return (users ?? []).map((u) => ({
      key: `u-${u.id}`,
      label: `${u.firstName} ${u.lastName}`.trim(),
    }));
  }, [groups, mode, users]);

  if (isForbidden) return <Page404 />;

  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ width: "100%", py: 10 }}>
        <Typography variant="h4" fontWeight={700}>
          Admin
        </Typography>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          Failed to load admin endpoints.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", py: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Admin Dashboard
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={mode === "users"}
              onChange={(_, checked) => setMode(checked ? "users" : "groups")}
            />
          }
          label={mode === "users" ? "Users" : "Groups"}
        />
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>
                {mode === "groups" ? "Group" : "User"}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.key}>
                <TableCell>{r.label || "—"}</TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell sx={{ color: "text.secondary" }}>
                  No {mode} found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminPage;
