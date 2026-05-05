import { useParams } from "react-router-dom";
import { useGroupDetail } from "../../hooks/useGroupsQuery";
import { TGroupDetail } from "../../types/dto/TGroupDetail";
import { Box, Typography, Stack, Button } from "@mui/material";
import { GroupDetailOverview } from "./GroupDetailOverview";
import { useState } from "react";
import { COLORS } from "../../constants/colors";
import { AddExpenseButton } from "../../components/AddExpenseButton";
import { GroupExpenses } from "./GroupExpenses";
import { GroupMembers } from "./GroupMembers";
import { FormattedMessage } from "react-intl";
import { GroupStatistics } from "./GroupStatistics";

type WrapperProps = {
  group: TGroupDetail | undefined;
  isLoading: boolean;
  isError: boolean;
};

type GroupDetailState = "expenses" | "members" | "statistics";

const tabs: GroupDetailState[] = ["expenses", "members", "statistics"];

const tabLabelId: Record<GroupDetailState, string> = {
  expenses: "groupDetail.tabs.expenses",
  members: "groupDetail.tabs.balances",
  statistics: "groupDetail.tabs.statistics",
};

const MobileBottomTabs = ({
  activeTab,
  onTabChange,
}: {
  activeTab: GroupDetailState;
  onTabChange: (tab: GroupDetailState) => void;
}) => {
  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100vw",
        zIndex: 1,
        backgroundColor: COLORS.PRIMARY,
        borderTop: `1px solid rgba(0,0,0,0.12)`,
        pb: "env(safe-area-inset-bottom)",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="stretch"
        sx={{
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        {tabs.map((tab) => (
          <Button
            key={tab}
            onClick={() => onTabChange(tab)}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 0,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: COLORS.SECONDARY,
              opacity: activeTab === tab ? 1 : 0.8,
              borderBottom:
                activeTab === tab ? `3px solid ${COLORS.SECONDARY}` : "3px solid transparent",
            }}
          >
            <FormattedMessage id={tabLabelId[tab]} />
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

const GroupDetailSidebar = ({
  activeTab,
  onTabChange,
  group,
}: {
  activeTab: GroupDetailState;
  onTabChange: (tab: GroupDetailState) => void;
  group: TGroupDetail;
}) => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      gap={6}
      sx={{
        width: 300,
        flexShrink: 0,
        display: { xs: "none", md: "flex" },
      }}
    >
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
            textTransform: "none",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          <FormattedMessage id={tabLabelId[tab]} />
        </Button>
      ))}

      <AddExpenseButton variant={"h4"} group={group} />
    </Stack>
  );
};

const GroupDetailTabContent = ({
  activeTab,
  group,
}: {
  activeTab: GroupDetailState;
  group: TGroupDetail;
}) => {
  switch (activeTab) {
    case "expenses":
      return <GroupExpenses transactions={group.transactions} group={group} />;
    case "members":
      return <GroupMembers group={group} />;
    case "statistics":
      return <GroupStatistics group={group} />;
  }
};

const GroupDetailContent = ({ group }: { group: TGroupDetail }) => {
  const [activeTab, setActiveTab] = useState<GroupDetailState>("expenses");
  const mobileBottomTabsHeight = 56;

  return (
    <Box mt={{ xs: 1, md: 8 }} pb={{ xs: `${mobileBottomTabsHeight + 32}px`, md: 0 }}>
      <Stack direction={{ xs: "column", md: "row" }} gap={{ xs: 2, md: 6 }} alignItems="flex-start">
        <GroupDetailSidebar activeTab={activeTab} onTabChange={setActiveTab} group={group} />
        <Box flex={1} width="100%">
          <GroupDetailTabContent activeTab={activeTab} group={group} />
        </Box>
      </Stack>

      <MobileBottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </Box>
  );
};

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
};

export const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  // TODO check if groupId is valid number and user has access to this group
  const { data: group, isLoading, isError } = useGroupDetail(groupId ? parseInt(groupId) : 0);

  return (
    <Box mt={{ xs: 2, md: 4 }} px={0}>
      <GroupDetailWrapper group={group} isLoading={isLoading} isError={isError} />
    </Box>
  );
};
