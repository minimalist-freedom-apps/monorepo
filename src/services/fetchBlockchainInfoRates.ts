import { tryAsync } from "@evolu/common";
import { FetchRates, BlockchainInfoResponse, CurrencyRate } from "./types.js";

export interface FetchBlockchainInfoRatesDeps {
  readonly fetch: typeof globalThis.fetch;
  readonly corsProxy: string;
}

export const createFetchBlockchainInfoRates =
  (deps: FetchBlockchainInfoRatesDeps): FetchRates =>
  () =>
    tryAsync(
      async () => {
        const response = await deps.fetch(
          `${deps.corsProxy}https://blockchain.info/ticker`,
        );
        if (!response.ok) throw new Error("Blockchain.info API failed");
        const data: BlockchainInfoResponse = await response.json();

        const rates: Record<string, CurrencyRate> = {};
        Object.entries(data).forEach(([code, info]) => {
          rates[code] = {
            code: code,
            name: code,
            rate: 1 / info.last,
          };
        });
        return rates;
      },
      (error) => ({
        type: "FetchRatesError",
        source: "BlockchainInfo",
        message: String(error),
      }),
    );
