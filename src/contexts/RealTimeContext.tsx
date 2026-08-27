import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    checkRealtimeAvailability,
    fetchTrackerData,
} from '../services/TrackerApiService';

import type {
    TrackerLocation,
} from '../types/Tracker';

import {
    sendAlarmNotification,
    sendMovementNotification,
} from '../services/NotificationService';

interface RealTimeContextData {
    realTimeEnabled: boolean;
    activeTrackerId: string | null;
    activeTrackerName: string | null;
    latestLocation: TrackerLocation | null;
    isMoving: boolean;
    currentTripDistanceKm: number;
    routePoints: TrackerLocation[];

    realTimeError: string | null;

    setRealTimeEnabled: (
        enabled: boolean,
        trackerId?: string,
        trackerName?: string,
        imei?: string
    ) => void;

    startRealTime: (
        trackerId: string,
        trackerName: string,
        imei: string
    ) => Promise<boolean>;

    stopRealTime: () => void;

    updateLocation: (
        location: TrackerLocation
    ) => void;

    /**
     * ========================================================
     * MODO VIGILANTE
     * ========================================================
     *
     * Totalmente independente do Tempo Real: tem seu próprio
     * polling, seu próprio IMEI ativo e seu próprio estado de
     * erro. Pode rodar ligado ou desligado, com o Tempo Real
     * ligado ou desligado, sem nenhuma dependência entre eles.
     */
    vigilanteEnabled: boolean;
    activeVigilanteTrackerId: string | null;
    activeVigilanteTrackerName: string | null;
    vigilanteError: string | null;

    startVigilante: (
        trackerId: string,
        trackerName: string,
        imei: string
    ) => Promise<boolean>;

    stopVigilante: () => void;
}

const RealTimeContext =
    createContext<RealTimeContextData | undefined>(
        undefined
    );

const POLLING_INTERVAL = 5000;
const VIGILANTE_POLLING_INTERVAL = 5000;

const MOVEMENT_DISTANCE_METERS = 10;
const MOVEMENT_SPEED_KMH = 3;

function calculateDistanceKm(
    first: TrackerLocation,
    second: TrackerLocation
): number {
    const earthRadiusKm = 6371;

    const lat1 = (first.latitude * Math.PI) / 180;
    const lat2 = (second.latitude * Math.PI) / 180;

    const deltaLat =
        ((second.latitude - first.latitude) * Math.PI) / 180;

    const deltaLng =
        ((second.longitude - first.longitude) * Math.PI) / 180;

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
}

