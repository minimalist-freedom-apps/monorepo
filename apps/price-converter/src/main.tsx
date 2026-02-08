import { setupMobileNative } from '@minimalistic-apps/mobile-native';
import { createCompositionRoot } from './compositionRoot';

setupMobileNative();

const main = createCompositionRoot();

main();
