import {createTheme} from "@mui/material";
import {COLORS} from "../constants/colors";

export const theme = createTheme({
    typography: {
        fontFamily: "Work Sans, sans-serif",
        allVariants: {
            color: COLORS.PRIMARY
        }
    },
    components: {
        // 1. Styling the container and the label position
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                // InputLabelProps: { shrink: true },
            },
        },
        // 2. Styling the "Pill" box
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 800,
                    backgroundColor: 'transparent',
                    '& fieldset': {
                        borderColor: COLORS.PRIMARY,
                        borderWidth: '1.5px',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.PRIMARY,
                        borderWidth: '2px',
                    },
                    // autofill
                    '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 100px #f4f1ea inset',
                        WebkitTextFillColor: COLORS.PRIMARY,
                        transition: 'background-color 5000s ease-in-out 0s',
                    },
                },
                input: {
                    color: COLORS.PRIMARY,
                    '&::placeholder': {
                        color: COLORS.PRIMARY,
                        opacity: 0.7,
                    },
                },
            },
        },
        // 3. Styling the Label to sit above the input
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: COLORS.PRIMARY,
                    fontWeight: 700,
                    fontSize: '1rem',
                    '&.Mui-focused': {
                        color: COLORS.PRIMARY,
                    },
                },
            },
        },

        // Radio color
        MuiRadio: {
            styleOverrides: {
                root: {
                    color: COLORS.PRIMARY,
                    "&.Mui-checked": {
                        color: COLORS.PRIMARY,
                    },
                },
            },
        },
    },
});