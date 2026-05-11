import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { COLORS } from "../constants/colors";
import { ROUTES } from "../enums/routes";
import logo from "../assets/logo_dark.png";
import {
  Box,
  Stack,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Badge,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useAuthStore } from "../store/authStore";
import { FormattedMessage } from "react-intl";
import { useLocaleStore } from "../store/localeStore";
import { useUnreadNotificationsCountQuery } from "../hooks/useNotifications";
import { NotificationsDrawer } from "./NotificationsDrawer";
import { ImageAvatar } from "./ImageAvatar";

type BellIconProps = {
  onClick: () => void;
};

function NavLogo() {
  return (
    <NavLink to={ROUTES.HOME} style={{ textDecoration: "none", color: "inherit" }}>
      <Stack direction="row" alignItems="center" gap={2}>
        <img src={logo} alt="Logo" style={{ height: 40, width: "auto" }} />
        <Typography
          sx={{
            color: COLORS.PRIMARY,
            typography: {
              xs: "h5",
              md: "h4",
            },
            fontWeight: {
              xs: 700,
              md: 700,
            },
          }}
        >
          SplitHappens
        </Typography>
      </Stack>
    </NavLink>
  );
}

function NavButton({ labelId, path }: { labelId: string; path: string }) {
  return (
    <NavLink
      to={path}
      style={({ isActive }) => ({
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

function BellIcon({ onClick }: BellIconProps) {
  const unread = useUnreadNotificationsCountQuery();
  const unreadCount = unread.data ?? 0;

  return (
    <IconButton
      aria-label="Notifications"
      sx={{
        color: COLORS.PRIMARY,
        padding: 0,
      }}
      onClick={onClick}
    >
      <Badge
        badgeContent={unreadCount}
        color="error"
        invisible={unreadCount === 0}
        overlap="circular"
      >
        <NotificationsIcon sx={{ fontSize: 40 }} />
      </Badge>
    </IconButton>
  );
}

export function LanguageSwitch({
  value,
  onChange,
}: {
  value: "en" | "cs";
  onChange: (v: "en" | "cs") => void;
}) {
  const options: Array<{ value: "en" | "cs"; label: string }> = [
    { value: "en", label: "EN" },
    { value: "cs", label: "CS" },
  ];

  const selectedIndex = options.findIndex((o) => o.value === value);
  const PILL_EXTRA_WIDTH_PX = 16;
  const pillCenter = selectedIndex <= 0 ? "25%" : "75%";

  const handleToggle = () => {
    const nextValue = value === "en" ? "cs" : "en";
    onChange(nextValue);
  };

  return (
    <Box
      component="button"
      type="button"
      onClick={handleToggle}
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
        cursor: "pointer",
        padding: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: pillCenter,
          transform: "translate(-50%, -50%)",
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
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              fontWeight: 600,
              color: isSelected ? COLORS.PRIMARY : COLORS.SECONDARY,
              pointerEvents: "none",
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
  { labelId: "nav.home", path: ROUTES.HOME },
  { labelId: "nav.groups", path: ROUTES.GROUPS.LIST },
  { labelId: "nav.friends", path: ROUTES.FRIENDS.LIST },
  { labelId: "nav.profile", path: ROUTES.USER.PROFILE },
];

export function Navigation() {
  const { logout, currentUser } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        paddingY={4}
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        <NavLogo />
        <Box>
          {NAV_ITEMS.map((item) => (
            <NavButton key={item.path} labelId={item.labelId} path={item.path} />
          ))}
        </Box>
        <Stack direction="row" gap={2} alignItems="center">
          <LanguageSwitch value={locale} onChange={setLocale} />
          <BellIcon onClick={() => setNotificationsOpen(true)} />
          <IconButton sx={{ color: COLORS.RED }} onClick={logout}>
            <LogoutIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        paddingY={2}
        sx={{ display: { xs: "flex", md: "none" } }}
      >
        <IconButton onClick={handleDrawerToggle} sx={{ color: COLORS.PRIMARY }}>
          <MenuIcon sx={{ fontSize: 35 }} />
        </IconButton>
        <NavLogo />
        <BellIcon onClick={() => setNotificationsOpen(true)} />
      </Stack>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        slotProps={{
          paper: {
            sx: {
              width: "80%",
              maxWidth: 300,
              backgroundColor: COLORS.PRIMARY,
              color: COLORS.SECONDARY,
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: COLORS.SECONDARY }}>
            <CloseIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Box>

        {currentUser && (
          <Stack direction="row" alignItems="center" gap={2} sx={{ px: 3, pb: 4 }}>
            <ImageAvatar type="user" id={currentUser.id} invertColors={true} />
            <Typography variant="h6" fontWeight={600}>
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
          </Stack>
        )}

        <List sx={{ flexGrow: 1, p: 0 }}>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  py: 2,
                  px: 3,
                  "&.active": {
                    backgroundColor: COLORS.SECONDARY,
                    color: COLORS.PRIMARY,
                  },
                }}
              >
                <Typography variant="h6" fontWeight={500}>
                  <FormattedMessage id={item.labelId} />
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem sx={{ px: 3, mt: 2 }}>
            <LanguageSwitch value={locale} onChange={setLocale} />
          </ListItem>
        </List>

        <Box
          component="button"
          onClick={() => {
            logout();
            handleDrawerToggle();
          }}
          sx={{
            width: "100%",
            backgroundColor: COLORS.RED,
            color: COLORS.SECONDARY,
            border: "none",
            py: 3,
            textAlign: "left",
            px: 3,
            cursor: "pointer",
            fontSize: "1.25rem",
          }}
        >
          <FormattedMessage id={"nav.logout"} />
        </Box>
      </Drawer>

      <NotificationsDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}
