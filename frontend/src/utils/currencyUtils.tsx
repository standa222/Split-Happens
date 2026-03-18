// TODO choose how to use currencies - all / or just choose few popular
import currencyCodes from "currency-codes";

export const allCurrencies = currencyCodes.data
    .filter((c) => c.code) // ISO 4217
    .map((c) => ({ code: c.code, name: c.currency }));

export const favCurrencies = [
    { code: "CZK", name: "Czech Crown" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
]