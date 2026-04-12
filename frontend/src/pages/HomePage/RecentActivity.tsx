import {Typography, Stack, Box} from "@mui/material";
import {ImagePlaceholder} from "../../components/ImagePlaceholder";
import { COLORS } from "../../constants/colors";
import { FormattedMessage } from "react-intl";

const testActivity = [
    { user: 'John', amount: 20, group: 'Group 1' },
    { user: 'Jane', amount: -30, group: 'Group 2' },
    { user: 'Bob', amount: 25, group: 'Group 3' },
]

const ActivityItem = ({ user, action, amount, group, date }: any) => {
    const isNegative = amount < 0;

    return (
        <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <ImagePlaceholder width={60} height={60} />

                <Stack spacing={0.5}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        <FormattedMessage
                            id="home.activity.item"
                            values={{ user, action: action ?? "", group }}
                        />
                    </Typography>

                    {amount !== undefined && (
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="home.activity.yourSplit" />{" "}
                            <Box component="span" sx={{ color: isNegative ? COLORS.RED : COLORS.PRIMARY }}>
                                {amount.toFixed(2)} $
                            </Box>
                        </Typography>
                    )}

                    {date ? (
                        <Typography variant="caption" sx={{ color: 'gray', fontWeight: 600 }}>
                            {date}
                        </Typography>
                    ) : null}
                </Stack>
            </Stack>
        </Box>
    );
};

export function RecentActivity() {
    // TODO fetch recent activity from backend when notifications implemented
    // const { data: activity, isLoading, isError } = { data: testActivity, isLoading: false, isError: false }; // Placeholder for actual query
    const isLoading = false;
    const isError = false;

    const content = isLoading ? (
        <Typography variant="h4">
            <FormattedMessage id="home.activity.loading" />
        </Typography>
    ) : isError ? (
        <Typography variant="h4">
            <FormattedMessage id="home.activity.error" />
        </Typography>
    ) : (
        testActivity.map((item) => (
            <ActivityItem key={item.amount} user={item.user} amount={item.amount} group={item.group} />
        ))
    )
    return (
        <Stack>
            <Typography variant="h4" sx={{ mb: 3}}>
                <FormattedMessage id="home.activity.title" />
            </Typography>
            {content}
        </Stack>
    );
}