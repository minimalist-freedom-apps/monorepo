import { useState, useMemo } from 'react';
import './AddCurrencyModal.css';

function AddCurrencyModal({ rates, selectedCurrencies, onAdd, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');

  const availableCurrencies = useMemo(() => {
    return Object.entries(rates)
      .filter(([code]) => !selectedCurrencies.includes(code))
      .sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [rates, selectedCurrencies]);

  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return availableCurrencies;
    
    const term = searchTerm.toLowerCase();
    return availableCurrencies.filter(([code, info]) => 
      code.toLowerCase().includes(term) || 
      info.name.toLowerCase().includes(term)
    );
  }, [availableCurrencies, searchTerm]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Currency</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
