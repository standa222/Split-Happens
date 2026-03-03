import { Typography, Box, Stack, Button } from "@mui/material";
import {GroupsByActivity, useGroupsQuery} from "../../hooks/useGroupsQuery";
import {TGroupLight} from "../../types/dto/TGroupLight";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

type Props = {
    groups: GroupsByActivity;
    isLoading: boolean;
    isError: boolean;
}

const GroupListItem = ({ id, name, debts, lastActivity }: TGroupLight) => {
    let balance = 0;
    if (debts) {    // TODO delete check after BE returns debts
        balance = debts.reduce((acc, debt) => acc + debt.amount, 0);
    }
    const isNegative = balance < 0;

    return (
        <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
            <Stack direction="row" spacing={2} alignItems="center">
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
                <Button>
                    Detail
                </Button>
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

    const activeGroups = groups.activeGroups
    const inactiveGroups = groups.inactiveGroups
    console.log("active content", activeGroups)
    console.log("inacitve content", inactiveGroups)

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
            {(groups?.activeGroups || []).map((group) => (
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