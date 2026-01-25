import { Result, ok, err } from "@evolu/common";
import { RatesMap, AllApisFailed, FetchRates, CurrencyRate } from "./types.js";

export interface FetchAverageRatesDeps {
  readonly fetchCoingeckoRates: FetchRates;
  readonly fetchBitpayRates: FetchRates;
  readonly fetchBlockchainInfoRates: FetchRates;
}

export const createFetchAverageRates =
  (deps: FetchAverageRatesDeps) =>
  async (): Promise<Result<RatesMap, AllApisFailed>> => {
    const [coingecko, bitpay, blockchain] = await Promise.all([
      deps.fetchCoingeckoRates(),
      deps.fetchBitpayRates(),
      deps.fetchBlockchainInfoRates(),
    ]);

    const sources = [coingecko, bitpay, blockchain]
      .filter((result) => result.ok)
      .map((result) => (result.ok ? result.value : ({} as RatesMap)));

    if (sources.length === 0) {
      return err({
        type: "AllApisFailed",
        message: "All APIs failed to fetch rates",
      });
    }

    const allRates: Record<string, CurrencyRate> = {};

    const allCodes = new Set<string>();
    sources.forEach((source) => {
      Object.keys(source).forEach((code) => allCodes.add(code));
    });

    allCodes.forEach((code) => {
      const rates = sources
        .filter((source) => source[code])
        .map((source) => source[code].rate);

      if (rates.length > 0) {
        const avgRate =
          rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
        const firstSource = sources.find((s) => s[code]);
        if (firstSource) {
          allRates[code] = {
            code: code,
            name: firstSource[code].name,
            rate: avgRate,
          };
        }
      }
    });

    return ok(allRates);
  };
