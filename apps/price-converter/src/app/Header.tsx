import './Header.css';

interface HeaderProps {
    onRefresh: () => void;
    loading: boolean;
    mode: string;
    onModeToggle: () => void;
}

export const Header = ({
    onRefresh,
    loading,
    mode,
    onModeToggle,
}: HeaderProps) => {
    return (
        <header className="header">
            <h1 className="title">Price Converter</h1>
            <div className="header-actions">
                <button
                    type="button"
                    className="mode-toggle-btn"
                    onClick={onModeToggle}
                    title={`Switch to ${mode === 'BTC' ? 'Sats' : 'BTC'}`}
                >
                    {mode}
                </button>
                <button
                    type="button"
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
};
