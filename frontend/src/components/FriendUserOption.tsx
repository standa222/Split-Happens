import { Checkbox, Stack, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import type { TUser } from "../types/TUser";

export function FriendUserOption({
  option,
  selected,
  showCheckbox = false,
}: {
  option: TUser;
  selected?: boolean;
  showCheckbox?: boolean;
}) {
  return (
    <Stack direction="row" alignItems="center" gap={1.5}>
      {showCheckbox ? <Checkbox checked={!!selected} /> : null}
      <Stack>
        <Typography variant="body2">
          {`${option.firstName ?? ""} ${option.lastName ?? ""}`.trim() || (
            <FormattedMessage id="common.unknownUser" />
          )}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {option.email}
        </Typography>
      </Stack>
    </Stack>
  );
}
