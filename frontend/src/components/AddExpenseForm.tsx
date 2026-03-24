import {useEffect, useMemo, useState} from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { COLORS } from "../constants/colors";
import {TGroupDetail} from "../types/dto/TGroupDetail";
import {Controller, useForm} from "react-hook-form";
import {addExpenseFormSchema, TAddExpenseForm} from "../types/form/TAddExpenseForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {useGroupDetail, useGroupsQuery} from "../hooks/useGroupsQuery";
import {TUser} from "../types/TUser";
import {useAddExpense} from "../hooks/useAddExpense";
import {useEditExpense} from "../hooks/useEditExpense";
import {favCurrencies} from "../utils/currencyUtils";
import { FormattedMessage } from "react-intl";
import {TTransaction} from "../types/TTransaction";

type Props = {
    onClose?: () => void;
    initGroup?: TGroupDetail;
    initTransaction?: TTransaction;
};

type Mode = "fixed" | "partial" | "percentage";

type RowState = {
    paidEnabled: boolean;
    paidValue: number;
    splitEnabled: boolean;
    splitValue: number;
};

const asModeValue = (mode: Mode, value: number) => {
    const n = Number.isFinite(value) ? value : 0;
    if (mode === "fixed") return { fixed: n } as const;
    if (mode === "partial") return { partial: n } as const;
    return { percentage: n } as const;
};

const unitAdornment = (mode: Mode) => {
    if (mode === "fixed") return <InputAdornment position="end">$</InputAdornment>;
    if (mode === "partial") return <InputAdornment position="end">parts</InputAdornment>;
    if (mode === "percentage") return <InputAdornment position="end">%</InputAdornment>;
    return null;
}

