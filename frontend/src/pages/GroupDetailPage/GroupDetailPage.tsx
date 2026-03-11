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

type WrapperProps = {
    group: TGroupDetail | undefined;
    isLoading: boolean;
    isError: boolean;
}

type GroupDetailState = "expenses" | "members" | "statistics";

const GroupDetailSidebar = ({ activeTab, onTabChange }: {
    activeTab: GroupDetailState;
    onTabChange: (tab: GroupDetailState) => void;
}) => {
    const tabs: GroupDetailState[] = ["expenses", "members", "statistics"];

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
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
            ))}

            <BigAddExpenseButton variant={"h4"} />
        </Stack>
    );
};

const GroupDetailTabContent = ({ activeTab, group }: { activeTab: GroupDetailState; group: TGroupDetail }) => {
    switch (activeTab) {
        case "expenses":
            return <GroupExpenses transactions={group.transactions} />;
        case "members":
            return <GroupMembers members={group.members} debts={group.debts} />;
        case "statistics":
            return <Typography>Statistics content for {group.name}</Typography>;
    }
};

const GroupDetailContent = ({ group }: { group: TGroupDetail }) => {
    const [activeTab, setActiveTab] = useState<GroupDetailState>("expenses");

    return (
        <Box mt={8}>
            <Stack direction="row" gap={6} alignItems="flex-start">
                <GroupDetailSidebar activeTab={activeTab} onTabChange={setActiveTab} />
                <Box flex={1}>
                    <GroupDetailTabContent activeTab={activeTab} group={group} />
                </Box>
            </Stack>
        </Box>
    );
}

const GroupDetailWrapper = ({ group, isLoading, isError }: WrapperProps) => {
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