import { fileURLToPath } from 'node:url';
import { createAndroidE2EGlobalSetup } from '@minimalist-apps/android-e2e';

const appDirectory = fileURLToPath(new URL('..', import.meta.url));

export const globalSetup = createAndroidE2EGlobalSetup({ appDirectory });
