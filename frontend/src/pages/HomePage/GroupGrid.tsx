import {Box, Grid, Typography, Stack } from "@mui/material";
import { COLORS } from "../../constants/colors";
import {ImageAvatar} from "../../components/ImageAvatar";
import {TGroupLight} from "../../types/dto/TGroupLight";
import {useGroupsGridQuery} from "../../hooks/useGroupsQuery";
import {useAuthStore} from "../../store/authStore";
import { FormattedMessage } from "react-intl";
import {useNavigate} from "react-router-dom";
import {ROUTES} from "../../enums/routes";

type GroupContentProps = {
    groups: TGroupLight[] | undefined,
    isLoading: boolean,
    isError: boolean,
}

const GroupCard = ({ id, name, userDebts }: TGroupLight) => {
    const navigate = useNavigate();
    const userId = useAuthStore((s) => s.currentUser.id)
    const balance = userDebts.reduce((acc, debt) => userId === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);
    const isNegative = balance < 0;

    const goToDetail = () => {
        navigate(ROUTES.GROUPS.detail(id));
    };

    return (
        <Stack
            role="button"
            tabIndex={0}
            onClick={goToDetail}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToDetail();
                }
            }}
            sx={{
                cursor: "pointer",
                border: `4px solid ${COLORS.PRIMARY}`,
                borderRadius: { xs: 9999, md: 10 },
                padding: '16px',
                alignItems: 'center',
                gap: { xs: 3, md: 2 },
                height: { md: '250px' },
                flexDirection: { xs: 'row', md: 'column' },
                transition: 'box-shadow 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: `inset 0 0 0 4px ${COLORS.PRIMARY}`
                }
            }}
        >
            <ImageAvatar
                type="group"
                id={id}
                width={{ xs: '60px', md: '100%' }}
                height={{ xs: '60px', md: 'auto' }}
                shape="rounded"
                iconSize={{ xs: 24, md: 40 }}
                sx={{
                    order: 1,
                    flex: { md: 1 },
                    borderRadius: { xs: '50%', md: '20px' },
                }}
            />

            <Box
                sx={{
                    display: { xs: 'flex', md: 'contents' },
                    flexDirection: 'column',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    flex: 1,
                    order: 2,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: COLORS.PRIMARY,
                        order: 0,
                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                >
                    {name}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 600,
                        color: COLORS.PRIMARY,
                        order: 2,
                    }}
                >
                    <FormattedMessage id="balance.label" />{" "}
                    <Box
                        component="span"
                        sx={{ color: isNegative ? COLORS.RED : COLORS.PRIMARY }}
                    >
                        {balance.toFixed(2)} $
                    </Box>
                </Typography>
            </Box>
        </Stack>
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