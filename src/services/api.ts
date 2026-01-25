// API service for fetching Bitcoin exchange rates from multiple sources

export interface CurrencyRate {
  code: string;
  name: string;
  rate: number;
}

export interface RatesMap {
  [code: string]: CurrencyRate;
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

export const fetchCoingeckoRates = async (): Promise<RatesMap | null> => {
  try {
    const response = await fetch(
      `${CORS_PROXY}https://api.coingecko.com/api/v3/exchange_rates`,
    );
    if (!response.ok) throw new Error("Coingecko API failed");
    const data: CoingeckoResponse = await response.json();

    const rates: RatesMap = {};
    Object.entries(data.rates).forEach(([code, info]) => {
      if (info.type === "fiat") {
        rates[code.toUpperCase()] = {
          code: code.toUpperCase(),
          name: info.name,
          rate: 1 / info.value, // Convert to BTC per unit
        };
      }
    });
    return rates;
  } catch (error) {
    console.error("Coingecko fetch error:", error);
    return null;
  }
};

export const fetchBitpayRates = async (): Promise<RatesMap | null> => {
  try {
    const response = await fetch(`${CORS_PROXY}https://bitpay.com/rates`);
    if (!response.ok) throw new Error("Bitpay API failed");
    const data: BitpayResponse = await response.json();

    const rates: RatesMap = {};
    data.data.forEach((item) => {
      if (item.code !== "BTC") {
        rates[item.code] = {
          code: item.code,
          name: item.name,
          rate: 1 / item.rate, // Convert to BTC per unit
        };
      }
    });
    return rates;
  } catch (error) {
    console.error("Bitpay fetch error:", error);
    return null;
  }
};

export const fetchBlockchainInfoRates = async (): Promise<RatesMap | null> => {
  try {
    const response = await fetch(`${CORS_PROXY}https://blockchain.info/ticker`);
    if (!response.ok) throw new Error("Blockchain.info API failed");
    const data: BlockchainInfoResponse = await response.json();

    const rates: RatesMap = {};
    Object.entries(data).forEach(([code, info]) => {
      rates[code] = {
        code: code,
        name: code,
        rate: 1 / info.last, // Convert to BTC per unit
      };
    });
    return rates;
  } catch (error) {
    console.error("Blockchain.info fetch error:", error);
    return null;
  }
};

// Merge rates from multiple sources and calculate average
export const fetchAverageRates = async (): Promise<RatesMap> => {
  try {
    const [coingecko, bitpay, blockchain] = await Promise.all([
      fetchCoingeckoRates(),
      fetchBitpayRates(),
      fetchBlockchainInfoRates(),
    ]);

    const allRates: RatesMap = {};
    const sources = [coingecko, bitpay, blockchain].filter(
      (r): r is RatesMap => r !== null,
    );

    if (sources.length === 0) {
      throw new Error("All APIs failed");
    }

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

    return allRates;
  } catch (error) {
    console.error("Error fetching rates:", error);
    throw error;
  }
};
