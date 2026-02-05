import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Deps } from './compositionRoot';

const ServicesContext = createContext<Deps | null>(null);

export interface DepsProviderProps {
    readonly deps: Deps;
    readonly children: ReactNode;
}

export const DepsProvider = ({
    deps: services,
    children,
}: DepsProviderProps) => (
    <ServicesContext.Provider value={services}>
        {children}
    </ServicesContext.Provider>
);

export const useDeps = (): Deps => {
    const services = useContext(ServicesContext);

    if (!services) {
        throw new Error('useServices must be used within ServicesProvider');
    }

    return services;
};
