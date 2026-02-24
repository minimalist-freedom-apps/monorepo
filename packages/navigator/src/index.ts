export type Navigate<Screen> = (screen: Screen) => void;

export interface NavigateDep<Screen> {
    readonly navigate: Navigate<Screen>;
}

export type GoBack = () => void;

export interface GoBackDep {
    readonly goBack: GoBack;
}
