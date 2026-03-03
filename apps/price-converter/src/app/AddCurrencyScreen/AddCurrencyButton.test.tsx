import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { AddCurrencyButtonPure } from './AddCurrencyButton.js';

const createTestComponent = () => {
    const navigate = vi.fn();
    const deps = { navigate };
    const AddCurrencyButton = () => <>{AddCurrencyButtonPure(deps)}</>;

    return { navigate, AddCurrencyButton };
};

describe(AddCurrencyButtonPure.name, () => {
    test('renders a button with Add Currency tooltip', () => {
        const { AddCurrencyButton } = createTestComponent();

        render(<AddCurrencyButton />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('calls navigate with AddCurrency on click', async () => {
        const user = userEvent.setup();
        const { navigate, AddCurrencyButton } = createTestComponent();

        render(<AddCurrencyButton />);
        await user.click(screen.getByRole('button'));

        expect(navigate).toHaveBeenCalledWith('AddCurrency');
    });
});
