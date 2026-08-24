import {
    array,
    brand,
    String as EvoluString,
    FiniteNumber,
    minLength,
    object,
    positive,
    record,
    Unknown,
} from '@evolu/common';

const UnknownProperties = record(EvoluString, Unknown);
const NonEmptyString = minLength(1)(EvoluString);

export const PositiveFiniteNumber = brand('PositiveFiniteNumber', positive(FiniteNumber));
export type PositiveFiniteNumber = typeof PositiveFiniteNumber.Output;

const BitpayRate = object(
    {
        code: NonEmptyString,
        name: NonEmptyString,
        rate: PositiveFiniteNumber,
    },
    UnknownProperties,
);

export const BitpayResponse = object(
    {
        data: array(BitpayRate),
    },
    UnknownProperties,
);

const BlockchainInfoRate = object(
    {
        last: PositiveFiniteNumber,
    },
    UnknownProperties,
);

export const BlockchainInfoResponse = record(EvoluString, BlockchainInfoRate);

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

export const getPositiveFiniteReciprocal = (value: unknown): PositiveFiniteNumber | null => {
    const valueResult = PositiveFiniteNumber.fromUnknown(value);

    if (!valueResult.ok) {
        return null;
    }

    const reciprocal = PositiveFiniteNumber.orNull(1 / valueResult.value);

    return reciprocal;
};
