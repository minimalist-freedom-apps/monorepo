export type CurrentDateTime = () => number;

export interface CurrentDateTimeDep {
    readonly currentDateTime: CurrentDateTime;
}

export const createCurrentDateTime = (): CurrentDateTime => () => Date.now();
