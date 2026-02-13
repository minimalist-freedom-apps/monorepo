export const groupBtcDecimalDigits = (decimalPart: string): string => {
    let result = '';
    let count = 0;

    for (let i = decimalPart.length - 1; i >= 0; i--) {
        if (count === 3 && i < decimalPart.length - 1) {
            result = `,${result}`;
            count = 0;
        }

        result = decimalPart[i] + result;
        count++;
    }

    return result;
};