export function RealTimeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // ============================================================
    // TEMPO REAL
    // ============================================================

    const [realTimeEnabled, setRealTimeEnabledState] = useState(false);
    const [activeTrackerId, setActiveTrackerId] = useState<string | null>(null);
    const [activeTrackerName, setActiveTrackerName] = useState<string | null>(null);
    const [latestLocation, setLatestLocation] = useState<TrackerLocation | null>(null);
    const [isMoving, setIsMoving] = useState(false);
    const [currentTripDistanceKm, setCurrentTripDistanceKm] = useState(0);
    const [routePoints, setRoutePoints] = useState<TrackerLocation[]>([]);
    const [realTimeError, setRealTimeError] = useState<string | null>(null);

    const activeImeiRef = useRef<string | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const checkingRef = useRef(false);
    const previousLocationRef = useRef<TrackerLocation | null>(null);
    const movementStartRef = useRef<TrackerLocation | null>(null);
    const tripDistanceRef = useRef(0);

    const updateLocation = useCallback(
        (location: TrackerLocation) => {
            const previous = previousLocationRef.current;

            if (previous) {
                const distanceKm = calculateDistanceKm(previous, location);
                const distanceMeters = distanceKm * 1000;
                const speed = typeof location.speed === 'number' ? location.speed : 0;

                const moving =
                    distanceMeters >= MOVEMENT_DISTANCE_METERS ||
                    speed >= MOVEMENT_SPEED_KMH;

                if (moving) {
                    if (!movementStartRef.current) {
                        movementStartRef.current = previous;
                    }

                    tripDistanceRef.current += distanceKm;
                    setCurrentTripDistanceKm(tripDistanceRef.current);
                    setIsMoving(true);

                    setRoutePoints(previousPoints => {
                        const lastPoint = previousPoints[previousPoints.length - 1];

                        const duplicated =
                            lastPoint &&
                            lastPoint.latitude === location.latitude &&
                            lastPoint.longitude === location.longitude;

                        if (duplicated) {
                            return previousPoints;
                        }

                        return [...previousPoints, location];
                    });
                } else {
                    setIsMoving(false);
                }
            } else {
                setRoutePoints([location]);
            }

            previousLocationRef.current = location;
            setLatestLocation(location);
        },
        []
    );

    const clearPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const clearRoute = useCallback(() => {
        setRoutePoints([]);
        previousLocationRef.current = null;
        movementStartRef.current = null;
        tripDistanceRef.current = 0;
        setCurrentTripDistanceKm(0);
        setIsMoving(false);
    }, []);

    const pollLocation = useCallback(
        async () => {
            const imei = activeImeiRef.current;

            if (!imei || checkingRef.current) {
                return;
            }

            checkingRef.current = true;

            try {
                const availability = await checkRealtimeAvailability(imei);

                if (availability.status === 'no-connection') {
                    clearPolling();
                    setRealTimeEnabledState(false);
                    activeImeiRef.current = null;

                    setRealTimeError(
                        'A conexão com o servidor foi perdida. O Tempo Real foi desligado.'
                    );

                    return;
                }

                if (availability.status === 'no-location') {
                    return;
                }

                if (availability.status === 'available' && availability.location) {
                    updateLocation(availability.location);
                }
            } catch (error) {
                console.warn('Erro no polling do Tempo Real:', error);

                clearPolling();
                setRealTimeEnabledState(false);
                activeImeiRef.current = null;

                setRealTimeError(
                    'A conexão com o servidor foi perdida. O Tempo Real foi desligado.'
                );
            } finally {
                checkingRef.current = false;
            }
        },
        [clearPolling, updateLocation]
    );

    const setRealTimeEnabled = useCallback(
        (
            enabled: boolean,
            trackerId?: string,
            trackerName?: string,
            imei?: string
        ) => {
            if (!enabled) {
                clearPolling();
                activeImeiRef.current = null;
                setRealTimeEnabledState(false);
                return;
            }

            setRealTimeError(null);
            setRealTimeEnabledState(true);

            if (trackerId) setActiveTrackerId(trackerId);
            if (trackerName) setActiveTrackerName(trackerName);
            if (imei) activeImeiRef.current = imei;
        },
        [clearPolling]
    );

    const startRealTime = useCallback(
        async (
            trackerId: string,
            trackerName: string,
            imei: string
        ): Promise<boolean> => {
            clearPolling();
            setRealTimeError(null);
            setActiveTrackerId(trackerId);
            setActiveTrackerName(trackerName);
            activeImeiRef.current = imei;

            clearRoute();
            setLatestLocation(null);

            try {
                const availability = await checkRealtimeAvailability(imei);

                if (availability.status === 'no-connection') {
                    activeImeiRef.current = null;
                    setRealTimeEnabledState(false);

                    setRealTimeError(
                        'Não foi possível conectar ao servidor. O Tempo Real não foi iniciado.'
                    );

                    return false;
                }

                if (availability.status === 'no-location') {
                    setRealTimeEnabledState(true);

                    pollingRef.current = setInterval(() => {
                        void pollLocation();
                    }, POLLING_INTERVAL);

                    return true;
                }

                if (availability.status === 'available' && availability.location) {
                    updateLocation(availability.location);
                }

                setRealTimeEnabledState(true);

                pollingRef.current = setInterval(() => {
                    void pollLocation();
                }, POLLING_INTERVAL);

                return true;
            } catch (error) {
                console.warn('Erro ao iniciar Tempo Real:', error);

                activeImeiRef.current = null;
                setRealTimeEnabledState(false);

                setRealTimeError(
                    'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
                );

                return false;
            }
        },
        [clearPolling, clearRoute, pollLocation, updateLocation]
    );

    const stopRealTime = useCallback(() => {
        clearPolling();
        activeImeiRef.current = null;
        previousLocationRef.current = null;
        movementStartRef.current = null;

        setRealTimeEnabledState(false);
        setLatestLocation(null);
        setIsMoving(false);
        setCurrentTripDistanceKm(0);
        setActiveTrackerId(null);
        setActiveTrackerName(null);
        tripDistanceRef.current = 0;
        setRoutePoints([]);
        setRealTimeError(null);
    }, [clearPolling]);

    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, [clearPolling]);

    // ============================================================
    // MODO VIGILANTE
    // ============================================================
    //
    // Independente do Tempo Real: polling próprio, IMEI próprio.
    // A cada ciclo, busca /api/tracker/:imei (via fetchTrackerData,
    // que agora tem timeout embutido) e olha o campo `movement`
    // que o servidor já calcula:
    //   - movement.moving      -> dispara notificação de movimento
    //   - movement.alarmPending -> dispara notificação de alarme
    //
    // Só notifica na TRANSIÇÃO (false -> true), pra não spammar o
    // usuário a cada 5s enquanto o veículo continua em movimento.

    const [vigilanteEnabled, setVigilanteEnabledState] = useState(false);
    const [activeVigilanteTrackerId, setActiveVigilanteTrackerId] = useState<string | null>(null);
    const [activeVigilanteTrackerName, setActiveVigilanteTrackerName] = useState<string | null>(null);
    const [vigilanteError, setVigilanteError] = useState<string | null>(null);

    const vigilanteImeiRef = useRef<string | null>(null);
    const vigilanteTrackerNameRef = useRef<string>('O rastreador');
    const vigilantePollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const vigilanteCheckingRef = useRef(false);
    const vigilanteMovingRef = useRef(false);
    const vigilanteAlarmRef = useRef(false);

    const clearVigilantePolling = useCallback(() => {
        if (vigilantePollingRef.current) {
            clearInterval(vigilantePollingRef.current);
            vigilantePollingRef.current = null;
        }
    }, []);

    const pollVigilante = useCallback(async () => {
        const imei = vigilanteImeiRef.current;

        if (!imei || vigilanteCheckingRef.current) {
            return;
        }

        vigilanteCheckingRef.current = true;

        try {
            const tracker = await fetchTrackerData(imei);

            if (!tracker.online) {
                clearVigilantePolling();
                setVigilanteEnabledState(false);
                vigilanteImeiRef.current = null;

                setVigilanteError(
                    'O rastreador ficou offline. O Modo Vigilante foi desligado.'
                );

                return;
            }

            const movement = tracker.movement;

            if (movement) {
                if (movement.moving && !vigilanteMovingRef.current) {
                    void sendMovementNotification(
                        vigilanteTrackerNameRef.current
                    );
                }

                if (movement.alarmPending && !vigilanteAlarmRef.current) {
                    void sendAlarmNotification(
                        vigilanteTrackerNameRef.current,
                        'Possível alarme detectado no rastreador'
                    );
                }

                vigilanteMovingRef.current = movement.moving;
                vigilanteAlarmRef.current = movement.alarmPending;
            }
        } catch (error) {
            console.warn('Erro no polling do Modo Vigilante:', error);

            clearVigilantePolling();
            setVigilanteEnabledState(false);
            vigilanteImeiRef.current = null;

            setVigilanteError(
                'A conexão com o servidor foi perdida. O Modo Vigilante foi desligado.'
            );
        } finally {
            vigilanteCheckingRef.current = false;
        }
    }, [clearVigilantePolling]);

    const startVigilante = useCallback(
        async (
            trackerId: string,
            trackerName: string,
            imei: string
        ): Promise<boolean> => {
            clearVigilantePolling();
            setVigilanteError(null);

            // Garante que uma checagem antiga travada (de uma sessão
            // anterior que nunca resolveu) não bloqueie este novo início.
            vigilanteCheckingRef.current = false;

            setActiveVigilanteTrackerId(trackerId);
            setActiveVigilanteTrackerName(trackerName);
            vigilanteTrackerNameRef.current = trackerName;
            vigilanteImeiRef.current = imei;

            try {
                // Verifica conexão e pega o estado inicial, só pra usar
                // como referência (não notifica nada nesse primeiro passo,
                // senão notificaria toda vez que o Vigilante for ligado
                // com o veículo já em movimento).
                const tracker = await fetchTrackerData(imei);

                if (!tracker.online) {
                    vigilanteImeiRef.current = null;
                    setVigilanteEnabledState(false);

                    setVigilanteError(
                        'Não foi possível conectar ao rastreador. O Modo Vigilante não foi iniciado.'
                    );

                    return false;
                }

                vigilanteMovingRef.current = tracker.movement?.moving ?? false;
                vigilanteAlarmRef.current = tracker.movement?.alarmPending ?? false;

                setVigilanteEnabledState(true);

                vigilantePollingRef.current = setInterval(() => {
                    void pollVigilante();
                }, VIGILANTE_POLLING_INTERVAL);

                return true;
            } catch (error) {
                console.warn('Erro ao iniciar Modo Vigilante:', error);

                vigilanteImeiRef.current = null;
                setVigilanteEnabledState(false);

                setVigilanteError(
                    'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
                );

                return false;
            }
        },
        [clearVigilantePolling, pollVigilante]
    );

    const stopVigilante = useCallback(() => {
        clearVigilantePolling();

        vigilanteImeiRef.current = null;
        vigilanteMovingRef.current = false;
        vigilanteAlarmRef.current = false;

        // Zera a trava de "checagem em andamento". Sem isso, se o
        // usuário desligar o Vigilante enquanto uma requisição antiga
        // ainda está pendente (ou travada por falta de timeout em
        // versões antigas do apiFetch), o próximo startVigilante
        // poderia ficar bloqueado esperando essa requisição morta.
        vigilanteCheckingRef.current = false;

        setVigilanteEnabledState(false);
        setActiveVigilanteTrackerId(null);
        setActiveVigilanteTrackerName(null);
        setVigilanteError(null);
    }, [clearVigilantePolling]);

    useEffect(() => {
        return () => {
            clearVigilantePolling();
        };
    }, [clearVigilantePolling]);

    const value: RealTimeContextData = {
        realTimeEnabled,
        activeTrackerId,
        activeTrackerName,
        latestLocation,
        isMoving,
        currentTripDistanceKm,
        routePoints,
        realTimeError,
        setRealTimeEnabled,
        startRealTime,
        stopRealTime,
        updateLocation,

        vigilanteEnabled,
        activeVigilanteTrackerId,
        activeVigilanteTrackerName,
        vigilanteError,
        startVigilante,
        stopVigilante,
    };

    return (
        <RealTimeContext.Provider value={value}>
            {children}
        </RealTimeContext.Provider>
    );
}

export function useRealTime(): RealTimeContextData {
    const context = useContext(RealTimeContext);

    if (!context) {
        throw new Error(
            'useRealTime deve ser usado dentro de um RealTimeProvider.'
        );
    }

    return context;
}