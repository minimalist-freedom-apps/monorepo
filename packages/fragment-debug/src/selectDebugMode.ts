import type { DebugState } from './debugState';

export const selectDebugMode = (state: DebugState): boolean => state.debugMode;
