import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material"
import {COLORS} from "../../constants/colors";

type Props = {
    onSubmit: (data) => void;
    errors: any;
    isPending: boolean;
    isError: boolean;
    register: any;
}

export function LoginForm({ register, onSubmit, errors, isPending, isError }: Props) {
    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
                fontFamily: 'Work Sans, sans-serif',
            }}
        >
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
                variant="contained"
                fullWidth
                disabled={isPending}
                startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
            >
                {isPending ? "Logging in..." : "Login"}
            </Button>
            <Typography>
                Don't have an account? <a href="/signup">Sign up</a>
            </Typography>
        </Box>
    );
}