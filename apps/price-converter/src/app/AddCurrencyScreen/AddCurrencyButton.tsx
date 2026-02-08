import { FloatButton, PlusOutlined } from '@minimalist-apps/components';
import type { FC } from 'react';
import type { NavigateDep } from '../../state/navigate';

type AddCurrencyButtonDeps = NavigateDep;

export type AddCurrencyButtonDep = { AddCurrencyButton: FC };

export const AddCurrencyButtonPure = (deps: AddCurrencyButtonDeps) => {
    const onClick = () => deps.navigate('AddCurrency');

    return <FloatButton icon={<PlusOutlined />} onClick={onClick} tooltip="Add Currency" />;
};
