import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Services } from './compositionRoot';

const ServicesContext = createContext<Services | null>(null);

export interface ServicesProviderProps {
    readonly services: Services;
    readonly children: ReactNode;
}

export const ServicesProvider = ({
    services,
    children,
}: ServicesProviderProps) => (
    <ServicesContext.Provider value={services}>
        {children}
    </ServicesContext.Provider>
);

export const useServices = (): Services => {
    const services = useContext(ServicesContext);
    if (!services) {
        throw new Error('useServices must be used within ServicesProvider');
    }
    return services;
};
