import { LoginForm } from "./LoginForm";
import {Stack} from "@mui/material";
import {COLORS} from "../../constants/colors";
import {useState} from "react";
import {RegistrationForm} from "./RegistrationForm";
import {AppSnackbar} from "../../components/AppSnackbar";

type ShowForm = "login" | "register";

type SnackbarState = {
    open: boolean;
    message: string;
    severity: "success" | "error";
}

export const LoginPage = () => {
    const [showForm, setShowForm] = useState<ShowForm>("login");
    const [snackbar, setSnackbar] = useState<SnackbarState>({open: false, message: "", severity: "success"});

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
            <Stack maxWidth="50%">
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