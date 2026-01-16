import './Header.css';

function Header({ onRefresh, loading, mode, onModeToggle }) {
  return (
    <header className="header">
      <h1 className="title">Price Converter</h1>
      <div className="header-actions">
        <button 
          className="mode-toggle-btn"
          onClick={onModeToggle}
          title={`Switch to ${mode === 'BTC' ? 'Sats' : 'BTC'}`}
        >
          {mode}
        </button>
        <button 
          className="refresh-btn" 
          onClick={onRefresh}
          disabled={loading}
          title="Refresh rates"
        >
          ↻
        </button>
      </div>
    </header>
  );
}

export default Header;
