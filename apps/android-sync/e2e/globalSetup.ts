import { fileURLToPath } from 'node:url';
import { createAndroidE2EGlobalSetup } from '@minimalist-apps/android-e2e';

const appDirectory = fileURLToPath(new URL('..', import.meta.url));

export const runAndroidE2EGlobalSetup = createAndroidE2EGlobalSetup({ appDirectory });

if (import.meta.main) {
    await runAndroidE2EGlobalSetup();
}
