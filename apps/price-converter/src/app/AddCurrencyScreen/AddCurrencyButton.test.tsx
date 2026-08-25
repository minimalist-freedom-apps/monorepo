import assert from 'node:assert/strict';
import { describe, mock, test } from 'node:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { NavigatorScreen } from '../../state/State.js';
import { ADD_CURRENCY_BUTTON_TEST_ID, AddCurrencyButtonPure } from './AddCurrencyButton.js';

interface CreateTestComponentProps {
    readonly navigate?: (screen: NavigatorScreen) => void;
}

const createTestComponent = ({
    navigate = mock.fn<(screen: NavigatorScreen) => void>(),
}: CreateTestComponentProps = {}) => {
    const deps = { navigate };
    const AddCurrencyButton = () => <>{AddCurrencyButtonPure(deps)}</>;

    return AddCurrencyButton;
};

describe('AddCurrencyButtonPure', () => {
    test('renders a button with Add Currency tooltip', () => {
        const AddCurrencyButton = createTestComponent();

        render(<AddCurrencyButton />);

        assert.ok(document.body.contains(screen.getByTestId(ADD_CURRENCY_BUTTON_TEST_ID)));
    });

    test('calls navigate with AddCurrency on click', async () => {
        const user = userEvent.setup();
        const navigate = mock.fn<(screen: NavigatorScreen) => void>();
        const AddCurrencyButton = createTestComponent({ navigate });

        render(<AddCurrencyButton />);
        await user.click(screen.getByTestId(ADD_CURRENCY_BUTTON_TEST_ID));

        assert.deepStrictEqual(navigate.mock.calls.at(-1)?.arguments, ['AddCurrency']);
    });
});
