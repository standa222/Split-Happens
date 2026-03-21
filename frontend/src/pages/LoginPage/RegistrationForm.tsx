import {useRegisterUser} from "../../hooks/useRegisterUser";
import {useForm} from "react-hook-form";
import {registerFormSchema, TRegisterForm} from "../../types/form/TRegisterForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {Box, TextField, Button, Typography} from "@mui/material";
import {COLORS} from "../../constants/colors";

type Props = {
    onSwitchToLogin: () => void;
}

export function RegistrationForm({ onSwitchToLogin }: Props) {
    const { mutate, isPending, isError, error } = useRegisterUser({
        onSuccess: () => {
            console.log("Registration successful, switching to login form");
            onSwitchToLogin();
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TRegisterForm>({
        resolver: zodResolver(registerFormSchema)
    })

    const onSubmit = (data: TRegisterForm) => {
        console.log("Submitting registration form with data:", data);
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
                label="First name"
                type="text"
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
            />
            <TextField
                label="Last name"
                type="text"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
            />
            <TextField
                label="Email"
                type="text"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
            />
            <TextField
                label="Password"
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
                disabled={isPending}
            >
                Register
            </Button>
            <Typography sx={{ fontSize: 20, }}>
                Already have an account?{" "}
                <Button
                    onClick={onSwitchToLogin}
                    sx={{
                        padding: 0,
                        minWidth: 0,
                        color: COLORS.PRIMARY,
                        fontWeight: 600,
                        fontSize: 20,
                        textTransform: "none",
                    }}
                >
                    Log in
                </Button>
            </Typography>
        </Box>
    );
}