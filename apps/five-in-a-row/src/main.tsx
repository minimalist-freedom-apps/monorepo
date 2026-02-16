import { setupMobileNative } from '@minimalist-apps/mobile-native';
import { createCompositionRoot } from './compositionRoot';

setupMobileNative();

const main = createCompositionRoot();

main();
