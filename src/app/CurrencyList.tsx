import CurrencyRow from './CurrencyRow';
import './CurrencyList.css';
import type { CurrencyCode, RatesMap } from '../services/FetchRates';

interface CurrencyListProps {
    currencies: CurrencyCode[];
    rates: RatesMap;
    values: Record<CurrencyCode, string>;
    onChange: (code: CurrencyCode, value: string) => void;
    onRemove: (code: CurrencyCode) => void;
    focusedInput: CurrencyCode | 'BTC';
    onFocus: (code: CurrencyCode) => void;
}

function CurrencyList({
    currencies,
    rates,
    values,
    onChange,
    onRemove,
    focusedInput,
    onFocus,
}: CurrencyListProps) {
    return (
        <div className="currency-list">
            {currencies.map(code => (
                <CurrencyRow
                    key={code}
                    code={code}
                    name={rates[code]?.name || code}
                    value={values[code] || ''}
                    onChange={value => onChange(code, value)}
                    onRemove={() => onRemove(code)}
                    focused={focusedInput === code}
                    onFocus={() => onFocus(code)}
                />
            ))}
        </div>
    );
}

export default CurrencyList;
