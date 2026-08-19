// src/contexts/RealTimeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

type RealTimeContextType = {
    realTimeEnabled: boolean;
    activeTrackerName: string | null;
    setRealTimeEnabled: (value: boolean, trackerName?: string) => void;
    vigilanteEnabled: boolean;
    setVigilanteEnabled: (value: boolean) => void;
};

const RealTimeContext = createContext<RealTimeContextType | null>(null);

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
    const [realTimeEnabled, setRealTimeEnabledState] = useState(false);
    const [activeTrackerName, setActiveTrackerName] = useState<string | null>(null);
    const [vigilanteEnabled, setVigilanteEnabledState] = useState(false);

    const setRealTimeEnabled = useCallback((value: boolean, trackerName?: string) => {
        setRealTimeEnabledState(value);
        setActiveTrackerName(value ? (trackerName ?? null) : null);

        // Sem tempo real ativo, o modo vigilante não pode continuar ligado
        if (!value) {
            setVigilanteEnabledState(false);
        }
    }, []);

    const setVigilanteEnabled = useCallback((value: boolean) => {
        setVigilanteEnabledState(value);
    }, []);

    return (
        <RealTimeContext.Provider
            value={{
                realTimeEnabled,
                activeTrackerName,
                setRealTimeEnabled,
                vigilanteEnabled,
                setVigilanteEnabled,
            }}
        >
            {children}
        </RealTimeContext.Provider>
    );
}

export function useRealTime() {
    const context = useContext(RealTimeContext);
    if (!context) {
        throw new Error('useRealTime deve ser usado dentro de RealTimeProvider');
    }
    return context;
}