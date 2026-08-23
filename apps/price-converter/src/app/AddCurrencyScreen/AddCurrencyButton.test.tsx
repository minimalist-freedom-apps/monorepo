import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { NavigatorScreen } from '../../state/State.js';
import { ADD_CURRENCY_BUTTON_TEST_ID, AddCurrencyButtonPure } from './AddCurrencyButton.js';

interface CreateTestComponentProps {
    readonly navigate?: (screen: NavigatorScreen) => void;
}

const createTestComponent = ({ navigate = vi.fn() }: CreateTestComponentProps = {}) => {
    const deps = { navigate };
    const AddCurrencyButton = () => <>{AddCurrencyButtonPure(deps)}</>;

    return AddCurrencyButton;
};

describe('AddCurrencyButtonPure', () => {
    test('renders a button with Add Currency tooltip', () => {
        const AddCurrencyButton = createTestComponent();

        render(<AddCurrencyButton />);

        expect(screen.getByTestId(ADD_CURRENCY_BUTTON_TEST_ID)).toBeInTheDocument();
    });

    test('calls navigate with AddCurrency on click', async () => {
        const user = userEvent.setup();
        const navigate = vi.fn();
        const AddCurrencyButton = createTestComponent({ navigate });

        render(<AddCurrencyButton />);
        await user.click(screen.getByTestId(ADD_CURRENCY_BUTTON_TEST_ID));

        expect(navigate).toHaveBeenCalledWith('AddCurrency');
    });
});
