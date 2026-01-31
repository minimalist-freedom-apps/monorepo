import { exhaustive } from '@minimalistic-apps/type-utils';
import { selectCurrentScreen, useStore } from '../state/createStore';
import { AddCurrencyScreen } from './AddCurrencyScreen/AddCurrencyScreen';
import { AppLayout } from './AppLayout';
import { ConverterScreen } from './ConverterScreen/ConverterScreen';

export const App = () => {
    const currentScreen = useStore(selectCurrentScreen);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'Converter':
                return <ConverterScreen />;
            case 'AddCurrency':
                return <AddCurrencyScreen />;
            default:
                return exhaustive(currentScreen);
        }
    };

    return <AppLayout>{renderScreen()}</AppLayout>;
};
