import { exhaustive } from '@minimalistic-apps/type-utils';
import { useDeps } from '../ServicesProvider';
import { selectCurrentScreen, useStore } from '../state/createStore';
import { AddCurrencyScreen } from './AddCurrencyScreen/AddCurrencyScreen';
import { AppLayout } from './AppLayout';

export const App = () => {
    const deps = useDeps();
    const currentScreen = useStore(selectCurrentScreen);

    const renderScreen = () => {
        switch (currentScreen) {
            case 'Converter':
                return <deps.ConverterScreen />;
            case 'AddCurrency':
                return <AddCurrencyScreen />;
            case 'Settings':
                return <deps.SettingsScreen />;
            default:
                return exhaustive(currentScreen);
        }
    };

    return <AppLayout>{renderScreen()}</AppLayout>;
};
