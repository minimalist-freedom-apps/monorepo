import CurrencyRow from './CurrencyRow';
import './CurrencyList.css';

function CurrencyList({ currencies, rates, values, onChange, onRemove, focusedInput, onFocus }) {
  return (
    <div className="currency-list">
      {currencies.map(code => (
        <CurrencyRow
          key={code}
          code={code}
          name={rates[code]?.name || code}
          value={values[code] || ''}
          onChange={(value) => onChange(code, value)}
          onRemove={() => onRemove(code)}
          focused={focusedInput === code}
          onFocus={() => onFocus(code)}
        />
      ))}
    </div>
  );
}

export default CurrencyList;
