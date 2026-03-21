import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material"
import {COLORS} from "../../constants/colors";
import {useLogin} from "../../hooks/useLogin";
import {loginFormSchema, TLoginForm} from "../../types/form/TLoginForm";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useIntl} from "react-intl";

type Props = {
    onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: Props) {
    const intl = useIntl();
    const { mutate, isPending, isError, error } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TLoginForm>({
        resolver: zodResolver(loginFormSchema)
    })

    const onSubmit = (data: TLoginForm) => {
        console.log("Submitting login form with data:", data);
        mutate(data)
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            display="flex"
            flexDirection="column"
            gap={2}
        >
            <TextField
                label={intl.formatMessage({ id: "login.email" })}
                type="text"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
            />

            <TextField
                label={intl.formatMessage({ id: "login.password" })}
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
            />
            <Button
                sx={{
                    padding: "10px 30px",
                    borderRadius: 800,
                    backgroundColor: COLORS.PRIMARY,
                    color: COLORS.SECONDARY,
                    fontWeight: 600,
                    transition: "background-color 0.15s, color 0.15s",
                    whiteSpace: "nowrap",
                }}
                type="submit"
                variant="contained"
                fullWidth
                disabled={isPending}
                startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
            >
                {isPending
                    ? intl.formatMessage({ id: "login.submitting" })
                    : intl.formatMessage({ id: "login.submit" })
                }
            </Button>
            <Typography sx={{ fontSize: 20, }}>
                {intl.formatMessage({ id: "login.noAccount" })}{" "}
                <Button
                    onClick={onSwitchToRegister}
                    sx={{
                        padding: 0,
                        minWidth: 0,
                        color: COLORS.PRIMARY,
                        fontWeight: 600,
                        fontSize: 20,
                        textTransform: "none",
                    }}
                >
                    {intl.formatMessage({ id: "login.signUp" })}
                </Button>
            </Typography>
        </Box>
    );
}