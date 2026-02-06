import { FloatButton, PlusOutlined } from '@minimalistic-apps/components';
import type React from 'react';
import type { StoreDep } from '../../state/createStore';

type AddCurrencyButtonDeps = StoreDep;

type AddCurrencyButton = React.FC;

export type AddCurrencyButtonDep = { AddCurrencyButton: AddCurrencyButton };

export const addCurrencyButtonPure = (
    deps: AddCurrencyButtonDeps,
): React.ReactNode => {
    const onClick = () => deps.store.setState({ currentScreen: 'AddCurrency' });

    return (
        <FloatButton
            icon={<PlusOutlined />}
            onClick={onClick}
            tooltip="Add Currency"
        />
    );
};
