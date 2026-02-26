import { fileURLToPath } from 'node:url';
import { createAndroidE2EGlobalSetup } from '@minimalist-apps/android-e2e';

const appDirectory = fileURLToPath(new URL('..', import.meta.url));

// biome-ignore lint/style/noDefaultExport: Vitest globalSetup entry requires a default export.
export default createAndroidE2EGlobalSetup({ appDirectory });
