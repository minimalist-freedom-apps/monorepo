import { useState, useEffect, useRef } from 'react';
import { fetchAverageRates } from './services/api';
import {
  formatBtcWithCommas,
  formatFiatWithCommas,
  formatSats,
  parseFormattedNumber,
  btcToSats,
  satsToBtc,
  getTimeAgo,
  isLongerThan1Hour,
  saveToLocalStorage,
  loadFromLocalStorage
} from './utils/helpers';
import Header from './components/Header';
import CurrencyInput from './components/CurrencyInput';
import CurrencyList from './components/CurrencyList';
import AddCurrencyModal from './components/AddCurrencyModal';
import './App.css';

const STORAGE_KEYS = {
  RATES: 'rates',
  TIMESTAMP: 'timestamp',
  SELECTED_CURRENCIES: 'selectedCurrencies',
  MODE: 'mode'
};

function App() {
  const [rates, setRates] = useState({});
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);
  const [btcValue, setBtcValue] = useState('');
  const [currencyValues, setCurrencyValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgo, setTimeAgo] = useState('');
  const [mode, setMode] = useState('BTC'); // 'BTC' or 'Sats'
  const [showModal, setShowModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState('BTC');
  const intervalRef = useRef(null);

  // Load saved data on mount
  useEffect(() => {
    const savedRates = loadFromLocalStorage(STORAGE_KEYS.RATES);
    const savedTimestamp = loadFromLocalStorage(STORAGE_KEYS.TIMESTAMP);
    const savedCurrencies = loadFromLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES);
    const savedMode = loadFromLocalStorage(STORAGE_KEYS.MODE, 'BTC');

    if (savedRates) {
      setRates(savedRates);
    }
    
    if (savedTimestamp) {
      setLastUpdated(savedTimestamp);
    }

    if (savedCurrencies && savedCurrencies.length > 0) {
      setSelectedCurrencies(savedCurrencies);
    } else {
      // Default to USD
      setSelectedCurrencies(['USD']);
    }

    setMode(savedMode);

    // Fetch rates on mount
    fetchRates();
  }, []);

  // Update time ago every second
  useEffect(() => {
    if (lastUpdated) {
      const updateTime = () => {
        setTimeAgo(getTimeAgo(lastUpdated));
      };
      updateTime();
      intervalRef.current = setInterval(updateTime, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [lastUpdated]);

  // Fetch rates from APIs
  const fetchRates = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedRates = await fetchAverageRates();
      setRates(fetchedRates);
      const now = Date.now();
      setLastUpdated(now);
      
      // Save to localStorage
      saveToLocalStorage(STORAGE_KEYS.RATES, fetchedRates);
      saveToLocalStorage(STORAGE_KEYS.TIMESTAMP, now);
      
      // Recalculate values with new rates
      if (btcValue) {
        recalculateFromBtc(btcValue, fetchedRates);
      }
    } catch (err) {
      setError('Failed to fetch rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate all values from BTC input
  const recalculateFromBtc = (value, currentRates = rates) => {
    const btcAmount = parseFormattedNumber(value);
    if (isNaN(btcAmount) || btcAmount === 0) {
      setCurrencyValues({});
      return;
    }

    const newValues = {};
    selectedCurrencies.forEach(code => {
      if (currentRates[code]) {
        const fiatAmount = btcAmount / currentRates[code].rate;
        newValues[code] = formatFiatWithCommas(fiatAmount);
      }
    });
    setCurrencyValues(newValues);
  };

  // Recalculate all values from a currency input
  const recalculateFromCurrency = (code, value) => {
    const fiatAmount = parseFormattedNumber(value);
    if (isNaN(fiatAmount) || fiatAmount === 0 || !rates[code]) {
      setBtcValue('');
      setCurrencyValues({});
      return;
    }

    const btcAmount = fiatAmount * rates[code].rate;
    const formattedBtc = mode === 'BTC' 
      ? formatBtcWithCommas(btcAmount)
      : formatSats(btcToSats(btcAmount));
    setBtcValue(formattedBtc);

    // Update other currencies
    const newValues = { ...currencyValues, [code]: value };
    selectedCurrencies.forEach(otherCode => {
      if (otherCode !== code && rates[otherCode]) {
        const otherFiatAmount = btcAmount / rates[otherCode].rate;
        newValues[otherCode] = formatFiatWithCommas(otherFiatAmount);
      }
    });
    setCurrencyValues(newValues);
  };

  // Handle BTC/Sats input change
  const handleBtcChange = (value) => {
    setBtcValue(value);
    setFocusedInput('BTC');
    
    let btcAmount;
    if (mode === 'Sats') {
      const sats = parseFormattedNumber(value);
      btcAmount = satsToBtc(sats);
    } else {
      btcAmount = parseFormattedNumber(value);
    }
    
    if (isNaN(btcAmount) || btcAmount === 0) {
      setCurrencyValues({});
      return;
    }

    recalculateFromBtc(formatBtcWithCommas(btcAmount));
  };

  // Handle currency input change
  const handleCurrencyChange = (code, value) => {
    setFocusedInput(code);
    setCurrencyValues(prev => ({ ...prev, [code]: value }));
    recalculateFromCurrency(code, value);
  };

  // Add currency to list
  const addCurrency = (code) => {
    if (!selectedCurrencies.includes(code)) {
      const newCurrencies = [...selectedCurrencies, code];
      setSelectedCurrencies(newCurrencies);
      saveToLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES, newCurrencies);
      
      // Calculate value for new currency if BTC has a value
      if (btcValue) {
        const btcAmount = mode === 'Sats' 
          ? satsToBtc(parseFormattedNumber(btcValue))
          : parseFormattedNumber(btcValue);
        
        if (rates[code]) {
          const fiatAmount = btcAmount / rates[code].rate;
          setCurrencyValues(prev => ({
            ...prev,
            [code]: formatFiatWithCommas(fiatAmount)
          }));
        }
      }
    }
    setShowModal(false);
  };

  // Remove currency from list
  const removeCurrency = (code) => {
    const newCurrencies = selectedCurrencies.filter(c => c !== code);
    setSelectedCurrencies(newCurrencies);
    saveToLocalStorage(STORAGE_KEYS.SELECTED_CURRENCIES, newCurrencies);
    
    const newValues = { ...currencyValues };
    delete newValues[code];
    setCurrencyValues(newValues);
  };

  // Toggle between BTC and Sats mode
  const toggleMode = () => {
    const newMode = mode === 'BTC' ? 'Sats' : 'BTC';
    setMode(newMode);
    saveToLocalStorage(STORAGE_KEYS.MODE, newMode);
    
    // Convert current BTC value
    if (btcValue) {
      const currentValue = parseFormattedNumber(btcValue);
      if (newMode === 'Sats') {
        const btcAmount = mode === 'BTC' ? currentValue : satsToBtc(currentValue);
        setBtcValue(formatSats(btcToSats(btcAmount)));
      } else {
        const btcAmount = mode === 'Sats' ? satsToBtc(currentValue) : currentValue;
        setBtcValue(formatBtcWithCommas(btcAmount));
      }
    }
  };

  return (
    <div className="app">
      <Header 
        onRefresh={fetchRates}
        loading={loading}
        mode={mode}
        onModeToggle={toggleMode}
      />
      
      <div className="container">
        {loading && <div className="loading-bar" />}
        
        {error && <div className="error-message">{error}</div>}
        
        <div className={`time-ago ${isLongerThan1Hour(lastUpdated || Date.now()) ? 'warning' : ''}`}>
          {timeAgo || 'Never updated'}
        </div>
        
        <CurrencyInput
          label={mode}
          value={btcValue}
          onChange={handleBtcChange}
          focused={focusedInput === 'BTC'}
          onFocus={() => setFocusedInput('BTC')}
        />
        
        <CurrencyList
          currencies={selectedCurrencies}
          rates={rates}
          values={currencyValues}
          onChange={handleCurrencyChange}
          onRemove={removeCurrency}
          focusedInput={focusedInput}
          onFocus={setFocusedInput}
        />
        
        <button className="add-button" onClick={() => setShowModal(true)}>
          + Add Currency
        </button>
      </div>
      
      {showModal && (
        <AddCurrencyModal
          rates={rates}
          selectedCurrencies={selectedCurrencies}
          onAdd={addCurrency}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default App;
