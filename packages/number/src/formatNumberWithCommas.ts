import { addThousandSeparators } from './addThousandSeparators';

interface FormatNumberWithCommasProps {
    readonly value: number;
    readonly precision: number;
}

export const formatNumberWithCommas = ({
    value,
    precision,
}: FormatNumberWithCommasProps): string => {
    const str = value.toFixed(precision);
    const [intPart, decPart] = str.split('.');
    const formattedInt = addThousandSeparators(intPart);
    const formattedDec = decPart ? decPart.replace(/0+$/, '') : '';

    return formattedInt + (formattedDec ? `.${formattedDec}` : '');
};
