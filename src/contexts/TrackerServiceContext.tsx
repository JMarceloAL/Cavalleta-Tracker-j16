// src/contexts/TrackerServiceContext.tsx
import React, { createContext, useContext, useRef, useCallback } from 'react';
import { TrackerService } from '../services/Trackerservice';

type TrackerServiceContextType = {
    getService: (phone: string) => TrackerService;
    clearService: () => void;
};

const TrackerServiceContext = createContext<TrackerServiceContextType | null>(null);

export function TrackerServiceProvider({ children }: { children: React.ReactNode }) {
    const currentPhoneRef = useRef<string | null>(null);
    const serviceRef = useRef<TrackerService | null>(null);

    const getService = useCallback((phone: string) => {
        // Se já existe um serviço pro mesmo número, reaproveita
        if (serviceRef.current && currentPhoneRef.current === phone) {
            return serviceRef.current;
        }

        // Troca de número (ou primeira vez) — destrói o antigo, cria novo
        serviceRef.current?.destroy();
        serviceRef.current = new TrackerService(phone);
        currentPhoneRef.current = phone;

        return serviceRef.current;
    }, []);

    const clearService = useCallback(() => {
        serviceRef.current?.destroy();
        serviceRef.current = null;
        currentPhoneRef.current = null;
    }, []);

    return (
        <TrackerServiceContext.Provider value={{ getService, clearService }}>
            {children}
        </TrackerServiceContext.Provider>
    );
}

export function useTrackerServiceProvider() {
    const context = useContext(TrackerServiceContext);
    if (!context) {
        throw new Error('useTrackerServiceProvider deve ser usado dentro de TrackerServiceProvider');
    }
    return context;
}