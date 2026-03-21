import { Box, Button, Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../enums/routes";

export const Page404 = () => {
  return (
    <Box sx={{ width: "100%", py: 10 }}>
      <Stack alignItems="center" spacing={2}>
        <Typography variant="h2" fontWeight={800}>
          <FormattedMessage id="notFound.title" />
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center">
          <FormattedMessage id="notFound.description" />
        </Typography>
        <Button
          component={RouterLink}
          to={ROUTES.HOME}
          variant="contained"
        >
          <FormattedMessage id="notFound.goHome" />
        </Button>
      </Stack>
    </Box>
  );
};