export const AddExpenseForm = ({ onClose, initGroup, initTransaction }: Props) => {
    const isEditMode = Boolean(initTransaction);

    const [paidMode, setPaidMode] = useState<Mode>("fixed");
    const [splitMode, setSplitMode] = useState<Mode>("fixed");
    const [groupId, setGroupId] = useState<number>(initGroup?.id ?? 0);
    const [participants, setParticipants] = useState(initGroup?.members || []);
    const [rowState, setRowState] = useState<Record<number, RowState>>({});
    const { data: fetchedGroups, isLoading: isGroupsLoading, isError: isGroupError } = useGroupsQuery();
    const groups = useMemo(() => {
        if (isGroupsLoading || isGroupError || !fetchedGroups) return [];
        return [...fetchedGroups.activeGroups, ...fetchedGroups.inactiveGroups];
    }, [isGroupsLoading, isGroupError, fetchedGroups]);
    const { data: groupDetail } = useGroupDetail(groupId);

    useEffect(() => {
        setParticipants(groupDetail?.members || []);
    }, [groupDetail]);

    const { mutate: createMutate, isPending: isCreatePending } = useAddExpense({
        onSuccess: () => onClose?.(),
    });

    const { mutate: editMutate, isPending: isEditPending } = useEditExpense({
        onSuccess: () => onClose?.(),
    });

    const isPending = isEditMode ? isEditPending : isCreatePending;

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TAddExpenseForm>({
        resolver: zodResolver(addExpenseFormSchema),
        defaultValues: {
            title: initTransaction?.title ?? "",
            category: "",
            groupId: initGroup?.id ?? 0,
            totalAmount: initTransaction?.totalAmount ?? 0,
            currency: initGroup?.defaultCurrency ?? "",
            paidBy: [],
            splitBetween: [],
            transactionType: "EXPENSE",
        },
    });

    useEffect(() => {
        if (!initTransaction) return;

        // Force group context for edit mode.
        setGroupId(initGroup?.id ?? 0);
        reset((prev) => ({
            ...prev,
            groupId: initGroup?.id ?? prev.groupId,
            currency: initGroup?.defaultCurrency ?? prev.currency,
            title: initTransaction.title,
            totalAmount: initTransaction.totalAmount,
            transactionType: initTransaction.transactionType === "PAYMENT" ? "PAYMENT" : "EXPENSE",
        }));

        // Build rowState from balance changes: positive -> paidBy enabled, negative -> split enabled.
        const nextRowState: Record<number, RowState> = {};
        for (const item of initTransaction.items) {
            nextRowState[item.user.id] = {
                paidEnabled: item.balanceChange > 0,
                paidValue: item.balanceChange > 0 ? item.balanceChange : 0,
                splitEnabled: item.balanceChange < 0,
                splitValue: item.balanceChange < 0 ? Math.abs(item.balanceChange) : 0,
            };
        }
        setRowState(nextRowState);
    }, [initTransaction, initGroup?.id, initGroup?.defaultCurrency, reset]);

    const onSubmit = (data: TAddExpenseForm) => {
        const paidBy: TAddExpenseForm["paidBy"] = (participants as unknown as TUser[])
            .map((u) => ({u, s: rowState[u.id]}))
            .filter((x): x is { u: TUser; s: RowState } => !!x.s?.paidEnabled)
            .map(({u, s}) => ({
                userId: u.id,
                ...asModeValue(paidMode, s.paidValue),
            }));

        const splitBetween: TAddExpenseForm["splitBetween"] = (participants as unknown as TUser[])
            .map((u) => ({u, s: rowState[u.id]}))
            .filter((x): x is { u: TUser; s: RowState } => !!x.s?.splitEnabled)
            .map(({u, s}) => ({
                userId: u.id,
                ...asModeValue(splitMode, s.splitValue),
            }));

        const payload: TAddExpenseForm = {
            ...data,
            paidBy,
            splitBetween,
            transactionType: "EXPENSE",
        };

        if (isEditMode) {
            editMutate({ transactionId: initTransaction!.id, data: payload });
        } else {
            createMutate(payload);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, pb: 2, backgroundColor: COLORS.SECONDARY }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY, mb: 2 }}>
                <FormattedMessage id={isEditMode ? "expense.edit.title" : "expense.add.title"} />
            </Typography>

            <Stack>
                <Box display="flex" gap={3} alignItems="center">
                    <Stack flex={1}>
                        <TextField
                            label={<FormattedMessage id="expense.fields.title" />}
                            size="small"
                            {...register("title")}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />
                    </Stack>

                    <Stack flex={1}>
                        <Controller
                            name="category"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    label={<FormattedMessage id="expense.fields.category" />}
                                    select
                                    size="small"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    error={!!errors.category}
                                    helperText={errors.category?.message}
                                >
                                    <MenuItem value="Fun"><FormattedMessage id="expense.category.fun" /></MenuItem>
                                    <MenuItem value="Food"><FormattedMessage id="expense.category.food" /></MenuItem>
                                    <MenuItem value="Transport"><FormattedMessage id="expense.category.transport" /></MenuItem>
                                    <MenuItem value="Utilities"><FormattedMessage id="expense.category.utilities" /></MenuItem>
                                </TextField>
                            )}
                        />
                    </Stack>

                    <Stack flex={1}>
                        <FormControl>
                            <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                <FormattedMessage id="expense.mode.paidBy" />
                            </FormLabel>
                            <RadioGroup row value={paidMode} onChange={(e) => setPaidMode(e.target.value as Mode)}>
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.fixed" />} />
                                <FormControlLabel value="partial" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.partial" />} />
                                <FormControlLabel value="percentage" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.percentage" />} />
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </Box>

                <Box display="flex" gap={3} mt={2} alignItems="center">
                    <Stack flex={1}>
                        <Controller
                            name="groupId"
                            control={control}
                            defaultValue={initGroup?.id ?? 0}
                            render={({ field }) => (
                                <Autocomplete
                                    size="small"
                                    options={groups}
                                    getOptionLabel={(o) => o.name}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    value={groups.find((g) => g.id === (field.value ?? 0)) ?? null}
                                    onChange={(_, selected) => {
                                        if (isEditMode) return;
                                        field.onChange(selected?.id ?? 0);
                                        setGroupId(selected?.id ?? 0);
                                    }}
                                    onBlur={field.onBlur}
                                    filterOptions={(options, state) => {
                                        const q = state.inputValue.trim().toLowerCase();
                                        if (!q) return options;
                                        return options.filter((o) => o.name.toLowerCase().includes(q));
                                    }}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} key={option.id}>
                                            {option.name}
                                        </Box>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={<FormattedMessage id="expense.fields.group" />}
                                            inputRef={field.ref}
                                            error={!!errors.groupId}
                                            helperText={errors.groupId?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Stack>

                    <Box display="flex" gap={3} flex={1} alignItems="center">
                        <Stack flex={1}>
                            <TextField
                                label={<FormattedMessage id="expense.fields.amount" />}
                                size="small"
                                {...register("totalAmount", { valueAsNumber: true })}
                                error={!!errors.totalAmount}
                                helperText={errors.totalAmount?.message}
                            />
                        </Stack>

                        <Stack flex={1}>
                            <Controller
                                name="currency"
                                control={control}
                                defaultValue={initGroup?.defaultCurrency ?? ""}
                                render={({ field }) => (
                                    <Autocomplete
                                        size="small"
                                        options={favCurrencies}
                                        getOptionLabel={(o) => `${o.code}`}
                                        filterOptions={(options, state) => {
                                            const q = state.inputValue.trim().toLowerCase();
                                            if (!q) return options;
                                            return options.filter(
                                                (o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q),
                                            );
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                label={<FormattedMessage id="expense.fields.currency" />}
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                inputRef={field.ref}
                                                error={!!errors.currency}
                                                helperText={errors.currency?.message}
                                                {...params}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Stack>
                    </Box>

                    <Stack flex={1}>
                        <FormControl>
                            <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                <FormattedMessage id="expense.mode.splitBetween" />
                            </FormLabel>
                            <RadioGroup row value={splitMode} onChange={(e) => setSplitMode(e.target.value as Mode)}>
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.fixed" />} />
                                <FormControlLabel value="partial" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.partial" />} />
                                <FormControlLabel value="percentage" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.percentage" />} />
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </Box>
            </Stack>

            <Box sx={{ mt: 3.5 }}>
                <Grid
                    container
                    alignItems="center"
                    columnSpacing={2.5}  // controls horizontal gaps (incl. between paid input and split checkbox)
                    rowSpacing={1.5}
                >
                    {/* Header row */}
                    <Grid size={3.5}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="expense.whoIsInvolved" />
                        </Typography>
                    </Grid>

                    <Grid
                        size={0.7}
                        sx={{
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: COLORS.PRIMARY,
                                fontWeight: 800,
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                whiteSpace: "nowrap",
                                width: "max-content",
                                overflow: "visible",
                                textAlign: "center",
                                pointerEvents: "none",
                            }}
                        >
                            <FormattedMessage id="expense.paidByHeader" />
                        </Typography>
                    </Grid>

                    <Grid size={3.3} />

                    <Grid
                        size={0.7}
                        sx={{
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: COLORS.PRIMARY,
                                fontWeight: 800,
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                whiteSpace: "nowrap",
                                width: "max-content",
                                overflow: "visible",
                                textAlign: "center",
                                pointerEvents: "none",
                            }}
                        >
                            <FormattedMessage id="expense.splitBetweenHeader" />
                        </Typography>
                    </Grid>

                    <Grid size={3.3} /> {/* split input header spacer */}

                    {/* Rows */}
                    {(participants as unknown as TUser[]).map((u) => {
                        const s: RowState = rowState[u.id] ?? {
                            paidEnabled: false,
                            paidValue: 0,
                            splitEnabled: true,
                            splitValue: 0,
                        };

                        return (
                            <Box key={u.id} component="div" sx={{ display: "contents" }}>
                                <Grid size={3.5}>
                                    <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 600 }}>
                                        {u.firstName ?? ""} {u.lastName ?? ""}
                                    </Typography>
                                </Grid>

                                <Grid size={0.7} sx={{ display: "flex", justifyContent: "center" }}>
                                    <Checkbox
                                        checked={s.paidEnabled}
                                        onChange={(e) =>
                                            setRowState((prev) => ({
                                                ...prev,
                                                [u.id]: { ...s, paidEnabled: e.target.checked },
                                            }))
                                        }
                                        sx={{ color: COLORS.PRIMARY, "&.Mui-checked": { color: COLORS.PRIMARY } }}
                                    />
                                </Grid>

                                <Grid size={3.3}>
                                    <TextField
                                        size="small"
                                        inputMode="decimal"
                                        disabled={!s.paidEnabled}
                                        value={s.paidEnabled ? s.paidValue : ""}
                                        onChange={(e) =>
                                            setRowState((prev) => ({
                                                ...prev,
                                                [u.id]: { ...s, paidValue: Number(e.target.value) },
                                            }))
                                        }
                                        slotProps={{
                                            input: {
                                                endAdornment: unitAdornment(paidMode)
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid size={0.7} sx={{ display: "flex", justifyContent: "center" }}>
                                    <Checkbox
                                        checked={s.splitEnabled}
                                        onChange={(e) =>
                                            setRowState((prev) => ({
                                                ...prev,
                                                [u.id]: { ...s, splitEnabled: e.target.checked },
                                            }))
                                        }
                                        sx={{ color: COLORS.PRIMARY, "&.Mui-checked": { color: COLORS.PRIMARY } }}
                                    />
                                </Grid>

                                <Grid size={3.3}>
                                    <TextField
                                        size="small"
                                        inputMode="decimal"
                                        disabled={!s.splitEnabled}
                                        value={s.splitEnabled ? s.splitValue : ""}
                                        onChange={(e) =>
                                            setRowState((prev) => ({
                                                ...prev,
                                                [u.id]: { ...s, splitValue: Number(e.target.value) },
                                            }))
                                        }
                                        slotProps={{
                                            input: {
                                                endAdornment: unitAdornment(splitMode)
                                            }
                                        }}
                                    />
                                </Grid>
                            </Box>
                        );
                    })}
                </Grid>
            </Box>

            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        px: 6,
                        py: 1.5,
                        borderRadius: 999,
                        textTransform: "none",
                        fontWeight: 700,
                        backgroundColor: COLORS.PRIMARY,
                        color: COLORS.SECONDARY,
                    }}
                    disabled={isPending}
                >
                    {isPending ? (
                        <FormattedMessage id={isEditMode ? "expense.action.saving" : "expense.action.adding"} />
                    ) : (
                        <FormattedMessage id={isEditMode ? "expense.action.save" : "expense.action.add"} />
                    )}
                </Button>
            </Box>
        </Box>
    );
};
