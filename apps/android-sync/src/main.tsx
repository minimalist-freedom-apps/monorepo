import { installPolyfills } from '@minimalist-apps/evolu';
import { setupMobileNative } from '@minimalist-apps/mobile-native';
import { createCompositionRoot } from './compositionRoot';

installPolyfills();

setupMobileNative();

const main = createCompositionRoot();

main();
