import { Typography, Stack, Box } from "@mui/material";
import { ImagePlaceholder } from "../../components/ImagePlaceholder";
import { COLORS } from "../../constants/colors";
import { FormattedMessage } from "react-intl";
import {NotificationItem} from "../../components/NotificationsDrawer";
import {useLatestNotificationsQuery} from "../../hooks/useNotifications";


export function RecentActivity() {
  const { data: activity, isLoading, isError } = useLatestNotificationsQuery();

  const content = isLoading ? (
    <Typography variant="h4">
      <FormattedMessage id="home.activity.loading" />
    </Typography>
  ) : isError ? (
    <Typography variant="h4">
      <FormattedMessage id="home.activity.error" />
    </Typography>
  ) : (
    activity.map((n) => (
      <NotificationItem  key={n.id} notification={n} isNotification={false}/>
    ))
  );
  return (
    <Stack>
      <Typography variant="h4" sx={{ mb: 2 }}>
        <FormattedMessage id="home.activity.title" />
      </Typography>
      {content}
    </Stack>
  );
}
