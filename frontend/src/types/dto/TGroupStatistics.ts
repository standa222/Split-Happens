export type TGroupStatistics = {
  spendingByCategory: {
    category: string;
    total: number;
  }[];

  monthlyTrend: {
    month: string; // YearMonth from BE -> e.g. "2026-05"
    total: number;
  }[];

  userStats: {
    userId: number;
    spending: number;
    paying: number;
    spendingToPayingRatio: number | null;
  }[];
};
