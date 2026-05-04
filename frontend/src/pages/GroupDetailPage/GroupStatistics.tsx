import {Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography} from "@mui/material";
import {ReactNode, useMemo, useState} from "react";
import {FormattedMessage, useIntl} from "react-intl";
import {
    Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer,
    Tooltip as RechartsTooltip, XAxis, YAxis
} from "recharts";
import {TGroupDetail} from "../../types/dto/TGroupDetail";
import {useGroupStatisticsQuery} from "../../hooks/useGroupStatisticsQuery";
import {categories} from "../../utils/categoryUtils";
import {formatMoneyWithSymbol} from "../../utils/currencyUtils";
import {COLORS} from "../../constants/colors";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

type Props = {
    group: TGroupDetail;
}

type StatsRangeMode = "ALL" | "YEAR" | "MONTH";

type StatsQueryParams = {
    groupId: number;
    year?: number;
    month?: number;
}

const PIE_COLORS = [
    "#1976d2",
    "#9c27b0",
    "#009688",
    "#ff9800",
    "#f44336",
    "#3f51b5",
    "#607d8b",
    "#795548",
    "#4caf50",
    "#e91e63",
];

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const formatMonthLabel = (ym: string, locale: string) => {
    const [y, m] = ym.split("-").map(Number);
    if (!y || !m) return ym;
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(y, m - 1, 1));
};

const StatSection = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <Box sx={{ border: `2px solid ${COLORS.PRIMARY}`, borderRadius: 3, p: { xs: 2, md: 3 } }}>
        <Stack gap={2}>
            <Typography variant="h6" fontWeight={800} color={COLORS.PRIMARY}>
                {title}
            </Typography>
            {children}
        </Stack>
    </Box>
);

