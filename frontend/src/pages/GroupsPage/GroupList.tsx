import { Typography, Box, Stack, Button } from "@mui/material";
import {GroupsByActivity, useGroupsQuery} from "../../hooks/useGroupsQuery";
import {TGroupLight} from "../../types/dto/TGroupLight";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {NavLink} from "react-router-dom";
import { formatDistanceToNow, parseISO } from 'date-fns';

type Props = {
    groups: GroupsByActivity;
    isLoading: boolean;
    isError: boolean;
}

const GroupListItem = ({ id, name, userDebts, lastActivity }: TGroupLight) => {
    const balance = userDebts.reduce((acc, debt) => acc + debt.amount, 0);
    const isNegative = balance < 0;
    const timeAgo = formatDistanceToNow(parseISO(lastActivity), { addSuffix: true });

    return (
        <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 3}}>
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        border: `2px dashed ${COLORS.PRIMARY}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <PhotoCameraIcon sx={{ color: COLORS.PRIMARY, fontSize: 24 }} />
                </Box>
                <Stack spacing={0.5} flex={1}>
                    <Typography>{name}</Typography>
                </Stack>
                <NavLink
                    to={`/groups/${id}`} // TODO use route constant
                    end
                    style={({isActive}) => ({
                        padding: "12px 32px",
                        margin: "0 12px",
                        borderRadius: 9999,
                        backgroundColor: COLORS.PRIMARY,
                        color: COLORS.SECONDARY,
                        fontSize: 20,
                        textDecoration: "none",
                        transition: "background-color 0.15s, color 0.15s",
                    })}
                >
                    Detail
                </NavLink>
            </Stack>
        </Box>
    )
}

const GroupListContent = ({groups, isLoading, isError}: Props) => {
    if (isLoading) {
        return <Typography>Loading...</Typography>;
    }
    if (isError) {
        return <Typography>Error loading groups.</Typography>;
    }

    return (
        <>
            <Typography>Active</Typography>
            {(groups?.activeGroups || []).map((group) => (
                <GroupListItem
                    key={group.id}
                    {...group}
                />
            ))}
            <Typography>Inactive</Typography>
            {(groups?.inactiveGroups || []).map((group) => (
                <GroupListItem
                    key={group.id}
                    {...group}
                />
            ))}
        </>
    );
}

export const GroupList = () => {
    const { data: groups, isLoading, isError } = useGroupsQuery();

    return (
        <Box mt={4}>
            <GroupListContent
                groups={groups}
                isLoading={isLoading}
                isError={isError}
            />
        </Box>
    )
}