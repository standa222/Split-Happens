import {Box, Grid, Stack, Typography } from "@mui/material";
import { COLORS } from "../../constants/colors";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {TGroupLight} from "../../types/dto/TGroupLight";
import {useGroupsQuery} from "../../hooks/useGroupsQuery";

// TODO delete later when we have real data
const testGroups: TGroupLight[] = [
    { id: 1, name: "Group 1" },
    { id: 2, name: "Group 2" },
    { id: 3, name: "Group 3" },
    { id: 4, name: "Group 4" },
];

const GroupCard = ({ name, balance }: { name: string; balance: number }) => {
    const isNegative = balance < 0;

    return (
        <Box
            sx={{
                border: `4px solid ${COLORS.PRIMARY}`,
                borderRadius: '40px', // Matches your prototype's heavy rounding
                padding: '16px',
                backgroundColor: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minHeight: '250px',
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY }}>
                {name}
            </Typography>

            {/* The Dotted Placeholder for the Image */}
            <Box
                sx={{
                    width: '100%',
                    flex: 1,
                    border: `2px dashed ${COLORS.PRIMARY}`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <PhotoCameraIcon sx={{ fontSize: 40, color: COLORS.PRIMARY }} />
            </Box>

            <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: COLORS.PRIMARY }}
            >
                Balance{" "}
                <Box
                    component="span"
                    sx={{ color: isNegative ? COLORS.RED : COLORS.PRIMARY }}
                >{/*> TODO need to change the hardcoded currency */}
                    {balance.toFixed(2)} $
                </Box>
            </Typography>
        </Box>
    );
};

export function GroupGrid() {
    const { data: groups, isLoading, isError } = useGroupsQuery();
    const content = isLoading ? (
        <Typography>Loading...</Typography>
    ) : isError ? (
        <Typography>Error loading groups.</Typography>
    ) : (
        <Grid container spacing={5}>
            {testGroups.map((group) => (
                <Grid size={{ xs: 12, sm: 6 }} key={group.id}>
                    <GroupCard name={group.name} balance={10} />
                </Grid>
            ))}
        </Grid>
    );

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3}}>
                Groups
            </Typography>
            {content}
        </Box>
    );
}