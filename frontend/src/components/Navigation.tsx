import {NavLink} from "react-router-dom";
import {COLORS} from "../constants/colors";
import {ROUTES} from "../enums/routes";
import logo from "../assets/logo_dark.png";
import { Box, Stack, IconButton, Typography } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';

function NavLogo() {
    return (
        <Stack direction="row" alignItems="center" gap={2}>
            <img src={logo} alt="Logo" style={{height: 40, width: "auto"}}/>
            <Typography variant="h4" fontWeight={700} color={COLORS.PRIMARY}>
                SplitHappens
            </Typography>
        </Stack>
    );
}

function NavButton({label, path}: {label: string; path: string}) {
    return (
        <NavLink
            to={path}
            end
            style={({isActive}) => ({
                padding: "10px 30px",
                margin: "0 12px",
                borderRadius: 9999,
                border: "2px solid " + COLORS.PRIMARY,
                backgroundColor: isActive ? "transparent" : COLORS.PRIMARY,
                color: isActive ? COLORS.PRIMARY : COLORS.SECONDARY,
                fontWeight: 600,
                fontSize: 20,
                textDecoration: "none",
                transition: "background-color 0.15s, color 0.15s",
                whiteSpace: "nowrap",
            })}
        >
            {label}
        </NavLink>
    );
}

function BellIcon() {
    return (
        <IconButton
            aria-label="Notifications"
            sx={{
                color: COLORS.PRIMARY,
                padding: 0,
            }}
            onClick={() => {
                // TODO - open notifications panel
                console.log("Notifications clicked");
            }}
        >
            {/*TODO add badge with number of unread notifications and switch icon to filled version when there are unread notifications*/}
            <NotificationsIcon sx={{ fontSize: 40 }} />
        </IconButton>
    );
}

const NAV_ITEMS = [
    {label: "Home",    path: ROUTES.HOME},
    {label: "Groups",  path: ROUTES.GROUPS.LIST},
    {label: "Friends", path: "/friends"},
    {label: "Profile", path: ROUTES.USER.PROFILE},
];

export function Navigation() {
    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            paddingY={4}
            gap={10}
        >
            <NavLogo />
            <Box>
                {NAV_ITEMS.map((item) => (
                    <NavButton key={item.path} label={item.label} path={item.path}/>
                ))}
            </Box>
            <BellIcon />
        </Stack>
    );
}