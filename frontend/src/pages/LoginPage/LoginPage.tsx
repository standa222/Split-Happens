import { useForm } from "react-hook-form"
import {useLogin} from "../../hooks/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import {loginFormSchema, TLoginForm} from "../../types/form/TLoginForm";
import { LoginForm } from "./LoginForm";
import { Stack} from "@mui/material";
import {COLORS} from "../../constants/colors";


export const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TLoginForm>({
        resolver: zodResolver(loginFormSchema)
    })

    const { mutate, isPending, isError, error } = useLogin();

    const onSubmit = (data: TLoginForm) => {
        console.log("Submitting login form with data:", data);
        mutate(data)
    }

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
                <LoginForm
                    onSubmit={handleSubmit(onSubmit)}
                    register={register}
                    errors={errors}
                    isPending={isPending}
                    isError={isError}
                />
            </Stack>
        </Stack>
  );
};