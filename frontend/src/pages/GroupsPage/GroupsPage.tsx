import {Stack, Box, Typography} from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";
import {GroupList} from "./GroupList";
import {COLORS} from "../../constants/colors";
import AddIcon from "@mui/icons-material/Add";
import {useState} from "react";
import {GroupFormModal} from "../../components/GroupFormModal";
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
                    width: 40,
                    height: 40,
                    backgroundColor: COLORS.PRIMARY,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                }}
            >
                <AddIcon sx={{ color: COLORS.SECONDARY, fontSize: 30 }} />
            </Box>
            <Typography
                variant="h4"
                sx={{
                    color: COLORS.PRIMARY,
                    fontWeight: 500,
                    textAlign: "center",
                }}
            >
                <FormattedMessage id="groups.createButton" />
            </Typography>
        </Stack>
    );
}

export const GroupsPage = () => {
    const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

    return (
        <>
            <Box width="100%">
                <Stack sx = {{padding: '20px 0px 40px 0px'}} direction="row" justifyContent="space-between">
                    <OverallBalance />
                    <CreateGroupButton onClick={() => {setCreateGroupModalOpen(true)}} />
                </Stack>
                <GroupList />
            </Box>
            <GroupFormModal
                open={createGroupModalOpen}
                onClose={() => setCreateGroupModalOpen(false)}
            />
        </>
    );
}