const DonutChart = ({ data, valueFormatter }: {
    data: { name: string; value: number }[];
    valueFormatter?: (v: number) => string;
}) => {
    const filtered = data.filter((d) => (d.value ?? 0) > 0);

    if (filtered.length === 0) {
        return (
            <Typography color={COLORS.PRIMARY}>
                <FormattedMessage id="groupDetail.statistics.noData" />
            </Typography>
        );
    }

    return (
        <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height={320} minWidth={0}>
                <PieChart>
                    <Pie
                        data={filtered.map((entry, index) => ({
                            ...entry,
                            fill: PIE_COLORS[index % PIE_COLORS.length],
                        }))}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={40}
                        outerRadius={110}
                        paddingAngle={2}
                    />
                    <RechartsTooltip
                        formatter={(value: any, name: any) => [
                            valueFormatter ? valueFormatter(Number(value)) : String(value),
                            String(name),
                        ]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
};

const StatisticsRangePicker = ({
    mode,
    setMode,
    year,
    setYear,
    month,
    setMonth,
    years,
}: {
    mode: StatsRangeMode;
    setMode: (m: StatsRangeMode) => void;
    year: number;
    setYear: (y: number) => void;
    month: number;
    setMonth: (m: number) => void;
    years: number[];
}) => {
    const intl = useIntl();

    const monthLabel = (monthNumber: number) => intl.formatDate(new Date(2000, monthNumber - 1, 1), {month: "long"});

    return (
        <Box sx={{border: `2px solid ${COLORS.PRIMARY}`, borderRadius: 3, p: {xs: 2, md: 3}}}>
            <Stack gap={2}>
                <Typography variant="h6" fontWeight={800} color={COLORS.PRIMARY}>
                    <FormattedMessage id="groupDetail.statistics.range" />
                </Typography>

                <Stack direction={{xs: "column", md: "row"}} alignItems={{xs: "stretch", md: "center"}} gap={2}>
                    <FormControl fullWidth>
                        <InputLabel id="stats-mode-label">
                            <FormattedMessage id="groupDetail.statistics.mode" />
                        </InputLabel>
                        <Select
                            labelId="stats-mode-label"
                            value={mode}
                            label={intl.formatMessage({id: "groupDetail.statistics.mode", defaultMessage: "Range"})}
                            onChange={(e) => setMode(e.target.value as StatsRangeMode)}
                        >
                            <MenuItem value="ALL">
                                <FormattedMessage id="groupDetail.statistics.allTime" />
                            </MenuItem>
                            <MenuItem value="YEAR">
                                <FormattedMessage id="groupDetail.statistics.year" />
                            </MenuItem>
                            <MenuItem value="MONTH">
                                <FormattedMessage id="groupDetail.statistics.month" />
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {(mode === "YEAR" || mode === "MONTH") && (
                        <FormControl fullWidth>
                            <InputLabel id="stats-year-label">
                                <FormattedMessage id="groupDetail.statistics.selectYear" />
                            </InputLabel>
                            <Select
                                labelId="stats-year-label"
                                value={year}
                                label={intl.formatMessage({id: "groupDetail.statistics.selectYear"})}
                                onChange={(e) => setYear(Number(e.target.value))}
                            >
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    {mode === "MONTH" && (
                        <FormControl fullWidth>
                            <InputLabel id="stats-month-label">
                                <FormattedMessage id="groupDetail.statistics.selectMonth" />
                            </InputLabel>
                            <Select
                                labelId="stats-month-label"
                                value={month}
                                label={intl.formatMessage({id: "groupDetail.statistics.selectMonth"})}
                                onChange={(e) => setMonth(Number(e.target.value))}
                            >
                                {months.map((m) => (
                                    <MenuItem key={m} value={m}>
                                        {monthLabel(m)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
};

const StatisticsLoading = () => (
    <Box sx={{border: `2px solid ${COLORS.PRIMARY}`, borderRadius: 3, p: {xs: 2, md: 3}}}>
        <Stack gap={2} alignItems="center">
            <CircularProgress/>
            <Typography color={COLORS.PRIMARY} fontWeight={700}>
                <FormattedMessage id="groupDetail.statistics.calculating" />
            </Typography>
            <Skeleton variant="rounded" width="100%" height={220}/>
        </Stack>
    </Box>
);

const SpendingByCategorySection = ({
    data,
    currencyCode,
}: {
    data: { name: string; value: number }[];
    currencyCode: string;
}) => (
    <StatSection title={<FormattedMessage id="groupDetail.statistics.byCategory" />}>
        <DonutChart data={data} valueFormatter={(v) => formatMoneyWithSymbol(v, currencyCode)}/>
    </StatSection>
);

const MonthlyTrendSection = ({
    data,
    currencyCode,
}: {
    data: { month: string; total: number }[];
    currencyCode: string;
}) => {
    const intl = useIntl();

    return (
        <StatSection title={<FormattedMessage id="groupDetail.statistics.monthlyTrend" />}>
            {data.length === 0 ? (
                <Typography color={COLORS.PRIMARY}>
                    <FormattedMessage id="groupDetail.statistics.noData" />
                </Typography>
            ) : (
                <Box sx={{ width: "100%", height: 320, minHeight: 320 }}>
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <BarChart data={data} margin={{top: 16, right: 16, bottom: 8, left: 0}}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="month"/>
                            <YAxis/>
                            <RechartsTooltip formatter={(v: any) => formatMoneyWithSymbol(Number(v), currencyCode)}/>
                            <Legend/>
                            <Bar
                                name={intl.formatMessage({id: "groupDetail.statistics.total"})}
                                dataKey="total"
                                fill={COLORS.PRIMARY}
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </StatSection>
    );
};

const PayingByUsersSection = ({
    data,
    currencyCode,
}: {
    data: { name: string; value: number }[];
    currencyCode: string;
}) => (
    <StatSection title={<FormattedMessage id="groupDetail.statistics.payingByUser" />}>
        <DonutChart data={data} valueFormatter={(v) => formatMoneyWithSymbol(v, currencyCode)}/>
    </StatSection>
);

const SpendingByUsersSection = ({
    data,
    currencyCode,
}: {
    data: { name: string; value: number }[];
    currencyCode: string;
}) => (
    <StatSection title={<FormattedMessage id="groupDetail.statistics.spendingByUser" />}>
        <DonutChart data={data} valueFormatter={(v) => formatMoneyWithSymbol(v, currencyCode)}/>
    </StatSection>
);

const UserIndexTableSection = ({
    rows,
    currencyCode,
}: {
    rows: { userId: number; name: string; spending: number; paying: number; ratioValue: number | null }[];
    currencyCode: string;
}) => (
    <StatSection
        title={
            <Stack direction="row" alignItems="center" gap={1}>
                <FormattedMessage id="groupDetail.statistics.userIndex" />
                <Tooltip
                    title={<FormattedMessage id="groupDetail.statistics.userIndex.tooltip" />}
                    placement="top"
                    arrow
                    enterTouchDelay={0}
                    leaveTouchDelay={5000}
                >
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: COLORS.PRIMARY, cursor: "help" }} />
                </Tooltip>
            </Stack>
        }
    >
        <TableContainer component={Box}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontWeight: 800, color: COLORS.PRIMARY}}>
                            <FormattedMessage id="groupDetail.statistics.user" />
                        </TableCell>
                        <TableCell align="right" sx={{fontWeight: 800, color: COLORS.PRIMARY}}>
                            <FormattedMessage id="groupDetail.statistics.spending" />
                        </TableCell>
                        <TableCell align="right" sx={{fontWeight: 800, color: COLORS.PRIMARY}}>
                            <FormattedMessage id="groupDetail.statistics.paying" />
                        </TableCell>
                        <TableCell align="right" sx={{fontWeight: 800, color: COLORS.PRIMARY}}>
                            <FormattedMessage id="groupDetail.statistics.ratio" />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((r) => (
                        <TableRow key={r.userId}>
                            <TableCell>{r.name}</TableCell>
                            <TableCell align="right">{formatMoneyWithSymbol(r.spending, currencyCode)}</TableCell>
                            <TableCell align="right">{formatMoneyWithSymbol(r.paying, currencyCode)}</TableCell>
                            <TableCell align="right">{r.ratioValue === null ? "—" : r.ratioValue.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </StatSection>
);

export const GroupStatistics = ({group}: Props) => {
    const intl = useIntl();
    const currencyCode = group.defaultCurrency;

    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const out: number[] = [];
        for (let y = currentYear; y >= currentYear - 10; y--) out.push(y);
        return out;
    }, [currentYear]);

    const [mode, setMode] = useState<StatsRangeMode>("ALL");
    const [year, setYear] = useState<number>(currentYear);
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const queryParams: StatsQueryParams = useMemo(() => {
        if (mode === "ALL") return {groupId: group.id};
        if (mode === "YEAR") return {groupId: group.id, year};
        return {groupId: group.id, year, month};
    }, [group.id, mode, year, month]);

    const {data, isLoading, isError} = useGroupStatisticsQuery(queryParams);

    const spendingByCategoryData = useMemo(() => {
        const rows = data?.spendingByCategory ?? [];
        return rows.map((r) => {
            const cat = categories.find((c) => c.name === r.category);
            const name = cat ? intl.formatMessage({id: cat.intlId}) : (r.category ?? "OTHER");
            return {name, value: r.total ?? 0};
        });
    }, [data?.spendingByCategory, intl]);

    const monthlyTrendData = useMemo(() => {
        const rows = data?.monthlyTrend ?? [];
        return rows
            .slice()
            .sort((a, b) => String(a.month).localeCompare(String(b.month)))
            .map((r) => ({
                month: formatMonthLabel(String(r.month), intl.locale),
                total: r.total ?? 0,
            }));
    }, [data?.monthlyTrend, intl.locale]);

    const userStatsRows = useMemo(() => {
        const stats = data?.userStats ?? [];
        const membersById = new Map(group.members.map((m) => [m.id, m]));

        return stats
            .map((s) => {
                const user = membersById.get(s.userId);
                const name = user ? `${user.firstName} ${user.lastName}`.trim() : `#${s.userId}`;
                return {
                    userId: s.userId,
                    name,
                    spending: s.spending ?? 0,
                    paying: s.paying ?? 0,
                    ratio: s.spendingToPayingRatio,
                };
            })
            .sort((a, b) => (b.spending + b.paying) - (a.spending + a.paying));
    }, [data?.userStats, group.members]);

    const payingDonut = useMemo(
        () => userStatsRows.map((r) => ({name: r.name, value: r.paying})),
        [userStatsRows]
    );

    const spendingDonut = useMemo(
        () => userStatsRows.map((r) => ({name: r.name, value: r.spending})),
        [userStatsRows]
    );

    const ratioTableRows = useMemo(() => {
        return userStatsRows
            .map((r) => ({
                userId: r.userId,
                name: r.name,
                spending: r.spending,
                paying: r.paying,
                ratioValue: r.ratio ?? null,
            }))
            .sort((a, b) => {
                const av = a.ratioValue;
                const bv = b.ratioValue;
                if (av === null && bv === null) return 0;
                if (av === null) return 1;
                if (bv === null) return -1;
                return bv - av;
            });
    }, [userStatsRows]);

    return (
        <Stack gap={2} sx={{pb: 2}}>
            <StatisticsRangePicker
                mode={mode}
                setMode={setMode}
                year={year}
                setYear={setYear}
                month={month}
                setMonth={setMonth}
                years={years}
            />

            {isError && (
                <Typography color={COLORS.RED} fontWeight={700}>
                    <FormattedMessage id="groupDetail.statistics.error" />
                </Typography>
            )}

            {isLoading && <StatisticsLoading/>}

            {!isLoading && data && (
                <Stack gap={2}>
                    <SpendingByCategorySection data={spendingByCategoryData} currencyCode={currencyCode}/>
                    <MonthlyTrendSection data={monthlyTrendData} currencyCode={currencyCode}/>
                    <PayingByUsersSection data={payingDonut} currencyCode={currencyCode}/>
                    <SpendingByUsersSection data={spendingDonut} currencyCode={currencyCode}/>
                    <UserIndexTableSection rows={ratioTableRows} currencyCode={currencyCode}/>
                </Stack>
            )}
        </Stack>
    );
}