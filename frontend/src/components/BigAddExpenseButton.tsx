import {Stack, Typography, Box, IconButton, TypographyVariant, Dialog, DialogContent} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { COLORS } from "../constants/colors";
import {useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import {AddExpenseForm} from "./AddExpenseForm";
import {TGroupDetail} from "../types/dto/TGroupDetail";

type Props = {
    variant: TypographyVariant;
    group?: TGroupDetail;
}

export function BigAddExpenseButton({ variant, group }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Stack
                component="button" // Makes the whole Stack semantically a button
                onClick={() => setOpen(true)}
                alignItems="center"
                spacing={2}
                sx={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "20px",
                    width: "100%",
                    transition: "transform 0.1s ease-in-out",
                    "&:hover": {
                        transform: "scale(1.05)", // Subtle feedback when hovering
                    },
                    "&:active": {
                        transform: "scale(0.95)",
                    },
                }}
            >
                <Typography
                    variant={variant}
                    sx={{
                        color: COLORS.PRIMARY,
                        fontWeight: 500,
                        textAlign: "center",
                    }}
                >
                    Add expense
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
            </Stack>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="lg"
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: COLORS.SECONDARY,
                            borderRadius: 10,
                            pt: 2,
                            border: `5px solid ${COLORS.PRIMARY}`,
                        },
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
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}