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
import SearchIcon from "@mui/icons-material/Search";
import { COLORS } from "../constants/colors";
import {TGroupDetail} from "../types/dto/TGroupDetail";
import {Controller, useForm} from "react-hook-form";
import {addExpenseFormSchema, TAddExpenseForm} from "../types/form/TAddExpenseForm";
import {zodResolver} from "@hookform/resolvers/zod";
import currencyCodes from "currency-codes";
import {useGroupsQuery} from "../hooks/useGroupsQuery";

type Props = {
    onClose?: () => void;
    initGroup?: TGroupDetail;
};

type Mode = "fixed" | "partial" | "percentage";

type ParticipantRow = {
    id: number;
    firstName: string;
    lastName?: string;
    paid: { enabled: boolean; amount: number };
    split: { enabled: boolean; value: number };
};

type UserLike = {
    id: number;
    firstName?: string;
    lastName?: string;
};

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

export const AddExpenseForm = ({ onClose, initGroup }: Props) => {
    const [paidMode, setPaidMode] = useState<Mode>("fixed");
    const [splitMode, setSplitMode] = useState<Mode>("fixed");
    const [search, setSearch] = useState("");
    const [participants, setParticipants] = useState(initGroup?.members || []);
    const [rowState, setRowState] = useState<Record<number, RowState>>({});
    const { data: fetchedGroups, isLoading: isGroupsLoading, isError: isGroupError } = useGroupsQuery();
    const groups = useMemo(() => {
        if (isGroupsLoading || isGroupError || !fetchedGroups) return [];
        return [...fetchedGroups.activeGroups, ...fetchedGroups.inactiveGroups];
    }, [isGroupsLoading, isGroupError, fetchedGroups]);

    const {
        control,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TAddExpenseForm>({
        resolver: zodResolver(addExpenseFormSchema),
        defaultValues: {
            paidBy: [],
            splitBetween: [],
        }
    })

    useEffect(() => {
        register("paidBy");
        register("splitBetween");
    }, [register]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return participants;
        return participants.filter((p) => `${p.firstName} ${p.lastName ?? ""}`.toLowerCase().includes(q));
    }, [participants, search]);

    const updateParticipant = (id: ParticipantRow["id"], patch: Partial<ParticipantRow>) => {
        setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    };

    const onSubmit = (data: TAddExpenseForm) => {
        console.log(data);

        const paidBy: TAddExpenseForm["paidBy"] = (participants as unknown as UserLike[])
            .map((u) => ({u, s: rowState[u.id]}))
            .filter((x): x is { u: UserLike; s: RowState } => !!x.s?.paidEnabled)
            .map(({u, s}) => ({
                userId: u.id,
                ...asModeValue(paidMode, s.paidValue),
            }));

        const splitBetween: TAddExpenseForm["splitBetween"] = (participants as unknown as UserLike[])
            .map((u) => ({u, s: rowState[u.id]}))
            .filter((x): x is { u: UserLike; s: RowState } => !!x.s?.splitEnabled)
            .map(({u, s}) => ({
                userId: u.id,
                ...asModeValue(splitMode, s.splitValue),
            }));

        const payload: TAddExpenseForm = {
            ...data,
            paidBy,
            splitBetween,
        };

        console.log(payload);
    }

    // TODO choose how to use currencies - all / or just choose few popular
    const allCurrencies = currencyCodes.data
        .filter((c) => c.code) // ISO 4217
        .map((c) => ({ code: c.code, name: c.currency }));

    const favCurrencies = [
        { code: "CZK", name: "Czech Crown" },
        { code: "USD", name: "US Dollar" },
        { code: "EUR", name: "Euro" },
        { code: "GBP", name: "British Pound" },
    ]

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, pb: 2, backgroundColor: COLORS.SECONDARY }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY, mb: 2 }}>
                Add new expense
            </Typography>

            <Stack>
                <Box display="flex" gap={3} alignItems="center">
                    <Stack flex={1}>
                        <TextField
                            label="Name"
                            size="small"
                            {...register("name")}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    </Stack>

                    <Stack flex={1}>
                        <Controller
                            name="category"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    label="Category"
                                    select
                                    size="small"
                                    value={field.value ?? ""}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    inputRef={field.ref}
                                    error={!!errors.category}
                                    helperText={errors.category?.message}
                                >
                                    <MenuItem value="Fun">Fun</MenuItem>
                                    <MenuItem value="Food">Food</MenuItem>
                                    <MenuItem value="Transport">Transport</MenuItem>
                                    <MenuItem value="Utilities">Utilities</MenuItem>
                                </TextField>
                            )}
                        />
                    </Stack>

                    <Stack flex={1}>
                        <FormControl>
                            <FormLabel sx={{ color: `${COLORS.PRIMARY} \!important`, fontWeight: 700, fontSize: 12 }}>
                                Paid By Mode
                            </FormLabel>
                            <RadioGroup row value={paidMode} onChange={(e) => setPaidMode(e.target.value as Mode)}>
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label="Fixed" />
                                <FormControlLabel value="partial" control={<Radio size="small" />} label="Partial" />
                                <FormControlLabel value="percentage" control={<Radio size="small" />} label="Percentage" />
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
                                    onChange={(_, selected) => field.onChange(selected?.id ?? 0)}
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
                                            label="Group"
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
                                label="Amount"
                                size="small"
                                {...register("amount", { valueAsNumber: true })}
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                            />
                        </Stack>

                        <Stack flex={1}>
                            <Controller
                                name="currency"
                                control={control}
                                defaultValue=""
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
                                                label="Currency"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                inputRef={field.ref}
                                                error={!!errors.category}
                                                helperText={errors.category?.message}
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
                                Split Between Mode
                            </FormLabel>
                            <RadioGroup row value={splitMode} onChange={(e) => setSplitMode(e.target.value as Mode)}>
                                <FormControlLabel value="fixed" control={<Radio size="small" />} label="Fixed" />
                                <FormControlLabel value="partial" control={<Radio size="small" />} label="Partial" />
                                <FormControlLabel value="percentage" control={<Radio size="small" />} label="Percentage" />
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </Box>
            </Stack>

            <Typography variant="body1" sx={{ fontWeight: 700, mt: 3 }}>
                Who is involved?
            </Typography>
            <Box sx={{ mt: 0.5 }}>
                <Grid
                    container
                    alignItems="center"
                    columnSpacing={2.5}  // controls horizontal gaps (incl. between paid input and split checkbox)
                    rowSpacing={1.5}
                >
                    {/* Header row */}
                    <Grid size={3.5}>
                        <TextField
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            size="small"
                            placeholder="Search..."
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon sx={{ color: COLORS.PRIMARY }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
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
                            PAID BY
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
                            SPLIT BETWEEN
                        </Typography>
                    </Grid>

                    <Grid size={3.3} /> {/* split input header spacer */}

                    {/* Rows */}
                    {(participants as unknown as UserLike[]).map((u) => {
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
                >
                    Add expense
                </Button>
            </Box>
        </Box>
    );
};
