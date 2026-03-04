import type { OwnerId } from '@evolu/common';
import type { EvoluStoreDep } from './evoluState';

export type SetActiveOwnerAppId = (ownerAppId: OwnerId) => void;

export type SetActiveOwnerAppIdDep = {
    readonly setActiveOwnerAppId: SetActiveOwnerAppId;
};

export const createSetActiveOwnerAppId =
    (deps: EvoluStoreDep): SetActiveOwnerAppId =>
    (activeOwnerAppId): void => {
        deps.store.setState({ activeOwnerAppId });
    };
