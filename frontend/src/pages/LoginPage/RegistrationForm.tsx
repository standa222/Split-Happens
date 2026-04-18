import {useRegisterUser} from "../../hooks/useRegisterUser";
import {useForm} from "react-hook-form";
import {registerFormSchema, TRegisterForm} from "../../types/form/TRegisterForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {Box, TextField, Button, Typography} from "@mui/material";
import {COLORS} from "../../constants/colors";
import { FormattedMessage, useIntl } from "react-intl";
import { tError } from "../../utils/localeUtils";
import {formatApiError} from "../../utils/apiErrorUtils";

type Props = {
    onSwitchToLogin: () => void;
    onRegisterSuccess?: (message: string) => void;
    onRegisterError?: (message: string) => void;
}

export function RegistrationForm({ onSwitchToLogin, onRegisterSuccess, onRegisterError }: Props) {
    const intl = useIntl();

    const { mutate, isPending } = useRegisterUser({
        onSuccess: () => {
            onRegisterSuccess?.(
                intl.formatMessage({
                    id: "auth.register.success",
                    defaultMessage: "Registration successful. You can log in now.",
                })
            );
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
        const parsed = registerFormSchema.parse(data);
        mutate(parsed, {
            onError: (error) => {
                onRegisterError?.(formatApiError(intl, error));
                console.error('Error registering user:', error);
            },
        });
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
                required={true}
                {...register("firstName")}
                error={!!errors.firstName}
                helperText={tError(intl, errors.firstName?.message)}
            />
            <TextField
                label={<FormattedMessage id="register.lastName" />}
                type="text"
                required={true}
                {...register("lastName")}
                error={!!errors.lastName}
                helperText={tError(intl, errors.lastName?.message)}
            />
            <TextField
                label={<FormattedMessage id="login.email" />}
                type="text"
                required={true}
                {...register("email")}
                error={!!errors.email}
                helperText={tError(intl, errors.email?.message)}
            />
            <TextField
                label={<FormattedMessage id="login.password" />}
                type="password"
                required={true}
                {...register("password")}
                error={!!errors.password}
                helperText={tError(intl, errors.password?.message)}
            />
            <TextField
                label={<FormattedMessage id="register.bankAccountPrefix" />}
                type="text"
                {...register("bankAccount.prefix")}
                error={!!errors.bankAccount?.prefix}
                helperText={tError(intl, errors.bankAccount?.prefix?.message)}
            />
            <TextField
                label={<FormattedMessage id="register.bankAccountNumber" />}
                type="text"
                {...register("bankAccount.accountNumber")}
                error={!!errors.bankAccount?.accountNumber}
                helperText={tError(intl, errors.bankAccount?.accountNumber?.message)}
            />
            <TextField
                label={<FormattedMessage id="register.bankCode" />}
                type="text"
                {...register("bankAccount.bankCode")}
                error={!!errors.bankAccount?.bankCode}
                helperText={tError(intl, errors.bankAccount?.bankCode?.message)}
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