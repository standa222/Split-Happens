import {
    Autocomplete,
    Box,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
    List,
    ListItem,
    ListItemText,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {TGroupDetail} from "../types/dto/TGroupDetail";
import {COLORS} from "../constants/colors";
import {Controller, useForm} from "react-hook-form";
import {createGroupFormSchema, TCreateGroupForm} from "../types/form/TCreateGroupForm";
import {zodResolver} from "@hookform/resolvers/zod";
import {favCurrencies} from "../utils/currencyUtils";
import {TUser} from "../types/TUser";
import {useEffect, useMemo, useState} from "react";
import {useUsersSearchQuery} from "../hooks/useUsersSearchQuery";
import {useAuthStore} from "../store/authStore";

type Props = {
    onClose?: () => void;
    initGroup?: TGroupDetail;
};

const USERS_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;

function useDebouncedValue<T>(value: T, delayMs: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

export const CreateGroupForm = ({ onClose, initGroup }: Props ) => {
    const loggedUserId = useAuthStore((s) => s.currentUser.id);
    const isEditMode = Boolean(initGroup);

    const [searchTerm, setSearchTerm] = useState("");

    const { data: memberOptions = [], isFetching: membersLoading } = useUsersSearchQuery({
        query: searchTerm,
        limit: 20,
    });

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TCreateGroupForm>({
        resolver: zodResolver(createGroupFormSchema),
        defaultValues: {
            name: initGroup?.name ?? "",
            defaultCurrency: initGroup?.defaultCurrency ?? "",
            permissionMode: (initGroup?.permissionMode?.toUpperCase() as "SOFT" | "HARD") ?? "SOFT",
            groupType: "GROUP",
            members: initGroup?.members?.map(m => m.id) ?? [loggedUserId],
        },
    });

    const onSubmit = (data: TCreateGroupForm) => {
        console.log(data);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, pb: 2, backgroundColor: COLORS.SECONDARY }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY, mb: 2 }}>
                {isEditMode ? "Edit Group" : "Create New Group"}
            </Typography>
            <Box display="flex" gap={3} alignItems="center">
                <Stack flex={1}>
                    <TextField
                        label="Group Name"
                        size="small"
                        defaultValue={initGroup?.name ?? ""}
                        {...register("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                </Stack>

                <Stack flex={1}>
                    <Controller
                        name="defaultCurrency"
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
                                        label="Currency"
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        inputRef={field.ref}
                                        error={!!errors.defaultCurrency}
                                        helperText={errors.defaultCurrency?.message}
                                        {...params}
                                    />
                                )}
                            />
                        )}
                    />
                </Stack>

                <Stack flex={1}>
                    <FormControl>
                        <FormLabel sx={{ fontWeight: 700, fontSize: 12 }}>
                            Permission mode
                        </FormLabel>
                        <RadioGroup row defaultValue="SOFT" {...register("permissionMode")}>
                            <FormControlLabel value="SOFT" control={<Radio size="small" />} label="Soft" />
                            <FormControlLabel value="HARD" control={<Radio size="small" />} label="Hard" />
                        </RadioGroup>
                    </FormControl>
                </Stack>
            </Box>

            {/* Members */}
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3 }}>
                    Members Selection
                </Typography>
                <Controller
                    name="members"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={memberOptions}
                            loading={membersLoading}
                            value={memberOptions.filter(u => field.value?.includes(u.id))}
                            onInputChange={(_, value) => setSearchTerm(value)}
                            getOptionLabel={(u) => `${u.firstName} ${u.lastName}`.trim() || u.email}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(_, newValue) => field.onChange(newValue.map(u => u.id))}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox checked={selected} sx={{ mr: 1 }} />
                                    <Stack>
                                        <Typography variant="body2">{`${option.firstName} ${option.lastName}`}</Typography>
                                        <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                                    </Stack>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {membersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        },
                                    }}
                                />
                            )}
                        />
                    )}
                />
            </Box>
        </Box>
    );
}