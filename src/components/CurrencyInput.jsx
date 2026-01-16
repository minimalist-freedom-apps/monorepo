import { useEffect, useRef } from 'react';
import './CurrencyInput.css';

function CurrencyInput({ label, value, onChange, focused, onFocus }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.select();
    }
  }, [focused]);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="currency-input-container">
      <input
        ref={inputRef}
        type="text"
        className="currency-input btc-input"
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        placeholder="0"
        inputMode="decimal"
      />
      <span className="currency-label">{label}</span>
    </div>
  );
}

export default CurrencyInput;
