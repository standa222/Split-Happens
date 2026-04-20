import {Stack, Typography, Box, IconButton, TypographyVariant, Dialog, DialogContent, useMediaQuery} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { COLORS } from "../constants/colors";
import {useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import {AddExpenseForm} from "./AddExpenseForm";
import {TGroupDetail} from "../types/dto/TGroupDetail";
import { FormattedMessage, useIntl } from "react-intl";
import { AppSnackbar } from "./AppSnackbar";

type ButtonSize = "small" | "large";

type Props = {
    variant: TypographyVariant | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', TypographyVariant>>;
    group?: TGroupDetail;
    direction?: "row" | "column";
    size?: ButtonSize | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', ButtonSize>>;
}

export function AddExpenseButton({
    variant,
    group,
    direction = "column",
    size = "large",
}: Props) {
    const [open, setOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successMessageId, setSuccessMessageId] = useState<string>("expense.add.success");
    const intl = useIntl();
    const isMobile = useMediaQuery('(max-width:899px)');

    const resolvedVariant: TypographyVariant = typeof variant === 'string'
        ? variant
        : (variant.md ?? variant.sm ?? variant.xs ?? 'h4');

    const resolvedSize: ButtonSize = typeof size === 'string'
        ? size
        : (isMobile ? (size.xs ?? size.sm ?? 'small') : (size.md ?? size.lg ?? size.xl ?? 'large'));

    return (
        <>
            <Stack
                component="button"
                onClick={() => setOpen(true)}
                alignItems="center"
                direction={direction}
                spacing={2}
                sx={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: {xs: 0, md: 0},
                    width: "100%",
                    transition: "transform 0.1s ease-in-out",
                    "&:hover": {
                        transform: "scale(1.05)",
                    },
                    "&:active": {
                        transform: "scale(0.95)",
                    },
                }}
            >
                {resolvedSize === "large" && (
                    <>
                        <Typography
                            variant={resolvedVariant}
                            sx={{
                                color: COLORS.PRIMARY,
                                fontWeight: 500,
                                textAlign: "center",
                            }}
                        >
                            <FormattedMessage id="expense.action.add" />
                        </Typography>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                backgroundColor: COLORS.PRIMARY,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <AddIcon sx={{ color: COLORS.SECONDARY, fontSize: 50 }} />
                        </Box>
                    </>
                )}
                {resolvedSize === "small" && (
                    <>
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: COLORS.PRIMARY,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <AddIcon sx={{ color: COLORS.SECONDARY, fontSize: 18 }} />
                        </Box>
                        <Typography
                            variant={resolvedVariant}
                            sx={{
                                color: COLORS.PRIMARY,
                                fontWeight: 500,
                                textAlign: "center",
                            }}
                        >
                            <FormattedMessage id="expense.action.add" />
                        </Typography>
                    </>
                )}
            </Stack>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullScreen={isMobile}
                fullWidth
                maxWidth="sm"
                sx={{
                    '& .MuiDialog-paper': {
                        width: { xs: '100%', md: 'auto' },
                        maxWidth: { xs: '100%', md: '1200px' },
                        borderRadius: { xs: 0, md: 10 },
                        height: { xs: '100dvh', md: 'auto' },
                    },
                }}
            >
                <IconButton
                    aria-label="close"
                    onClick={() => setOpen(false)}
                    sx={{ position: "absolute", right: 12, top: 12, color: COLORS.PRIMARY }}
                >
                    <CloseIcon sx={{ fontSize: 40 }} />
                </IconButton>

                <DialogContent>
                    <AddExpenseForm
                        initGroup={group}
                        onClose={() => setOpen(false)}
                        onSuccess={(mode) => {
                            setSuccessMessageId(mode === "edit" ? "expense.edit.success" : "expense.add.success");
                            setSuccessOpen(true);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <AppSnackbar
                open={successOpen}
                onClose={() => setSuccessOpen(false)}
                severity={"success"}
                message={intl.formatMessage({ id: successMessageId, defaultMessage: successMessageId })}
            />
        </>
    );
}