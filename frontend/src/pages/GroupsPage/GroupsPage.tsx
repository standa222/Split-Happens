import { Stack, Box, Typography } from "@mui/material";
import { OverallBalance } from "../../components/OverallBalance";
import { GroupList } from "./GroupList";
import { COLORS } from "../../constants/colors";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { GroupFormModal } from "../../components/GroupFormModal";
import { FormattedMessage } from "react-intl";

const CreateGroupButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Stack
      component="button" // Makes the whole Stack semantically a button
      onClick={onClick}
      alignItems="center"
      direction="row"
      spacing={2}
      sx={{
        background: "none",
        border: "none",
        cursor: "pointer",
        transition: "transform 0.1s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)", // Subtle feedback when hovering
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 30, md: 40 },
          height: { xs: 30, md: 40 },
          backgroundColor: COLORS.PRIMARY,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <AddIcon sx={{ color: COLORS.SECONDARY, fontSize: { xs: 25, md: 30 } }} />
      </Box>
      <Typography
        variant="h4"
        sx={{
          color: COLORS.PRIMARY,
          typography: {
            xs: "h6",
            md: "h5",
          },
          fontWeight: {
            xs: 500,
            md: 500,
          },
          textAlign: "center",
        }}
      >
        <FormattedMessage id="groups.createButton" />
      </Typography>
    </Stack>
  );
};

export const GroupsPage = () => {
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  return (
    <>
      <Box width="100%">
        <Stack
          sx={{
            padding: {
              md: "20px 0px 40px 0px",
              xs: "10px 0px 20px 0px",
            },
          }}
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          gap={{ xs: 2, md: 0 }}
        >
          <OverallBalance />
          <CreateGroupButton
            onClick={() => {
              setCreateGroupModalOpen(true);
            }}
          />
        </Stack>
        <GroupList />
      </Box>
      <GroupFormModal open={createGroupModalOpen} onClose={() => setCreateGroupModalOpen(false)} />
    </>
  );
};
