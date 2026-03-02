import { Stack, Box } from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";


export const GroupsPage = () => {
    return (
        <Box
            width="100%"
        >
            <Stack
                direction="row"
                justifyContent="space-between"
            >
                <OverallBalance />
            </Stack>
        </Box>
    );
}