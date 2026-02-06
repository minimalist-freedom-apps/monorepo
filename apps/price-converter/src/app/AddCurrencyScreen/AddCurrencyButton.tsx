import { FloatButton, PlusOutlined } from '@minimalistic-apps/components';
import type { Connected } from '@minimalistic-apps/mini-store';
import type { StoreDep } from '../../state/createStore';

type AddCurrencyButtonDeps = StoreDep;

export type AddCurrencyButtonDep = { AddCurrencyButton: Connected };

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
