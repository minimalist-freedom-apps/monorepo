import { FloatButton, PlusOutlined } from '@minimalist-apps/components';
import type { NavigateDep } from '@minimalist-apps/navigator';
import type { FC } from 'react';
import type { NavigatorScreen } from '../../state/State';

type AddCurrencyButtonDeps = NavigateDep<NavigatorScreen>;

export type AddCurrencyButtonDep = { AddCurrencyButton: FC };

export const AddCurrencyButtonPure = (deps: AddCurrencyButtonDeps) => {
    const onClick = () => deps.navigate('AddCurrency');

    return <FloatButton icon={<PlusOutlined />} onClick={onClick} tooltip="Add Currency" />;
};
