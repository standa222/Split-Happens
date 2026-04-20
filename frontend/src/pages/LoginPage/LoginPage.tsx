import { LoginForm } from "./LoginForm";
import {Stack, Box} from "@mui/material";
import {COLORS} from "../../constants/colors";
import {useState} from "react";
import {RegistrationForm} from "./RegistrationForm";
import {AppSnackbar} from "../../components/AppSnackbar";
import {useLocaleStore} from "../../store/localeStore";
import {LanguageSwitch} from "../../components/Navigation";

type ShowForm = "login" | "register";

type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error";
}

export const LoginPage = () => {
    const [showForm, setShowForm] = useState<ShowForm>("login");
    const [snackbar, setSnackbar] = useState<SnackbarState>({open: false, message: "", severity: "success"});
    const locale = useLocaleStore((s) => s.locale);
    const setLocale = useLocaleStore((s) => s.setLocale);

    return (
        <Stack
            alignItems="center"
            sx = {{
                minHeight: "100vh",
                background: COLORS.SECONDARY,
                color: COLORS.PRIMARY,
            }}
            justifyContent="center"
        >
            <Box
                sx={{
                    position: "absolute",
                    top: { xs: 16, md: 24 },
                    right: { xs: 16, md: 100 },
                    zIndex: 10,
                }}
            >
                <LanguageSwitch value={locale} onChange={setLocale} />
            </Box>

            <Stack
                sx={{
                    width: { xs: "90%", sm: "70%", md: "25%" }
                }}
            >
                {showForm === "login" ? (
                    <LoginForm
                        onSwitchToRegister={() => setShowForm("register")}
                    />
                ) : (
                    <RegistrationForm
                        onSwitchToLogin={() => setShowForm("login")}
                        onRegisterSuccess={(message) => setSnackbar({open: true, severity: "success", message})}
                        onRegisterError={(message) => setSnackbar({open: true, severity: "error", message})}
                    />
                )}
            </Stack>

            <AppSnackbar
                open={snackbar.open}
                onClose={() => setSnackbar((s) => ({...s, open: false}))}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Stack>
  );
};