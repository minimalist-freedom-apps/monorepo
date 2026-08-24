import {
    array,
    String as EvoluString,
    minLength,
    object,
    PositiveFiniteNumber,
    record,
    Unknown,
} from '@evolu/common';

const UnknownProperties = record(EvoluString, Unknown);
const NonEmptyString = minLength(1)(EvoluString);

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
export type BitpayResponse = typeof BitpayResponse.Output;
