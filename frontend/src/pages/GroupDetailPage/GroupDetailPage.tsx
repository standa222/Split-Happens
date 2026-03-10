import { useParams } from 'react-router-dom';
import {useGroupDetail} from "../../hooks/useGroupsQuery";
import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {Box, Typography } from "@mui/material";
import {GroupDetailOverview} from "./GroupDetailOverview";

type Props = {
    group: TGroupDetail | undefined;
    isLoading: boolean;
    isError: boolean;
}

const GroupDetailContent = ({ group }: { group: TGroupDetail }) => {
    return (
        <Box mt={4}>
            <Typography variant="h5" gutterBottom>
                Expenses
            </Typography>
            {/* TODO add expenses list */}
        </Box>
    );
}

const GroupDetailWrapper = ({ group, isLoading, isError }: Props) => {
    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }

    if (isError || !group) {
        return <Typography>Error loading group details.</Typography>;
    }

    return (
        <Box>
            <GroupDetailOverview group={group} />
            <GroupDetailContent group={group} />
        </Box>
    );
}

export const GroupDetailPage = () => {
    const { groupId } = useParams<{ groupId: string }>();
    // TODO check if groupId is valid number and user has access to this group
    const { data: group, isLoading, isError } = useGroupDetail(groupId ? parseInt(groupId) : 0);

    return (
        <Box mt={4}>
            <GroupDetailWrapper
                group={group}
                isLoading={isLoading}
                isError={isError}
            />
        </Box>
    );
}