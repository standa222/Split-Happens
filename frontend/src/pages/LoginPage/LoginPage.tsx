import { LoginForm } from "./LoginForm";
import {Stack} from "@mui/material";
import {COLORS} from "../../constants/colors";
import {useState} from "react";
import {RegistrationForm} from "./RegistrationForm";

type ShowForm = "login" | "register";

export const LoginPage = () => {
    const [showForm, setShowForm] = useState<ShowForm>("login");

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
                    />
                )}
            </Stack>
        </Stack>
  );
};