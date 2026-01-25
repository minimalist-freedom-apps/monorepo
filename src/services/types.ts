import { Result } from "@evolu/common";

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

export type FetchRates = () => Promise<Result<RatesMap, FetchRatesError>>;

export interface CoingeckoRateInfo {
  readonly name: string;
  readonly unit: string;
  readonly value: number;
  readonly type: string;
}

export interface CoingeckoResponse {
  readonly rates: {
    readonly [code: string]: CoingeckoRateInfo;
  };
}

export interface BitpayRateItem {
  readonly code: string;
  readonly name: string;
  readonly rate: number;
}

export interface BitpayResponse {
  readonly data: readonly BitpayRateItem[];
}

export interface BlockchainInfoRateInfo {
  readonly last: number;
  readonly buy: number;
  readonly sell: number;
  readonly symbol: string;
}

export interface BlockchainInfoResponse {
  readonly [code: string]: BlockchainInfoRateInfo;
}
