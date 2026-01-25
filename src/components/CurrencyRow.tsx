import { useEffect, useRef } from "react";
import "./CurrencyRow.css";

interface CurrencyRowProps {
  code: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  focused: boolean;
  onFocus: () => void;
}

function CurrencyRow({
  code,
  name,
  value,
  onChange,
  onRemove,
  focused,
  onFocus,
}: CurrencyRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focused && inputRef.current) {
      inputRef.current.select();
    }
  }, [focused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <button className="remove-btn" onClick={onRemove} title="Remove currency">
        ×
      </button>
    </div>
  );
}

export default CurrencyRow;
