import { useParams } from 'react-router-dom';
import {useGroupDetail} from "../../hooks/useGroupsQuery";
import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {Box, Typography, Stack, Button } from "@mui/material";
import {GroupDetailOverview} from "./GroupDetailOverview";
import { useState } from "react";
import {COLORS} from "../../constants/colors";
import {BigAddExpenseButton} from "../../components/BigAddExpenseButton";
import {GroupExpenses} from "./GroupExpenses";
import {GroupMembers} from "./GroupMembers";
import { FormattedMessage } from "react-intl";

type WrapperProps = {
    group: TGroupDetail | undefined;
    isLoading: boolean;
    isError: boolean;
}

type GroupDetailState = "expenses" | "members" | "statistics";

const GroupDetailSidebar = ({ activeTab, onTabChange, group }: {
    activeTab: GroupDetailState;
    onTabChange: (tab: GroupDetailState) => void;
    group: TGroupDetail;
}) => {
    const tabs: GroupDetailState[] = ["expenses", "members", "statistics"];

    const tabLabelId: Record<GroupDetailState, string> = {
        expenses: "groupDetail.tabs.expenses",
        members: "groupDetail.tabs.members",
        statistics: "groupDetail.tabs.statistics",
    };

    return (
        <Stack direction="column" alignItems="center" gap={6} sx={{ width: 300, flexShrink: 0 }}>

            {tabs.map((tab) => (
                <Button
                    key={tab}
                    onClick={() => onTabChange(tab)}
                    sx={{
                        width: "100%",
                        backgroundColor: activeTab === tab ? "transparent" : COLORS.PRIMARY,
                        border: "2px solid " + COLORS.PRIMARY,
                        color: activeTab === tab ? COLORS.PRIMARY : COLORS.SECONDARY,
                        borderRadius: 10,
                        textTransform: 'none',
                        fontSize: 18,
                        fontWeight: 'bold',
                    }}
                >
                    <FormattedMessage id={tabLabelId[tab]} />
                </Button>
            ))}

            <BigAddExpenseButton variant={"h4"} group={group} />
        </Stack>
    );
};

const GroupDetailTabContent = ({ activeTab, group }: { activeTab: GroupDetailState; group: TGroupDetail }) => {
    switch (activeTab) {
        case "expenses":
            return <GroupExpenses transactions={group.transactions} group={group} />;
        case "members":
            return <GroupMembers group={group} />;
        case "statistics":
            return (
                <Typography>
                    <FormattedMessage id="groupDetail.statistics.placeholder" values={{ name: group.name }} />
                </Typography>
            );
    }
};

const GroupDetailContent = ({ group }: { group: TGroupDetail }) => {
    const [activeTab, setActiveTab] = useState<GroupDetailState>("expenses");

    return (
        <Box mt={8}>
            <Stack direction="row" gap={6} alignItems="flex-start">
                <GroupDetailSidebar activeTab={activeTab} onTabChange={setActiveTab} group={group} />
                <Box flex={1}>
                    <GroupDetailTabContent activeTab={activeTab} group={group} />
                </Box>
            </Stack>
        </Box>
    );
}

const GroupDetailWrapper = ({ group, isLoading, isError }: WrapperProps) => {
    if (isLoading) {
        return (
            <Typography>
                <FormattedMessage id="groupDetail.loading" />
            </Typography>
        );
    }

    if (isError || !group) {
        return (
            <Typography>
                <FormattedMessage id="groupDetail.error" />
            </Typography>
        );
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