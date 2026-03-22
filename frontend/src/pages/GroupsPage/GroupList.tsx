import { Typography, Box, Stack } from "@mui/material";
import {GroupsByActivity, useGroupsQuery} from "../../hooks/useGroupsQuery";
import {TGroupLight} from "../../types/dto/TGroupLight";
import {COLORS} from "../../constants/colors";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {NavLink} from "react-router-dom";
import { formatDistanceToNow, parseISO } from 'date-fns';
import {ROUTES} from "../../enums/routes";
import {DebtsList} from "../../components/DebtsList";
import {BalanceDisplay} from "../../components/BalanceDisplay";
import {useAuthStore} from "../../store/authStore";
import { FormattedMessage, useIntl } from "react-intl";
import { getDateFnsLocale } from "../../utils/dateFnsLocaleUtils";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {Collapse, Divider} from "@mui/material";
import {useState} from "react";

type Props = {
    groups: GroupsByActivity;
    isLoading: boolean;
    isError: boolean;
}

const GroupListItem = ({ id, name, userDebts, lastActivity }: TGroupLight) => {
    const user = useAuthStore((s) => s.currentUser);
    const balance = userDebts.reduce((acc, debt) => user.id === debt.creditor.id ? acc + debt.amount : acc - debt.amount, 0);
    const { locale } = useIntl();
    const timeAgo = formatDistanceToNow(parseISO(lastActivity), { addSuffix: true, locale: getDateFnsLocale(locale) });

    return (
        <Box sx={{ py: 2, borderTop: `2px solid ${COLORS.PRIMARY}` }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 3}}>
                <Box
                    sx={{
                        width: 120,
                        height: 120,
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
                <Stack direction="row" flex={1} sx={{ px: 5 }}>
                    <Stack width="50%" gap={3} justifyContent="center">
                        <Typography variant="h6" sx={{fontWeight: 600 }}>{name}</Typography>
                        <Typography variant="body1">
                            <FormattedMessage id="groups.lastActivity" />: {timeAgo}
                        </Typography>
                    </Stack>
                    <Stack width="50%" gap={3}>
                        <BalanceDisplay variant={"h6"} sx={{ fontWeight: 600 }} balance={balance}/>
                        <DebtsList userDebts={userDebts} user={user}/>
                    </Stack>
                </Stack>
                <NavLink
                    to={ROUTES.GROUPS.detail(id)}
                    style={{
                        padding: "12px 32px",
                        borderRadius: 9999,
                        backgroundColor: COLORS.PRIMARY,
                        color: COLORS.SECONDARY,
                        fontSize: 20,
                        textDecoration: "none",
                        transition: "background-color 0.15s, color 0.15s",
                    }}
                >
                    <FormattedMessage id="common.detail" />
                </NavLink>
            </Stack>
        </Box>
    )
}

const GroupSection = ({
    titleId,
    groups,
    defaultOpen = true,
}: {
    titleId: string;
    groups: TGroupLight[];
    defaultOpen?: boolean;
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Box>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={() => setOpen(!open)}
                sx={{ cursor: "pointer", py: 1, px: 1 }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    <Typography variant="subtitle2" sx={{ fontSize: 20 }}>
                        <FormattedMessage id={titleId} />
                    </Typography>
                </Stack>
            </Stack>
            <Collapse in={open}>
                {groups.map((group) => (
                    <GroupListItem key={group.id} {...group} />
                ))}
            </Collapse>
        </Box>
    );
};

const GroupListContent = ({groups, isLoading, isError}: Props) => {
    if (isLoading) {
        return (
            <Typography>
                <FormattedMessage id="groups.loading" />
            </Typography>
        );
    }
    if (isError) {
        return (
            <Typography>
                <FormattedMessage id="groups.error" />
            </Typography>
        );
    }

    return (
        <>
            <GroupSection
                titleId="groups.active"
                groups={groups?.activeGroups || []}
                defaultOpen
            />

            <GroupSection
                titleId="groups.inactive"
                groups={groups?.inactiveGroups || []}
                defaultOpen={false}
            />
        </>
    );
}

export const GroupList = () => {
    const { data: groups, isLoading, isError } = useGroupsQuery();

    return (
        <Box>
            <GroupListContent
                groups={groups}
                isLoading={isLoading}
                isError={isError}
            />
        </Box>
    )
}