import { selectCurrentScreen, useStore } from '../state/createStore';
import { AddCurrencyScreen } from './AddCurrencyScreen/AddCurrencyScreen';
import { AppLayout } from './AppLayout';
import { ConverterScreen } from './ConverterScreen/ConverterScreen';

export const App = () => {
    const currentScreen = useStore(selectCurrentScreen);

    return (
        <AppLayout>
            {currentScreen === 'Converter' && <ConverterScreen />}
            {currentScreen === 'AddCurrency' && <AddCurrencyScreen />}
        </AppLayout>
    );
};
