import {Box, CircularProgress,
    Divider, FormControl, InputLabel, MenuItem, Select, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography} from "@mui/material";
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

const formatMonthLabel = (ym: string, locale: string) => {
    const [y, m] = ym.split("-").map(Number);
    if (!y || !m) return ym;
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(y, m - 1, 1));
};

const StatSection = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
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
    year,
    setYear,
    month,
    setMonth,
    years,
    months,
}: {
    year: string;
    setYear: (y: string) => void;
    month: string;
    setMonth: (m: string) => void;
    years: string[];
    months: string[];
}) => {
    const intl = useIntl();

    const monthLabel = (monthNumber: number) => intl.formatDate(new Date(2000, monthNumber - 1, 1), {month: "long"});

    const allTimeLabel = intl.formatMessage({id: "groupDetail.statistics.allTime"});
    const wholeYearLabel = intl.formatMessage({id: "groupDetail.statistics.wholeYear"});
    const selectYearLabel = intl.formatMessage({id: "groupDetail.statistics.selectYear"});
    const selectMonthLabel = intl.formatMessage({id: "groupDetail.statistics.selectMonth"});

    return (
        <Box sx={{p: {xs: 2, md: 3}}}>
            <Stack gap={2}>
                <Typography variant="h6" fontWeight={800} color={COLORS.PRIMARY}>
                    <FormattedMessage id="groupDetail.statistics.range" />
                </Typography>

                <Stack direction={{xs: "column", md: "row"}} alignItems={{xs: "stretch", md: "center"}} gap={2}>
                    <FormControl fullWidth>
                        <InputLabel id="stats-year-label" shrink>{selectYearLabel}</InputLabel>
                        <Select
                            id="stats-year"
                            labelId="stats-year-label"
                            label={selectYearLabel}
                            notched
                            value={year}
                            displayEmpty
                            renderValue={(selected) => {
                                const v = String(selected ?? "");
                                return v === "" ? allTimeLabel : v;
                            }}
                            onChange={(e) => {
                                const nextYear = String(e.target.value);
                                setYear(nextYear);
                                if (nextYear === "") setMonth("");
                            }}
                        >
                            <MenuItem value="">
                                <FormattedMessage id="groupDetail.statistics.allTime" />
                            </MenuItem>
                            {years.map((y) => (
                                <MenuItem key={y} value={y}>
                                    {y}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={year === ""}>
                        <InputLabel id="stats-month-label" shrink>{selectMonthLabel}</InputLabel>
                        <Select
                            id="stats-month"
                            labelId="stats-month-label"
                            label={selectMonthLabel}
                            notched
                            value={month}
                            displayEmpty
                            renderValue={(selected) => {
                                const v = String(selected ?? "");
                                return v === "" ? wholeYearLabel : monthLabel(Number(v));
                            }}
                            onChange={(e) => setMonth(String(e.target.value))}
                        >
                            <MenuItem value="">
                                <FormattedMessage id="groupDetail.statistics.wholeYear" />
                            </MenuItem>
                            {months.map((m) => (
                                <MenuItem key={m} value={m}>
                                    {monthLabel(Number(m))}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                        <TableCell sx={{fontWeight: 800}}>
                            <FormattedMessage id="groupDetail.statistics.user" />
                        </TableCell>
                        <TableCell align="right" sx={{fontWeight: 800}}>
                            <FormattedMessage id="groupDetail.statistics.ratio" />
                        </TableCell>
                        <TableCell align="right" sx={{fontWeight: 800}}>
                            <FormattedMessage id="groupDetail.statistics.paying" />
                        </TableCell>
                        <TableCell align="right" sx={{fontWeight: 800}}>
                            <FormattedMessage id="groupDetail.statistics.spending" />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((r) => (
                        <TableRow key={r.userId}>
                            <TableCell>{r.name}</TableCell>
                            <TableCell align="right">{r.ratioValue === null ? "—" : r.ratioValue.toFixed(2)}</TableCell>
                            <TableCell align="right">{formatMoneyWithSymbol(r.paying, currencyCode)}</TableCell>
                            <TableCell align="right">{formatMoneyWithSymbol(r.spending, currencyCode)}</TableCell>
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

    const [year, setYear] = useState<string>("");
    const [month, setMonth] = useState<string>("");

    const availableYears = useMemo(() => {
        const yearsSet = new Set<string>();
        for (const t of group.transactions ?? []) {
            if (t.transactionType !== "EXPENSE") continue;
            const d = new Date(t.createdAt);
            if (Number.isNaN(d.getTime())) continue;
            yearsSet.add(String(d.getFullYear()));
        }
        return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
    }, [group.transactions]);

    const availableMonthsByYear = useMemo(() => {
        const sets = new Map<string, Set<string>>();

        for (const t of group.transactions ?? []) {
            if (t.transactionType !== "EXPENSE") continue;
            const d = new Date(t.createdAt);
            if (Number.isNaN(d.getTime())) continue;

            const y = String(d.getFullYear());
            const m = String(d.getMonth() + 1); // 1-12

            if (!sets.has(y)) sets.set(y, new Set<string>());
            sets.get(y)!.add(m);
        }

        const out = new Map<string, string[]>();
        for (const [y, set] of sets.entries()) {
            out.set(y, Array.from(set).sort((a, b) => Number(a) - Number(b)));
        }
        return out;
    }, [group.transactions]);

    const sanitizedYear = useMemo(() => {
        if (year === "") return "";
        return availableYears.includes(year) ? year : "";
    }, [availableYears, year]);

    const availableMonths = useMemo(() => {
        if (sanitizedYear === "") return [];
        return availableMonthsByYear.get(sanitizedYear) ?? [];
    }, [availableMonthsByYear, sanitizedYear]);

    const sanitizedMonth = useMemo(() => {
        if (sanitizedYear === "") return "";
        if (month === "") return "";
        return availableMonths.includes(month) ? month : "";
    }, [availableMonths, month, sanitizedYear]);

    const queryParams: StatsQueryParams = useMemo(() => {
        const yearNum = sanitizedYear === "" ? undefined : Number(sanitizedYear);
        const monthNum = sanitizedMonth === "" ? undefined : Number(sanitizedMonth);

        if (!yearNum) return {groupId: group.id};
        if (!monthNum) return {groupId: group.id, year: yearNum};
        return {groupId: group.id, year: yearNum, month: monthNum};
    }, [group.id, sanitizedMonth, sanitizedYear]);

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
                    ratio: s.kindex,
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
                year={sanitizedYear}
                setYear={setYear}
                month={sanitizedMonth}
                setMonth={setMonth}
                years={availableYears}
                months={availableMonths}
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
                    <Divider />
                    {!(sanitizedYear !== "" && sanitizedMonth !== "") &&
                        <>
                            <MonthlyTrendSection data={monthlyTrendData} currencyCode={currencyCode}/>
                            <Divider />
                        </>
                    }
                    <PayingByUsersSection data={payingDonut} currencyCode={currencyCode}/>
                    <Divider />
                    <SpendingByUsersSection data={spendingDonut} currencyCode={currencyCode}/>
                    <Divider />
                    <UserIndexTableSection rows={ratioTableRows} currencyCode={currencyCode}/>
                </Stack>
            )}
        </Stack>
    );
}