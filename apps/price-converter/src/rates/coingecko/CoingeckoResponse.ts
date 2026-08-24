import {
    String as EvoluString,
    minLength,
    object,
    PositiveFiniteNumber,
    record,
    Unknown,
} from '@evolu/common';

const UnknownProperties = record(EvoluString, Unknown);
const NonEmptyString = minLength(1)(EvoluString);

const CoingeckoRate = object(
    {
        name: NonEmptyString,
        type: NonEmptyString,
        value: PositiveFiniteNumber,
    },
    UnknownProperties,
);

export const CoingeckoResponse = object(
    {
        rates: record(EvoluString, CoingeckoRate),
    },
    UnknownProperties,
);
export type CoingeckoResponse = typeof CoingeckoResponse.Output;
