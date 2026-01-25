import { tryAsync } from "@evolu/common";
import { FetchRates, CoingeckoResponse, CurrencyRate } from "./types.js";

export interface FetchCoingeckoRatesDeps {
  readonly fetch: typeof globalThis.fetch;
  readonly corsProxy: string;
}

export const createFetchCoingeckoRates =
  (deps: FetchCoingeckoRatesDeps): FetchRates =>
  () =>
    tryAsync(
      async () => {
        const response = await deps.fetch(
          `${deps.corsProxy}https://api.coingecko.com/api/v3/exchange_rates`,
        );
        if (!response.ok) throw new Error("Coingecko API failed");
        const data: CoingeckoResponse = await response.json();

        const rates: Record<string, CurrencyRate> = {};
        Object.entries(data.rates).forEach(([code, info]) => {
          if (info.type === "fiat") {
            rates[code.toUpperCase()] = {
              code: code.toUpperCase(),
              name: info.name,
              rate: 1 / info.value,
            };
          }
        });
        return rates;
      },
      (error) => ({
        type: "FetchRatesError",
        source: "Coingecko",
        message: String(error),
      }),
    );
