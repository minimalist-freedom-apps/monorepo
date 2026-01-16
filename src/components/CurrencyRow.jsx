import { useEffect, useRef } from 'react';
import './CurrencyRow.css';

function CurrencyRow({ code, name, value, onChange, onRemove, focused, onFocus }) {
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
    <div className="currency-row">
      <input
        ref={inputRef}
        type="text"
        className="currency-input"
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        placeholder="0"
        inputMode="decimal"
      />
      <div className="currency-info">
        <span className="currency-code">{code}</span>
      </div>
      <button 
        className="remove-btn" 
        onClick={onRemove}
        title="Remove currency"
      >
        ×
      </button>
    </div>
  );
}

export default CurrencyRow;
