import {
    Autocomplete,
    Box, Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
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
import {useState} from "react";
import {useUsersSearchQuery} from "../hooks/useUsersSearchQuery";
import {useAuthStore} from "../store/authStore";
import {useCreateGroupMutation, useEditGroupMutation} from "../hooks/useGroupMutation";
import {FormattedMessage, useIntl} from "react-intl";

type Props = {
    onClose?: () => void;
    initGroup?: TGroupDetail;
};


export const CreateGroupForm = ({ onClose, initGroup }: Props ) => {
    const currentUser = useAuthStore((s) => s.currentUser);
    const loggedUserId = currentUser.id;
    const isEditMode = Boolean(initGroup);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<TUser[]>(initGroup?.members ?? [currentUser]);
    const intl = useIntl();

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
            memberIds: initGroup?.members?.map(m => m.id) ?? [loggedUserId],
        },
    });

    const createGroup = useCreateGroupMutation({ onSuccess: onClose });
    const editGroup = useEditGroupMutation({ onSuccess: onClose });

    const isPending = isEditMode ? editGroup.isPending : createGroup.isPending;

    const onSubmit = (data: TCreateGroupForm) => {
        console.log("submitting ", data);
        if (isEditMode) {
            editGroup.mutate({ groupId: initGroup!.id, data });
        } else {
            createGroup.mutate(data);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, pb: 2, backgroundColor: COLORS.SECONDARY }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.PRIMARY, mb: 2 }}>
                {isEditMode ? (
                    <FormattedMessage id="group.form.title.edit" />
                ) : (
                    <FormattedMessage id="group.form.title.create" />
                )}
            </Typography>
            <Box display="flex" gap={3} alignItems="center">
                <Stack flex={1}>
                    <TextField
                        label={<FormattedMessage id="group.form.fields.name" />}
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
                        render={({ field }) => (
                            <Autocomplete
                                size="small"
                                options={favCurrencies}
                                value={favCurrencies.find((c) => c.code === field.value) ?? null}
                                onChange={(_, opt) => field.onChange(opt?.code ?? "")}
                                isOptionEqualToValue={(a, b) => a.code === b.code}
                                getOptionLabel={(o) => o.code}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={<FormattedMessage id="group.form.fields.defaultCurrency" />}
                                        inputRef={field.ref}
                                        error={!!errors.defaultCurrency}
                                        helperText={errors.defaultCurrency?.message}
                                    />
                                )}
                            />
                        )}
                    />
                </Stack>

                <Stack flex={1}>
                    <Controller
                        name="permissionMode"
                        control={control}
                        render={({ field }) => (
                            <>
                                <FormControl>
                                    <FormLabel sx={{ color: `${COLORS.PRIMARY} !important`, fontWeight: 700, fontSize: 12 }}>
                                        <FormattedMessage id="group.form.fields.permissionMode" />
                                    </FormLabel>
                                    <RadioGroup
                                        row
                                        value={field.value}
                                        onChange={(_, v) => field.onChange(v)}
                                    >
                                        <FormControlLabel
                                            value="SOFT"
                                            control={<Radio size="small" />}
                                            label={<FormattedMessage id="group.form.permissionMode.soft" />}
                                        />
                                        <FormControlLabel
                                            value="HARD"
                                            control={<Radio size="small" />}
                                            label={<FormattedMessage id="group.form.permissionMode.hard" />}
                                        />
                                    </RadioGroup>
                                </FormControl>
                                {errors.permissionMode?.message ? (
                                    <Typography variant="caption" color="error">
                                        {errors.permissionMode.message}
                                    </Typography>
                                ) : null}
                            </>
                        )}
                    />
                </Stack>
            </Box>

            {/* Members */}
            <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 3 }}>
                    <FormattedMessage id="group.form.members.title" />
                </Typography>
                <Controller
                    name="memberIds"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={memberOptions}
                            loading={membersLoading}
                            value={selectedUsers}
                            onInputChange={(_, value) => setSearchTerm(value)}
                            getOptionLabel={(u) => `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(_, newValue) => {
                                setSelectedUsers(newValue);
                                field.onChange(newValue.map(u => u.id));
                            }}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        checked={selected}
                                        sx={{
                                            mr: 1,
                                            color: COLORS.PRIMARY, // Unchecked color
                                            '&.Mui-checked': { color: COLORS.PRIMARY } // Checked color
                                        }}
                                    />
                                    <Stack>
                                        <Typography variant="body2">
                                            {`${option.firstName ?? ""} ${option.lastName ?? ""}`.trim() || (
                                                <FormattedMessage id="common.unknownUser" />
                                            )}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.email}
                                        </Typography>
                                    </Stack>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={<FormattedMessage id="group.form.members.search.label" />}
                                    placeholder={intl.formatMessage({ id: "group.form.members.search.placeholder" })}
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
                    {isEditMode ? (
                        isPending ? (
                            <FormattedMessage id="group.form.action.saving" />
                        ) : (
                            <FormattedMessage id="group.form.action.saveChanges" />
                        )
                    ) : (
                        isPending ? (
                            <FormattedMessage id="group.form.action.creating" />
                        ) : (
                            <FormattedMessage id="group.form.action.create" />
                        )
                    )}
                </Button>
            </Box>
        </Box>
    );
}