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
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { COLORS } from "../constants/colors";
import {TGroupDetail} from "../types/dto/TGroupDetail";
import {Controller, useForm, useWatch} from "react-hook-form";
import {addExpenseFormSchema, TAddExpenseForm} from "../types/form/TAddExpenseForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {useGroupDetail, useGroupsQuery} from "../hooks/useGroupsQuery";
import {TUser} from "../types/TUser";
import {useAddExpense} from "../hooks/useAddExpense";
import {useEditExpense} from "../hooks/useEditExpense";
import {favCurrencies, getCurrencySymbol} from "../utils/currencyUtils";
import {FormattedMessage, useIntl} from "react-intl";
import {TTransaction} from "../types/TTransaction";
import {tError} from "../utils/localeUtils";
import {AppSnackbar} from "./AppSnackbar";
import {formatApiError} from "../utils/apiErrorUtils";
import {categories} from "../utils/categoryUtils";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

type Props = {
    onClose?: () => void;
    initGroup?: TGroupDetail;
    initTransaction?: TTransaction;
    onSuccess?: (mode: "create" | "edit") => void;
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

const unitAdornment = (mode: Mode, currencyCode?: string) => {
    if (mode === "fixed") return <InputAdornment position="end">{getCurrencySymbol(currencyCode ?? "")}</InputAdornment>;
    if (mode === "partial") return <InputAdornment position="end">parts</InputAdornment>;
    if (mode === "percentage") return <InputAdornment position="end">%</InputAdornment>;
    return null;
}

type ParticipantView = 'paid' | 'split';

export const AddExpenseForm = ({ onClose, initGroup, initTransaction, onSuccess }: Props) => {
    const isEditMode = Boolean(initTransaction);

    const [paidMode, setPaidMode] = useState<Mode>("fixed");
    const [splitMode, setSplitMode] = useState<Mode>("fixed");
    const [groupId, setGroupId] = useState<number>(initGroup?.id ?? 0);
    const [rowState, setRowState] = useState<Record<number, RowState>>({});
    const [participantView, setParticipantView] = useState<ParticipantView>('split');
    const [errorOpen, setErrorOpen] = useState(false);
    const intl = useIntl();

    const { data: fetchedGroups, isLoading: isGroupsLoading, isError: isGroupError } = useGroupsQuery();
    const groups = useMemo(() => {
        if (isGroupsLoading || isGroupError || !fetchedGroups) return [];
        return [...fetchedGroups.activeGroups, ...fetchedGroups.inactiveGroups];
    }, [isGroupsLoading, isGroupError, fetchedGroups]);
    const { data: groupDetail } = useGroupDetail(groupId);
    const currentMembers = groupDetail?.members || initGroup?.members || [];

    useEffect(() => {
        if (groupDetail?.members && !isEditMode) {
            const initialParticipants = groupDetail.members;

            // Initialize rowState: All checkboxes for "Split" are TRUE, "Paid" are FALSE
            const nextRowState: Record<number, RowState> = {};
            initialParticipants.forEach((u) => {
                nextRowState[u.id] = {
                    paidEnabled: false,
                    paidValue: 0,
                    splitEnabled: true,
                    splitValue: 0,
                };
            });
            setRowState(nextRowState);
        }
    }, [groupDetail, isEditMode]);

    const { mutate: createMutate, isPending: isCreatePending, error: createError } = useAddExpense({
        onSuccess: () => {
            onSuccess?.("create");
            onClose?.();
        },
        onError: () => setErrorOpen(true),
    });

    const { mutate: editMutate, isPending: isEditPending, error: editError } = useEditExpense({
        onSuccess: () => {
            onSuccess?.("edit");
            onClose?.();
        },
        onError: () => setErrorOpen(true),
    });

    const apiError = (isEditMode ? editError : createError) as unknown;

    const isPending = isEditMode ? isEditPending : isCreatePending;
    const isFriendGroup = initGroup?.groupType === "FRIEND";

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<TAddExpenseForm>({
        resolver: zodResolver(addExpenseFormSchema),
        defaultValues: {
            title: initTransaction?.title ?? "",
            expenseCategory: initTransaction?.expenseCategory ?? "",
            groupId: initGroup?.id ?? 0,
            totalAmount: initTransaction?.totalAmount ?? 0,
            currency: initGroup?.defaultCurrency ?? "",
            paidBy: [],
            splitBetween: [],
            transactionType: "EXPENSE",
        },
    });

    const [currency, totalAmount] = useWatch({
        control,
        name: ["currency", "totalAmount"]
    });

    useEffect(() => {
        if (isEditMode && initTransaction) {
            const nextRowState: Record<number, RowState> = {};
            initTransaction.items.forEach(item => {
                nextRowState[item.user.id] = {
                    paidEnabled: item.balanceChange > 0,
                    paidValue: item.balanceChange > 0 ? item.balanceChange : 0,
                    splitEnabled: item.balanceChange < 0,
                    splitValue: item.balanceChange < 0 ? Math.abs(item.balanceChange) : 0,
                };
            });
            setRowState(nextRowState);
            reset({ ...initTransaction, groupId: initGroup?.id });
        } else if (groupDetail?.members) {
            const nextRowState: Record<number, RowState> = {};
            groupDetail.members.forEach(u => {
                nextRowState[u.id] = { paidEnabled: false, paidValue: 0, splitEnabled: true, splitValue: 0 };
            });
            setRowState(nextRowState);
        }
    }, [groupDetail, initTransaction, isEditMode, reset]);

    const onSubmit = (data: TAddExpenseForm) => {
        const paidBy: TAddExpenseForm["paidBy"] = (currentMembers as unknown as TUser[])
            .map((u) => ({u, s: rowState[u.id]}))
            .filter((x): x is { u: TUser; s: RowState } => !!x.s?.paidEnabled)
            .map(({u, s}) => ({
                userId: u.id,
                ...asModeValue(paidMode, s.paidValue),
            }));

        const splitBetween: TAddExpenseForm["splitBetween"] = (currentMembers as unknown as TUser[])
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

    const checkboxTrigger = useMemo(() => {
        return currentMembers.map(u =>
            `${rowState[u.id]?.paidEnabled ?? false}-${rowState[u.id]?.splitEnabled ?? false}`
        ).join(',');
    }, [rowState, currentMembers]);

    useEffect(() => {
        if (paidMode !== "fixed" && splitMode !== "fixed") return;

        setRowState((prev) => {
            const next = { ...prev };
            const total = Number.isFinite(totalAmount) ? totalAmount : 0;

            const activePayers = currentMembers.filter((u) => next[u.id]?.paidEnabled);
            const activeSplitters = currentMembers.filter((u) => next[u.id]?.splitEnabled);

            const perPayer = activePayers.length > 0 ? total / activePayers.length : 0;
            const perSplitter = activeSplitters.length > 0 ? total / activeSplitters.length : 0;

            currentMembers.forEach((u) => {
                if (!next[u.id]) return;
                if (paidMode === "fixed") next[u.id].paidValue = next[u.id].paidEnabled ? Number(perPayer.toFixed(2)) : 0;
                if (splitMode === "fixed") next[u.id].splitValue = next[u.id].splitEnabled ? Number(perSplitter.toFixed(2)) : 0;
            });

            return next;
        });
    }, [totalAmount, paidMode, splitMode, currentMembers, checkboxTrigger]);

    const handleValueChange = (userId: number, newValue: number, type: 'paid' | 'split') => {
        const total = Number.isFinite(totalAmount) ? totalAmount : 0;
        const mode = type === 'paid' ? paidMode : splitMode;

        if (mode !== "fixed") {
            setRowState(prev => ({
                ...prev,
                [userId]: { ...prev[userId], [`${type}Value`]: newValue }
            }));
            return;
        }

        setRowState(prev => {
            const next = { ...prev };
            next[userId] = { ...next[userId], [`${type}Value`]: newValue };

            const otherActiveMembers = currentMembers.filter(m =>
                m.id !== userId && (type === 'paid' ? next[m.id]?.paidEnabled : next[m.id]?.splitEnabled)
            );

            if (otherActiveMembers.length > 0) {
                const remaining = total - newValue;
                const perPerson = Math.max(0, remaining / otherActiveMembers.length);

                otherActiveMembers.forEach(m => {
                    next[m.id] = {
                        ...next[m.id],
                        [`${type}Value`]: Number(perPerson.toFixed(2))
                    };
                });
            }
            return next;
        });
    };

    return (
        <>
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    px: { xs: 0, md: 2 },
                    pb: 2,
                    backgroundColor: COLORS.SECONDARY,
                    width: {xs: '100%', md: "auto"},
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: COLORS.PRIMARY,
                        mb: 2,
                    }}
                >
                    <FormattedMessage id={isEditMode ? "expense.edit.title" : "expense.add.title"} />
                </Typography>

                {/* Desktop layout */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Stack>
                        <Box display="flex" gap={3} alignItems="center">
                            <Stack flex={1}>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label={<FormattedMessage id="expense.fields.title" />}
                                            size="small"
                                            error={!!errors.title}
                                            helperText={tError(intl, errors.title?.message)}
                                        />
                                    )}
                                />
                            </Stack>

                            <Stack flex={1}>
                                <Controller
                                    name="expenseCategory"
                                    control={control}
                                    defaultValue={initTransaction?.expenseCategory ?? ""}
                                    render={({ field }) => (
                                        <Autocomplete
                                            size="small"
                                            options={categories}
                                            getOptionLabel={(o) => intl.formatMessage({ id: o.intlId })}
                                            isOptionEqualToValue={(option, value) => option.name === value.name}
                                            value={categories.find((c) => c.name === (field.value ?? "")) ?? null}
                                            onChange={(_, selected) => {
                                                field.onChange(selected?.name ?? "");
                                            }}
                                            onBlur={field.onBlur}
                                            filterOptions={(options, state) => {
                                                const q = state.inputValue.trim().toLowerCase();
                                                if (!q) return options;
                                                return options.filter((o) => o.name.toLowerCase().includes(q));
                                            }}
                                            renderOption={(props, option) => (
                                                <Box component="li" {...props} key={option.name}>
                                                    {intl.formatMessage({ id: option.intlId })}
                                                </Box>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label={<FormattedMessage id="expense.fields.category" />}
                                                    inputRef={field.ref}
                                                    error={!!errors.expenseCategory}
                                                    helperText={tError(intl, errors.expenseCategory?.message)}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Stack>

                            <Stack flex={1}>
                                <FormControl>
                                    <Stack direction="row" alignItems="center" gap={0.5}>
                                        <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                            <FormattedMessage id="expense.mode.paidBy" />
                                        </FormLabel>
                                        <Tooltip
                                            title={<FormattedMessage id="expense.mode.tooltip" />}
                                            placement="top"
                                            arrow
                                            enterTouchDelay={0}
                                            leaveTouchDelay={5000}
                                        >
                                            <InfoOutlinedIcon sx={{ fontSize: 16, color: COLORS.PRIMARY, cursor: 'help' }} />
                                        </Tooltip>
                                    </Stack>
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
                                {!isFriendGroup && (
                                        <Controller
                                        name="groupId"
                                        control={control}
                                        defaultValue={initGroup?.id ?? 0}
                                        render={({ field }) => (
                                            <Autocomplete
                                                size="small"
                                                options={groups}
                                                disabled={isEditMode}
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
                                                        helperText={tError(intl, errors.groupId?.message)}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                )}
                            </Stack>

                            <Box display="flex" gap={3} flex={1} alignItems="center">
                                <Stack flex={1}>
                                    <Controller
                                        name="totalAmount"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label={<FormattedMessage id="expense.fields.amount" />}
                                                size="small"
                                                inputMode="decimal"
                                                value={field.value ?? ""}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                error={!!errors.totalAmount}
                                                helperText={tError(intl, errors.totalAmount?.message)}
                                            />
                                        )}
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
                                                value={favCurrencies.find((c) => c.code === (field.value ?? "")) ?? null}
                                                onChange={(_, selected) => field.onChange(selected?.code ?? "")}
                                                onBlur={field.onBlur}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label={<FormattedMessage id="expense.fields.currency" />}
                                                        inputRef={field.ref}
                                                        error={!!errors.currency}
                                                        helperText={tError(intl, errors.currency?.message)}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                </Stack>
                            </Box>

                            <Stack flex={1}>
                                <FormControl>
                                    <Stack direction="row" alignItems="center" gap={0.5}>
                                        <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                            <FormattedMessage id="expense.mode.splitBetween" />
                                        </FormLabel>
                                        <Tooltip
                                            title={<FormattedMessage id="expense.mode.tooltip" />}
                                            placement="top"
                                            arrow
                                            enterTouchDelay={0}
                                            leaveTouchDelay={5000}
                                        >
                                            <InfoOutlinedIcon sx={{ fontSize: 16, color: COLORS.PRIMARY, cursor: 'help' }} />
                                        </Tooltip>
                                    </Stack>
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
                            columnSpacing={2.5}
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
                                sx={{ position: "relative", display: "flex", justifyContent: "center" }}
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
                                sx={{ position: "relative", display: "flex", justifyContent: "center" }}
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

                            <Grid size={3.3} />

                            {/* Rows */}
                            {(currentMembers as unknown as TUser[]).map((u) => {
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
                                                onChange={(e) => handleValueChange(u.id, Number(e.target.value), 'paid')}
                                                slotProps={{
                                                    input: { endAdornment: unitAdornment(paidMode, currency) }
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
                                                onChange={(e) => handleValueChange(u.id, Number(e.target.value), 'split')}
                                                slotProps={{
                                                    input: { endAdornment: unitAdornment(splitMode, currency) }
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

                {/* Mobile layout (xs-sm) */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Stack gap={1.5}>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label={<FormattedMessage id="expense.fields.title" />}
                                    size="small"
                                    error={!!errors.title}
                                    helperText={tError(intl, errors.title?.message)}
                                />
                            )}
                        />

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 1.5,
                            }}
                        >
                            <Controller
                                name="expenseCategory"
                                control={control}
                                defaultValue={initTransaction?.expenseCategory ?? ""}
                                render={({ field }) => (
                                    <Autocomplete
                                        size="small"
                                        options={categories}
                                        getOptionLabel={(o) => intl.formatMessage({ id: o.intlId })}
                                        isOptionEqualToValue={(option, value) => option.name === value.name}
                                        value={categories.find((c) => c.name === (field.value ?? "")) ?? null}
                                        onChange={(_, selected) => {
                                            field.onChange(selected?.name ?? "");
                                        }}
                                        onBlur={field.onBlur}
                                        filterOptions={(options, state) => {
                                            const q = state.inputValue.trim().toLowerCase();
                                            if (!q) return options;
                                            return options.filter((o) => o.name.toLowerCase().includes(q));
                                        }}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} key={option.name}>
                                                {intl.formatMessage({ id: option.intlId })}
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={<FormattedMessage id="expense.fields.category" />}
                                                inputRef={field.ref}
                                                error={!!errors.expenseCategory}
                                                helperText={tError(intl, errors.expenseCategory?.message)}
                                            />
                                        )}
                                    />
                                )}
                            />

                            {!isFriendGroup ? (
                                <Controller
                                    name="groupId"
                                    control={control}
                                    defaultValue={initGroup?.id ?? 0}
                                    render={({ field }) => (
                                        <Autocomplete
                                            size="small"
                                            options={groups}
                                            disabled={isEditMode}
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
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    label={<FormattedMessage id="expense.fields.group" />}
                                                    inputRef={field.ref}
                                                    error={!!errors.groupId}
                                                    helperText={tError(intl, errors.groupId?.message)}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            ) : <Box/>}
                            <Controller
                                name="totalAmount"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label={<FormattedMessage id="expense.fields.amount" />}
                                        size="small"
                                        inputMode="decimal"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        error={!!errors.totalAmount}
                                        helperText={tError(intl, errors.totalAmount?.message)}
                                    />
                                )}
                            />

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
                                        value={favCurrencies.find((c) => c.code === (field.value ?? "")) ?? null}
                                        onChange={(_, selected) => field.onChange(selected?.code ?? "")}
                                        onBlur={field.onBlur}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label={<FormattedMessage id="expense.fields.currency" />}
                                                inputRef={field.ref}
                                                error={!!errors.currency}
                                                helperText={tError(intl, errors.currency?.message)}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Box>

                        <FormControl fullWidth>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                    <FormattedMessage id="expense.mode.paidBy" />
                                </FormLabel>
                                <Tooltip
                                    title={<FormattedMessage id="expense.mode.tooltip" />}
                                    placement="top"
                                    arrow
                                    enterTouchDelay={0}
                                    leaveTouchDelay={5000}
                                >
                                    <InfoOutlinedIcon sx={{ fontSize: 16, color: COLORS.PRIMARY, cursor: 'help' }} />
                                </Tooltip>
                            </Stack>
                            <RadioGroup
                                row
                                value={paidMode}
                                onChange={(e) => setPaidMode(e.target.value as Mode)}
                                sx={{ justifyContent: 'space-between' }}
                            >
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.fixed" />} />
                                <FormControlLabel value="partial" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.partial" />} />
                                <FormControlLabel value="percentage" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.percentage" />} />
                            </RadioGroup>
                        </FormControl>

                        <FormControl fullWidth>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                    <FormattedMessage id="expense.mode.splitBetween" />
                                </FormLabel>
                                <Tooltip
                                    title={<FormattedMessage id="expense.mode.tooltip" />}
                                    placement="top"
                                    arrow
                                    enterTouchDelay={0}
                                    leaveTouchDelay={5000}
                                >
                                    <InfoOutlinedIcon sx={{ fontSize: 16, color: COLORS.PRIMARY, cursor: 'help' }} />
                                </Tooltip>
                            </Stack>
                            <RadioGroup
                                row
                                value={splitMode}
                                onChange={(e) => setSplitMode(e.target.value as Mode)}
                                sx={{ justifyContent: 'space-between' }}
                            >
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.fixed" />} />
                                <FormControlLabel value="partial" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.partial" />} />
                                <FormControlLabel value="percentage" control={<Radio size="small" />} label={<FormattedMessage id="expense.mode.percentage" />} />
                            </RadioGroup>
                        </FormControl>

                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 0.5,
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                    <FormattedMessage id="expense.whoIsInvolved" />
                                </Typography>
                                {/* placeholder search UI matching mock (non-functional) */}
                                <TextField
                                    size="small"
                                    placeholder="Search"
                                    sx={{ width: 150 }}
                                />
                            </Box>

                            {/* segmented toggle */}
                            <Box
                                sx={{
                                    backgroundColor: 'transparent',
                                    border: `2px solid ${COLORS.PRIMARY}`,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    mb: 1.5,
                                }}
                            >
                                <Button
                                    type="button"
                                    onClick={() => setParticipantView('paid')}
                                    sx={{
                                        borderRadius: 0,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        fontSize: 12,
                                        py: 0.75,
                                        backgroundColor: participantView === 'paid' ? COLORS.PRIMARY : 'transparent',
                                        color: participantView === 'paid' ? COLORS.SECONDARY : COLORS.PRIMARY,
                                        '&:hover': {
                                            backgroundColor: participantView === 'paid' ? COLORS.PRIMARY : 'transparent',
                                        },
                                    }}
                                >
                                    <FormattedMessage id="expense.paidByHeader" />
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setParticipantView('split')}
                                    sx={{
                                        borderRadius: 0,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        fontSize: 12,
                                        py: 0.75,
                                        backgroundColor: participantView === 'split' ? COLORS.PRIMARY : 'transparent',
                                        color: participantView === 'split' ? COLORS.SECONDARY : COLORS.PRIMARY,
                                        '&:hover': {
                                            backgroundColor: participantView === 'split' ? COLORS.PRIMARY : 'transparent',
                                        },
                                    }}
                                >
                                    <FormattedMessage id="expense.splitBetweenHeader" />
                                </Button>
                            </Box>

                            <Stack gap={1}>
                                {(currentMembers as unknown as TUser[]).map((u) => {
                                    const s: RowState = rowState[u.id] ?? {
                                        paidEnabled: false,
                                        paidValue: 0,
                                        splitEnabled: true,
                                        splitValue: 0,
                                    };

                                    const enabled = participantView === 'paid' ? s.paidEnabled : s.splitEnabled;
                                    const value = participantView === 'paid' ? s.paidValue : s.splitValue;
                                    const mode = participantView === 'paid' ? paidMode : splitMode;

                                    return (
                                        <Box
                                            key={u.id}
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr auto 110px',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <Typography sx={{ color: COLORS.PRIMARY, fontWeight: 600 }}>
                                                {u.firstName ?? ""} {u.lastName ?? ""}
                                            </Typography>

                                            <Checkbox
                                                checked={enabled}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setRowState((prev) => ({
                                                        ...prev,
                                                        [u.id]: participantView === 'paid'
                                                            ? { ...s, paidEnabled: checked }
                                                            : { ...s, splitEnabled: checked },
                                                    }))
                                                }}
                                                sx={{ color: COLORS.PRIMARY, "&.Mui-checked": { color: COLORS.PRIMARY } }}
                                            />

                                            <TextField
                                                size="small"
                                                inputMode="decimal"
                                                disabled={!enabled}
                                                value={enabled ? value : ""}
                                                onChange={(e) => handleValueChange(u.id, Number(e.target.value), participantView)}
                                                slotProps={{
                                                    input: { endAdornment: unitAdornment(mode, currency) }
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    px: 4,
                                    py: 1.25,
                                    borderRadius: 999,
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    backgroundColor: COLORS.PRIMARY,
                                    color: COLORS.SECONDARY,
                                    width: '100%',
                                    maxWidth: 360,
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
                    </Stack>
                </Box>
            </Box>

            <AppSnackbar
                open={errorOpen}
                onClose={() => setErrorOpen(false)}
                severity={"error"}
                message={formatApiError(intl, apiError)}
            />
        </>
    );
};
