import { TextField } from "@mui/material";

type Props = {
    label: string;
    type?: string;
    error?: boolean;
    helperText?: string;
}

export const TextInput = ({ label, type, error, helperText, ...restProps }: Props) => {
    return (
        <TextField
            label={label}
            type={type}
            fullWidth
            error={!!error}
            helperText={helperText}
            {...restProps}
        />
    );
}