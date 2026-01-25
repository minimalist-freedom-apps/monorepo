import CurrencyRow from './CurrencyRow';
import './CurrencyList.css';
import type { RatesMap } from '../services/FetchRates';

interface CurrencyListProps {
    currencies: string[];
    rates: RatesMap;
    values: { [code: string]: string };
    onChange: (code: string, value: string) => void;
    onRemove: (code: string) => void;
    focusedInput: string;
    onFocus: (code: string) => void;
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
