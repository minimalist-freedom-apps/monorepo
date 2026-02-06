import { FloatButton, PlusOutlined } from '@minimalistic-apps/components';
import type { FC } from 'react';
import type { StoreDep } from '../../state/createStore';

type AddCurrencyButtonDeps = StoreDep;

export type AddCurrencyButtonDep = { AddCurrencyButton: FC };

export const AddCurrencyButtonPure = (deps: AddCurrencyButtonDeps) => {
    const onClick = () => deps.store.setState({ currentScreen: 'AddCurrency' });

    return (
        <FloatButton
            icon={<PlusOutlined />}
            onClick={onClick}
            tooltip="Add Currency"
        />
    );
};
