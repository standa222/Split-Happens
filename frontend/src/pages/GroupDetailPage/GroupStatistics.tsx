import {Box, CircularProgress,
    Divider, FormControl, InputLabel, MenuItem, Select, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography} from "@mui/material";
import {createContext, ReactNode, useContext, useMemo, useState} from "react";
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

const CurrencyContext = createContext("");
const useCurrency = () => useContext(CurrencyContext);

const useDateOptions = (transactions: TGroupDetail["transactions"]) => {
    return useMemo(() => {
        const yearsMap = new Map<string, Set<string>>();

        transactions?.forEach(t => {
            if (t.transactionType !== "EXPENSE") return;
            const d = new Date(t.createdAt);
            if (isNaN(d.getTime())) return;

            const y = String(d.getFullYear());
            const m = String(d.getMonth() + 1);

            if (!yearsMap.has(y)) yearsMap.set(y, new Set());
            yearsMap.get(y)!.add(m);
        });

        const years = Array.from(yearsMap.keys()).sort((a, b) => Number(b) - Number(a));
        const monthsByYear = Object.fromEntries(
            Array.from(yearsMap.entries()).map(([y, mSet]) => [
                y,
                Array.from(mSet).sort((a, b) => Number(a) - Number(b))
            ])
        );

        return { years, monthsByYear };
    }, [transactions]);
};

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

    return (
        <Box sx={{px: {xs: 2, md: 3}}}>
            <Stack gap={2}>
                <Stack direction={{xs: "column", md: "row"}} alignItems={{xs: "stretch", md: "center"}} gap={2}>
                    <FormControl fullWidth>
                        <InputLabel shrink>{intl.formatMessage({id: "groupDetail.statistics.year"})}</InputLabel>
                        <Select
                            label={intl.formatMessage({id: "groupDetail.statistics.year"})}
                            value={year}
                            displayEmpty
                            renderValue={(selected) => {
                                const v = String(selected ?? "");
                                return v === "" ? intl.formatMessage({id: "groupDetail.statistics.allTime"}) : v;
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
                        <InputLabel shrink>{intl.formatMessage({id: "groupDetail.statistics.month"})}</InputLabel>
                        <Select
                            label={intl.formatMessage({id: "groupDetail.statistics.month"})}
                            value={month}
                            displayEmpty
                            renderValue={(selected) => {
                                const v = String(selected ?? "");
                                return v === "" ? intl.formatMessage({id: "groupDetail.statistics.wholeYear"}) : monthLabel(Number(v));
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
    <Box sx={{p: {xs: 2, md: 3}}}>
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
}: {
    data: { name: string; value: number }[];
}) => (
    <StatSection title={<FormattedMessage id="groupDetail.statistics.byCategory" />}>
        <DonutChart data={data} valueFormatter={(v) => formatMoneyWithSymbol(v, useCurrency())}/>
    </StatSection>
);

const MonthlyTrendSection = ({
    data,
}: {
    data: { month: string; total: number }[];
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
                            <RechartsTooltip formatter={(v: any) => formatMoneyWithSymbol(Number(v), useCurrency())}/>
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
}: {
    data: { name: string; value: number }[];
}) => (
    <StatSection title={<FormattedMessage id="groupDetail.statistics.payingByUser" />}>
        <DonutChart data={data} valueFormatter={(v) => formatMoneyWithSymbol(v, useCurrency())}/>
    </StatSection>
);

const SpendingByUsersSection = ({
    data,
}: {
    data: { name: string; value: number }[];
}) => (
    <StatSection title={<FormattedMessage id="groupDetail.statistics.spendingByUser" />}>
        <DonutChart data={data} valueFormatter={(v) => formatMoneyWithSymbol(v, useCurrency())}/>
    </StatSection>
);

const UserIndexTableSection = ({
    rows,
}: {
    rows: { userId: number; name: string; spending: number; paying: number; ratioValue: number | null }[];
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
                            <TableCell align="right">{formatMoneyWithSymbol(r.paying, useCurrency())}</TableCell>
                            <TableCell align="right">{formatMoneyWithSymbol(r.spending, useCurrency())}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </StatSection>
);

export const GroupStatistics = ({ group }: Props) => {
    const intl = useIntl();
    const { years, monthsByYear } = useDateOptions(group.transactions);

    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");

    const availableMonths = year ? (monthsByYear[year] ?? []) : [];

    const queryParams = useMemo(() => ({
        groupId: group.id,
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined
    }), [group.id, year, month]);

    const { data, isLoading, isError } = useGroupStatisticsQuery(queryParams);

    const formattedData = useMemo(() => {
        if (!data) return null;

        const userRows = (data.userStats ?? []).map(s => {
            const member = group.members.find(m => m.id === s.userId);
            return {
                userId: s.userId,
                name: member ? `${member.firstName} ${member.lastName}`.trim() : `#${s.userId}`,
                spending: s.spending ?? 0,
                paying: s.paying ?? 0,
                ratioValue: s.kindex ?? null
            };
        }).sort((a, b) => (b.spending + b.paying) - (a.spending + a.paying));

        return {
            categories: (data.spendingByCategory ?? []).map(r => ({
                name: categories.find(c => c.name === r.category)
                    ? intl.formatMessage({ id: categories.find(c => c.name === r.category)!.intlId })
                    : (r.category ?? "OTHER"),
                value: r.total ?? 0
            })),
            trends: (data.monthlyTrend ?? []).map(r => ({
                month: formatMonthLabel(String(r.month), intl.locale),
                total: r.total ?? 0
            })),
            userRows
        };
    }, [data, group.members, intl]);

    const handleYearChange = (newYear: string) => {
        setYear(newYear);
        setMonth("");
    };

    const titleValues = useMemo(() => {
        const monthName = year && month
            ? intl.formatDate(new Date(Number(year), Number(month) - 1, 1), {month: "long"})
            : "";

        return {
            year,
            month,
            monthName,
            hasYear: year ? "yes" : "no",
            hasMonth: month ? "yes" : "no",
        };
    }, [intl, month, year]);

    return (
        <CurrencyContext.Provider value={group.defaultCurrency}>
            <Stack gap={2} sx={{ pb: 2 }}>
                <Typography color={COLORS.PRIMARY}
                    sx={{
                        typography: {xs: "h6", md: "h5"},
                        fontWeight: {xs: 700, md: 800},
                    }}
                >
                    <FormattedMessage id="groupDetail.statistics.title" values={titleValues} />
                </Typography>
                <StatisticsRangePicker
                    year={year} setYear={handleYearChange}
                    month={month} setMonth={setMonth}
                    years={years} months={availableMonths}
                />

                {isError && <Typography color={COLORS.RED}><FormattedMessage id="groupDetail.statistics.error" /></Typography>}
                {isLoading && <StatisticsLoading />}

                {formattedData && (
                    <Stack gap={2} divider={<Divider />}>
                        <SpendingByCategorySection data={formattedData.categories} />
                        {!month && <MonthlyTrendSection data={formattedData.trends} />}
                        <PayingByUsersSection data={formattedData.userRows.map(u => ({ name: u.name, value: u.paying }))} />
                        <SpendingByUsersSection data={formattedData.userRows.map(u => ({ name: u.name, value: u.spending }))} />
                        <UserIndexTableSection rows={formattedData.userRows} />
                    </Stack>
                )}
            </Stack>
        </CurrencyContext.Provider>
    );
};