import {useRegisterUser} from "../../hooks/useRegisterUser";
import {useForm} from "react-hook-form";
import {registerFormSchema, TRegisterForm} from "../../types/form/TRegisterForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {Box, TextField, Button, Typography} from "@mui/material";
import {COLORS} from "../../constants/colors";
import { FormattedMessage } from "react-intl";

type Props = {
    onSwitchToLogin: () => void;
}

export function RegistrationForm({ onSwitchToLogin }: Props) {
    const { mutate, isPending } = useRegisterUser({
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
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            bankAccount: {
                prefix: "",
                accountNumber: "",
                bankCode: "",
            },
        },
    })

    const onSubmit = (data: TRegisterForm) => {
        // Ensure Zod transforms ran (e.g., drop empty bankAccount)
        const parsed = registerFormSchema.parse(data);
        console.log("Submitting registration form with data:", parsed);
        mutate(parsed)
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
                label={<FormattedMessage id="register.firstName" />}
                type="text"
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
            />
            <TextField
                label={<FormattedMessage id="register.lastName" />}
                type="text"
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
            />
            <TextField
                label={<FormattedMessage id="login.email" />}
                type="text"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
            />
            <TextField
                label={<FormattedMessage id="login.password" />}
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
            />
            <TextField
                label={<FormattedMessage id="register.bankAccountPrefix" />}
                type="text"
                {...register("bankAccount.prefix")}
                error={!!errors.bankAccount?.prefix}
                helperText={errors.bankAccount?.prefix?.message}
            />
            <TextField
                label={<FormattedMessage id="register.bankAccountNumber" />}
                type="text"
                {...register("bankAccount.accountNumber")}
                error={!!errors.bankAccount?.accountNumber || !!(errors.bankAccount as any)?.message}
                helperText={errors.bankAccount?.accountNumber?.message ?? (errors.bankAccount as any)?.message}
            />
            <TextField
                label={<FormattedMessage id="register.bankCode" />}
                type="text"
                {...register("bankAccount.bankCode")}
                error={!!errors.bankAccount?.bankCode || !!(errors.bankAccount as any)?.message}
                helperText={errors.bankAccount?.bankCode?.message ?? (errors.bankAccount as any)?.message}
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
                {isPending ? (
                    <FormattedMessage id="register.submitting" />
                ) : (
                    <FormattedMessage id="register.submit" />
                )}
            </Button>
            <Typography sx={{ fontSize: 20 }}>
                <FormattedMessage id="register.haveAccount" />{" "}
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
                    <FormattedMessage id="register.loginCta" />
                </Button>
            </Typography>
        </Box>
    );
}