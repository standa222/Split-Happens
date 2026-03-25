import {NavLink} from "react-router-dom";
import {COLORS} from "../constants/colors";
import {ROUTES} from "../enums/routes";
import logo from "../assets/logo_dark.png";
import {Box, Stack, IconButton, Typography} from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import {useAuthStore} from "../store/authStore";
import {FormattedMessage} from "react-intl";
import { useLocaleStore } from "../store/localeStore";

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

function NavButton({labelId, path}: { labelId: string; path: string }) {
    return (
        <NavLink
            to={path}
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
            <FormattedMessage id={labelId} />
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
            <NotificationsIcon sx={{fontSize: 40}}/>
        </IconButton>
    );
}

interface LogoutButtonProps {
    logout?: () => void
}

const LogoutButton = ({ logout }: LogoutButtonProps) => {
    return (
        <IconButton
            aria-label="Logout"
            sx={{
                color: COLORS.RED,
                padding: 0,
            }}
            onClick={logout}
        >
            <LogoutIcon sx={{fontSize: 40}}/>
        </IconButton>
    );
}

function LanguageSwitch({ value, onChange }: { value: "en" | "cs"; onChange: (v: "en" | "cs") => void }) {
    const options: Array<{ value: "en" | "cs"; label: string }> = [
        { value: "en", label: "EN" },
        { value: "cs", label: "CS" },
    ];

    const selectedIndex = options.findIndex((o) => o.value === value);
    // Keep pill fully inside border and perfectly symmetric.
    const PILL_EXTRA_WIDTH_PX = 16; // makes it wider than 50% segment

    // Center of selected segment: 25% for EN, 75% for CS.
    const pillCenter = selectedIndex <= 0 ? "25%" : "75%";

    return (
        <Box
            sx={{
                position: "relative",
                width: 110,
                height: 44,
                border: `2px solid ${COLORS.PRIMARY}`,
                borderRadius: 999,
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor: COLORS.PRIMARY,
                flexShrink: 0,
                userSelect: "none",
            }}
        >
            {/* Moving pill */}
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: pillCenter,
                    transform: "translate(-50%, -50%)",
                    // Wider pill while still remaining fully inside due to centering.
                    width: `calc(50% + ${PILL_EXTRA_WIDTH_PX}px)`,
                    height: `calc(100%)`,
                    borderRadius: 999,
                    backgroundColor: COLORS.SECONDARY,
                    transition: "left 180ms ease",
                    zIndex: 0,
                }}
            />

            {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                    <Box
                        key={opt.value}
                        component="button"
                        type="button"
                        onClick={() => onChange(opt.value)}
                        sx={{
                            border: "none",
                            padding: 2,
                            background: "transparent",
                            cursor: "pointer",
                            zIndex: 1,
                            fontWeight: 600,
                            color: isSelected ? COLORS.PRIMARY : COLORS.SECONDARY,
                        }}
                    >
                        {opt.label}
                    </Box>
                );
            })}
        </Box>
    );
}

const NAV_ITEMS = [
    {labelId: "nav.home",    path: ROUTES.HOME},
    {labelId: "nav.groups",  path: ROUTES.GROUPS.LIST},
    {labelId: "nav.friends", path: ROUTES.FRIENDS.LIST},
    {labelId: "nav.profile", path: ROUTES.USER.PROFILE},
];

export function Navigation() {
    const {logout} = useAuthStore();
    const locale = useLocaleStore((s) => s.locale);
    const setLocale = useLocaleStore((s) => s.setLocale);

    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            justifyContent="space-between"
            paddingY={4}
            gap={10}
        >
            <NavLogo/>
            <Box>
                {NAV_ITEMS.map((item) => (
                    <NavButton key={item.path} labelId={item.labelId} path={item.path}/>
                ))}
            </Box>
            <Stack direction="row" gap={2} alignItems="center">
                <LanguageSwitch value={locale} onChange={setLocale} />
                <BellIcon/>
                <LogoutButton logout={logout}/>
            </Stack>
        </Stack>
    );
}