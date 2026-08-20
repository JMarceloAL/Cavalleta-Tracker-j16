// src/contexts/RealTimeContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { fetchTrackerLocationFromApi } from '../services/TrackerApiService';
import {
    saveLastLocation,
    saveStoppedLocation,
    getStoppedLocation,
} from '../services/storage/LastlocationStorage';
import { distanceInMeters } from '../utils/geo';
import { sendMovementNotification } from '../services/NotificationService';
import type { TrackerLocation } from '../types/Tracker';

const MOVEMENT_THRESHOLD_METERS = 30;
const NOTIFICATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
const POLL_INTERVAL_MS = 2000;
const KEEP_AWAKE_TAG = 'vigilante-mode';

type RealTimeContextType = {
    realTimeEnabled: boolean;
    activeTrackerName: string | null;
    activeTrackerId: string | null;
    activeTrackerImei: string | null;
    setRealTimeEnabled: (
        value: boolean,
        trackerId?: string,
        trackerName?: string,
        trackerImei?: string
    ) => void;
    vigilanteEnabled: boolean;
    setVigilanteEnabled: (value: boolean) => void;
    latestLocation: TrackerLocation | null;
};

const RealTimeContext = createContext<RealTimeContextType | null>(null);

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
    const [realTimeEnabled, setRealTimeEnabledState] = useState(false);
    const [activeTrackerName, setActiveTrackerName] = useState<string | null>(null);
    const [activeTrackerId, setActiveTrackerId] = useState<string | null>(null);
    const [activeTrackerImei, setActiveTrackerImei] = useState<string | null>(null);
    const [vigilanteEnabled, setVigilanteEnabledState] = useState(false);
    const [latestLocation, setLatestLocation] = useState<TrackerLocation | null>(null);

    const isMovingRef = useRef(false);
    const lastNotifiedAtRef = useRef<number | null>(null);

    const setRealTimeEnabled = useCallback(
        (value: boolean, trackerId?: string, trackerName?: string, trackerImei?: string) => {
            setRealTimeEnabledState(value);
            setActiveTrackerId(value ? (trackerId ?? null) : null);
            setActiveTrackerName(value ? (trackerName ?? null) : null);
            setActiveTrackerImei(value ? (trackerImei ?? null) : null);

            if (!value) {
                setVigilanteEnabledState(false);
                setLatestLocation(null);
            }

            isMovingRef.current = false;
            lastNotifiedAtRef.current = null;
        },
        []
    );

    const setVigilanteEnabled = useCallback((value: boolean) => {
        setVigilanteEnabledState(value);
    }, []);

    // Polling contínuo — roda independente de qual tela está montada,
    // enquanto o processo do app existir (foreground ou minimizado).
    useEffect(() => {
        if (!realTimeEnabled || !activeTrackerImei || !activeTrackerId) return;

        const trackerId = activeTrackerId;
        const trackerName = activeTrackerName ?? 'Rastreador';
        const imei = activeTrackerImei;

        if (vigilanteEnabled) {
            activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => undefined);
        }

        async function checkVigilante(newLocation: TrackerLocation) {
            if (!vigilanteEnabled) return;

            const referenceLocation = await getStoppedLocation(trackerId);
            if (!referenceLocation) return;

            const distance = distanceInMeters(
                referenceLocation.latitude,
                referenceLocation.longitude,
                newLocation.latitude,
                newLocation.longitude
            );

            const isMoving = distance > MOVEMENT_THRESHOLD_METERS;

            if (isMoving) {
                const now = Date.now();
                const elapsed = now - (lastNotifiedAtRef.current ?? 0);

                if (!isMovingRef.current || elapsed >= NOTIFICATION_INTERVAL_MS) {
                    await sendMovementNotification(trackerName);
                    lastNotifiedAtRef.current = now;
                }

                isMovingRef.current = true;
            } else {
                isMovingRef.current = false;
            }
        }

        async function pollApi() {
            try {
                const newLocation = await fetchTrackerLocationFromApi(imei);
                setLatestLocation(newLocation);
                await saveLastLocation(trackerId, newLocation);

                const isStopped = typeof newLocation.speed === 'number' ? newLocation.speed <= 2 : false;
                if (isStopped) {
                    await saveStoppedLocation(trackerId, newLocation);
                }

                await checkVigilante(newLocation);
            } catch (error: any) {
                console.log('⚠️ Erro no polling da API (background):', error.message);
            }
        }

        pollApi();
        const interval = setInterval(pollApi, POLL_INTERVAL_MS);

        return () => {
            clearInterval(interval);
            deactivateKeepAwake(KEEP_AWAKE_TAG);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realTimeEnabled, activeTrackerImei, activeTrackerId, vigilanteEnabled]);

    return (
        <RealTimeContext.Provider
            value={{
                realTimeEnabled,
                activeTrackerName,
                activeTrackerId,
                activeTrackerImei,
                setRealTimeEnabled,
                vigilanteEnabled,
                setVigilanteEnabled,
                latestLocation,
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