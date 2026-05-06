// TODO choose how to use currencies - all / or just choose few popular
import currencyCodes from "currency-codes";

export const allCurrencies = currencyCodes.data
  .filter((c) => c.code) // ISO 4217
  .map((c) => ({ code: c.code, name: c.currency }));

export const favCurrencies = [
  { code: "CZK", name: "Czech Crown", symbol: "Kč" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "";
  return favCurrencies.find((c) => c.code === currencyCode)?.symbol || currencyCode;
}

/** Simple money formatter used across the UI (keeps existing `.toFixed(2)` behavior). */
export function formatMoneyAmount(amount: number, fractionDigits = 2): string {
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toFixed(fractionDigits);
}

export function formatMoneyWithSymbol(
  amount: number,
  currencyCode?: string,
  fractionDigits = 2
): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${formatMoneyAmount(amount, fractionDigits)} ${symbol}`;
}
