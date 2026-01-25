// API service for fetching Bitcoin exchange rates from multiple sources
import { Result, tryAsync, ok, err } from "@evolu/common";

export interface CurrencyRate {
  readonly code: string;
  readonly name: string;
  readonly rate: number;
}

export interface RatesMap {
  readonly [code: string]: CurrencyRate;
}

export interface FetchRatesError {
  readonly type: "FetchRatesError";
  readonly source: string;
  readonly message: string;
}

export interface AllApisFailed {
  readonly type: "AllApisFailed";
  readonly message: string;
}

interface CoingeckoRateInfo {
  name: string;
  unit: string;
  value: number;
  type: string;
}

interface CoingeckoResponse {
  rates: {
    [code: string]: CoingeckoRateInfo;
  };
}

interface BitpayRateItem {
  code: string;
  name: string;
  rate: number;
}

interface BitpayResponse {
  data: BitpayRateItem[];
}

interface BlockchainInfoRateInfo {
  last: number;
  buy: number;
  sell: number;
  symbol: string;
}

interface BlockchainInfoResponse {
  [code: string]: BlockchainInfoRateInfo;
}

const CORS_PROXY = "https://corsproxy.io/?";

export const fetchCoingeckoRates = async (): Promise<
  Result<RatesMap, FetchRatesError>
> =>
  tryAsync(
    async () => {
      const response = await fetch(
        `${CORS_PROXY}https://api.coingecko.com/api/v3/exchange_rates`,
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

export const fetchBitpayRates = async (): Promise<
  Result<RatesMap, FetchRatesError>
> =>
  tryAsync(
    async () => {
      const response = await fetch(`${CORS_PROXY}https://bitpay.com/rates`);
      if (!response.ok) throw new Error("Bitpay API failed");
      const data: BitpayResponse = await response.json();

      const rates: Record<string, CurrencyRate> = {};
      data.data.forEach((item) => {
        if (item.code !== "BTC") {
          rates[item.code] = {
            code: item.code,
            name: item.name,
            rate: 1 / item.rate,
          };
        }
      });
      return rates;
    },
    (error) => ({
      type: "FetchRatesError",
      source: "Bitpay",
      message: String(error),
    }),
  );

export const fetchBlockchainInfoRates = async (): Promise<
  Result<RatesMap, FetchRatesError>
> =>
  tryAsync(
    async () => {
      const response = await fetch(
        `${CORS_PROXY}https://blockchain.info/ticker`,
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

// Merge rates from multiple sources and calculate average
export const fetchAverageRates = async (): Promise<
  Result<RatesMap, AllApisFailed>
> => {
  const [coingecko, bitpay, blockchain] = await Promise.all([
    fetchCoingeckoRates(),
    fetchBitpayRates(),
    fetchBlockchainInfoRates(),
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

  // Collect all currency codes
  const allCodes = new Set<string>();
  sources.forEach((source) => {
    Object.keys(source).forEach((code) => allCodes.add(code));
  });

  // Calculate average rates
  allCodes.forEach((code) => {
    const rates = sources
      .filter((source) => source[code])
      .map((source) => source[code].rate);

    if (rates.length > 0) {
      const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
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
