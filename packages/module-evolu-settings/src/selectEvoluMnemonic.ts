import type { EvoluState } from './evoluState';

export const selectEvoluMnemonic = <State extends EvoluState>(state: State) => state.evoluMnemonic;
