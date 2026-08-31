import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
} from 'react';

import { TrackerService } from '../services/Trackerservice';

type TrackerServiceContextType = {
    getService: (phone: string) => TrackerService;
    clearService: () => void;
};

const TrackerServiceContext =
    createContext<TrackerServiceContextType | null>(null);

export function TrackerServiceProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const currentPhoneRef = useRef<string | null>(null);
    const serviceRef = useRef<TrackerService | null>(null);

    const getService = useCallback((phone: string): TrackerService => {
        const normalizedPhone = phone.replace(/\D/g, '');

        if (!normalizedPhone) {
            throw new Error(
                'Número de telefone do rastreador não informado.'
            );
        }

        // Se já existe um serviço para o mesmo número,
        // reaproveita o serviço existente.
        if (
            serviceRef.current &&
            currentPhoneRef.current === normalizedPhone
        ) {
            return serviceRef.current;
        }

        // Se mudou o rastreador, destrói o serviço anterior.
        serviceRef.current?.destroy();

        const service = new TrackerService(normalizedPhone);

        serviceRef.current = service;
        currentPhoneRef.current = normalizedPhone;

        return service;
    }, []);

    const clearService = useCallback(() => {
        serviceRef.current?.destroy();

        serviceRef.current = null;
        currentPhoneRef.current = null;
    }, []);

    return (
        <TrackerServiceContext.Provider
            value={{
                getService,
                clearService,
            }}
        >
            {children}
        </TrackerServiceContext.Provider>
    );
}

export function useTrackerServiceProvider(): TrackerServiceContextType {
    const context = useContext(TrackerServiceContext);

    if (!context) {
        throw new Error(
            'useTrackerServiceProvider deve ser usado dentro de TrackerServiceProvider'
        );
    }

    return context;
}