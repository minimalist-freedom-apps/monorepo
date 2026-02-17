import type { GameStore, OpeningProtocol } from './createGameStore';

export type SetOpeningProtocol = (protocol: OpeningProtocol) => void;

export type SetOpeningProtocolDeps = {
    readonly setOpeningProtocol: SetOpeningProtocol;
};

interface CreateSetOpeningProtocolDeps {
    readonly gameStore: GameStore;
}

export const createSetOpeningProtocol =
    (deps: CreateSetOpeningProtocolDeps): SetOpeningProtocol =>
    protocol => {
        deps.gameStore.setOpeningProtocol(protocol);
    };
