import { useState } from "react";
import "./AddCurrencyModal.css";
import { RatesMap } from "../services/api";

interface AddCurrencyModalProps {
  rates: RatesMap;
  selectedCurrencies: string[];
  onAdd: (code: string) => void;
  onClose: () => void;
}

function AddCurrencyModal({
  rates,
  selectedCurrencies,
  onAdd,
  onClose,
}: AddCurrencyModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const availableCurrencies = Object.entries(rates)
    .filter(([code]) => !selectedCurrencies.includes(code))
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  const filteredCurrencies = !searchTerm
    ? availableCurrencies
    : availableCurrencies.filter(([code, info]) => {
        const term = searchTerm.toLowerCase();
        return (
          code.toLowerCase().includes(term) ||
          info.name.toLowerCase().includes(term)
        );
      });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Currency</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Search currencies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />

        <div className="currency-list-modal">
          {filteredCurrencies.length === 0 ? (
            <div className="no-results">No currencies found</div>
          ) : (
            filteredCurrencies.map(([code, info]) => (
              <div
                key={code}
                className="currency-item"
                onClick={() => onAdd(code)}
              >
                <span className="currency-code-modal">{code}</span>
                <span className="currency-name">{info.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCurrencyModal;
