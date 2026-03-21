import {Box, Grid, Typography } from "@mui/material";
import { COLORS } from "../../constants/colors";
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {TGroupLight} from "../../types/dto/TGroupLight";
import {useGroupsGridQuery} from "../../hooks/useGroupsQuery";
import {useAuthStore} from "../../store/authStore";
import { FormattedMessage } from "react-intl";

type GroupContentProps = {
    groups: TGroupLight[] | undefined,
    isLoading: boolean,
    isError: boolean,
}

const GroupCard = ({ name, userDebts }: TGroupLight) => {
    const userId = useAuthStore((s) => s.currentUser.id)
    const balance = userDebts.reduce((acc, debt) => userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);
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
                <FormattedMessage id="balance.label" />{" "}
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

const GroupGridContent = ({ groups, isLoading, isError }: GroupContentProps) => {
    if (isLoading) {
        return (
            <Typography>
                <FormattedMessage id="home.groups.loading" />
            </Typography>
        );
    }
    if (isError) {
        return (
            <Typography>
                <FormattedMessage id="home.groups.error" />
            </Typography>
        );
    }
    return (
        <Grid container spacing={5}>
            {(groups || []).map((group) => (
                <Grid size={{ xs: 12, sm: 6 }} key={group.id}>
                    <GroupCard {...group} />
                </Grid>
            ))}
        </Grid>
    );
}

export function GroupGrid() {
    const { data: groups, isLoading, isError } = useGroupsGridQuery();
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3}}>
                <FormattedMessage id="home.groups.title" />
            </Typography>
            <GroupGridContent
                groups={groups}
                isLoading={isLoading}
                isError={isError}
            />
        </Box>
    );
}