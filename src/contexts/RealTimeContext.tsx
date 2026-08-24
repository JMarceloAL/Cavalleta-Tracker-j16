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
} from '../services/TrackerApiService';

import type {
    TrackerLocation,
} from '../types/Tracker';

interface RealTimeContextData {
    realTimeEnabled: boolean;
    activeTrackerId: string | null;
    activeTrackerName: string | null;
    latestLocation: TrackerLocation | null;
    isMoving: boolean;
    currentTripDistanceKm: number;
    routePoints: TrackerLocation[];
    vigilanteEnabled: boolean;

    /**
     * Erro ocorrido durante o Tempo Real.
     *
     * Quando a API/servidor cair enquanto o Tempo Real
     * estiver funcionando, esta mensagem será preenchida
     * para que o MapScreen possa avisar o usuário.
     */
    realTimeError: string | null;

    setVigilanteEnabled: (
        enabled: boolean
    ) => void;

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
}

const RealTimeContext =
    createContext<RealTimeContextData | undefined>(
        undefined
    );

const POLLING_INTERVAL = 5000;

/**
 * Distância mínima para considerar
 * que houve deslocamento.
 */
const MOVEMENT_DISTANCE_METERS = 10;

/**
 * Velocidade mínima considerada movimento.
 */
const MOVEMENT_SPEED_KMH = 3;

function calculateDistanceKm(
    first: TrackerLocation,
    second: TrackerLocation
): number {
    const earthRadiusKm = 6371;

    const lat1 =
        (first.latitude * Math.PI) / 180;

    const lat2 =
        (second.latitude * Math.PI) / 180;

    const deltaLat =
        ((second.latitude -
            first.latitude) *
            Math.PI) /
        180;

    const deltaLng =
        ((second.longitude -
            first.longitude) *
            Math.PI) /
        180;

    const a =
        Math.sin(deltaLat / 2) *
        Math.sin(deltaLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadiusKm * c;
}

export function RealTimeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [
        realTimeEnabled,
        setRealTimeEnabledState,
    ] = useState(false);

    const [
        activeTrackerId,
        setActiveTrackerId,
    ] = useState<string | null>(null);

    const [
        activeTrackerName,
        setActiveTrackerName,
    ] = useState<string | null>(null);

    const [
        latestLocation,
        setLatestLocation,
    ] = useState<TrackerLocation | null>(null);

    const [
        isMoving,
        setIsMoving,
    ] = useState(false);

    const [
        currentTripDistanceKm,
        setCurrentTripDistanceKm,
    ] = useState(0);

    /**
     * Pontos da rota atual.
     */
    const [
        routePoints,
        setRoutePoints,
    ] = useState<TrackerLocation[]>([]);

    const [
        vigilanteEnabled,
        setVigilanteEnabledState,
    ] = useState(false);

    /**
     * Guarda o erro de conexão para o MapScreen
     * poder apresentar um Alert ao usuário.
     */
    const [
        realTimeError,
        setRealTimeError,
    ] = useState<string | null>(null);

    const activeImeiRef =
        useRef<string | null>(null);

    const pollingRef =
        useRef<
            ReturnType<typeof setInterval> | null
        >(null);

    const checkingRef =
        useRef(false);

    /**
     * Última localização recebida.
     */
    const previousLocationRef =
        useRef<TrackerLocation | null>(null);

    /**
     * Localização do início do movimento.
     */
    const movementStartRef =
        useRef<TrackerLocation | null>(null);

    /**
     * Distância acumulada durante a viagem.
     */
    const tripDistanceRef =
        useRef(0);

    /**
     * Atualiza uma localização recebida.
     */
    const updateLocation = useCallback(
        (location: TrackerLocation) => {
            const previous =
                previousLocationRef.current;

            if (previous) {
                const distanceKm =
                    calculateDistanceKm(
                        previous,
                        location
                    );

                const distanceMeters =
                    distanceKm * 1000;

                const speed =
                    typeof location.speed ===
                        'number'
                        ? location.speed
                        : 0;

                const moving =
                    distanceMeters >=
                    MOVEMENT_DISTANCE_METERS ||
                    speed >=
                    MOVEMENT_SPEED_KMH;

                if (moving) {
                    if (
                        !movementStartRef.current
                    ) {
                        movementStartRef.current =
                            previous;
                    }

                    tripDistanceRef.current +=
                        distanceKm;

                    setCurrentTripDistanceKm(
                        tripDistanceRef.current
                    );

                    setIsMoving(true);

                    /**
                     * Adiciona o ponto à rota.
                     *
                     * Evita adicionar duas vezes
                     * exatamente a mesma coordenada.
                     */
                    setRoutePoints(
                        previousPoints => {
                            const lastPoint =
                                previousPoints[
                                previousPoints.length - 1
                                ];

                            const duplicated =
                                lastPoint &&
                                lastPoint.latitude ===
                                location.latitude &&
                                lastPoint.longitude ===
                                location.longitude;

                            if (duplicated) {
                                return previousPoints;
                            }

                            return [
                                ...previousPoints,
                                location,
                            ];
                        }
                    );
                } else {
                    setIsMoving(false);
                }
            } else {
                /**
                 * Primeira localização.
                 *
                 * Também colocamos na rota para
                 * que a linha possa começar dali.
                 */
                setRoutePoints([location]);
            }

            previousLocationRef.current =
                location;

            setLatestLocation(location);
        },
        []
    );

    /**
     * Limpa o polling.
     */
    const clearPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(
                pollingRef.current
            );

            pollingRef.current = null;
        }
    }, []);

    /**
     * Limpa a rota atual.
     */
    const clearRoute = useCallback(() => {
        setRoutePoints([]);

        previousLocationRef.current =
            null;

        movementStartRef.current =
            null;

        tripDistanceRef.current =
            0;

        setCurrentTripDistanceKm(0);

        setIsMoving(false);
    }, []);

    /**
     * Consulta uma nova localização.
     */
    const pollLocation = useCallback(
        async () => {
            const imei =
                activeImeiRef.current;

            if (
                !imei ||
                checkingRef.current
            ) {
                return;
            }

            checkingRef.current = true;

            try {
                const availability =
                    await checkRealtimeAvailability(
                        imei
                    );

                /**
                 * Servidor indisponível.
                 *
                 * Aqui está a principal correção:
                 * além de desligar o Tempo Real,
                 * registramos o erro para que o
                 * MapScreen mostre um Alert.
                 */
                if (
                    availability.status ===
                    'no-connection'
                ) {
                    clearPolling();

                    setRealTimeEnabledState(
                        false
                    );

                    setVigilanteEnabledState(
                        false
                    );

                    activeImeiRef.current =
                        null;

                    setRealTimeError(
                        'A conexão com o servidor foi perdida. O Tempo Real foi desligado.'
                    );

                    return;
                }

                /**
                 * API conectada, mas GPS
                 * ainda não disponível.
                 */
                if (
                    availability.status ===
                    'no-location'
                ) {
                    return;
                }

                /**
                 * Localização válida.
                 */
                if (
                    availability.status ===
                    'available' &&
                    availability.location
                ) {
                    updateLocation(
                        availability.location
                    );
                }
            } catch (error) {
                console.warn(
                    'Erro no polling do Tempo Real:',
                    error
                );

                /**
                 * Se houver uma exceção de rede,
                 * também consideramos a conexão
                 * perdida.
                 */
                clearPolling();

                setRealTimeEnabledState(
                    false
                );

                setVigilanteEnabledState(
                    false
                );

                activeImeiRef.current =
                    null;

                setRealTimeError(
                    'A conexão com o servidor foi perdida. O Tempo Real foi desligado.'
                );
            } finally {
                checkingRef.current =
                    false;
            }
        },
        [
            clearPolling,
            updateLocation,
        ]
    );

    /**
     * Permite ao Map alterar o estado
     * global do Tempo Real.
     */
    const setRealTimeEnabled =
        useCallback(
            (
                enabled: boolean,
                trackerId?: string,
                trackerName?: string,
                imei?: string
            ) => {
                if (!enabled) {
                    clearPolling();

                    activeImeiRef.current =
                        null;

                    setRealTimeEnabledState(
                        false
                    );

                    setVigilanteEnabledState(
                        false
                    );

                    return;
                }

                /**
                 * Novo acionamento manual:
                 * limpa eventual erro anterior.
                 */
                setRealTimeError(null);

                setRealTimeEnabledState(
                    true
                );

                if (trackerId) {
                    setActiveTrackerId(
                        trackerId
                    );
                }

                if (trackerName) {
                    setActiveTrackerName(
                        trackerName
                    );
                }

                if (imei) {
                    activeImeiRef.current =
                        imei;
                }
            },
            [clearPolling]
        );

    /**
     * Inicia o Tempo Real.
     */
    const startRealTime =
        useCallback(
            async (
                trackerId: string,
                trackerName: string,
                imei: string
            ): Promise<boolean> => {
                clearPolling();

                /**
                 * Limpa erro anterior.
                 */
                setRealTimeError(null);

                setActiveTrackerId(
                    trackerId
                );

                setActiveTrackerName(
                    trackerName
                );

                activeImeiRef.current =
                    imei;

                /**
                 * Reseta a viagem.
                 */
                clearRoute();

                setLatestLocation(null);

                try {
                    /**
                     * Consulta inicial.
                     */
                    const availability =
                        await checkRealtimeAvailability(
                            imei
                        );

                    /**
                     * Servidor indisponível.
                     */
                    if (
                        availability.status ===
                        'no-connection'
                    ) {
                        activeImeiRef.current =
                            null;

                        setRealTimeEnabledState(
                            false
                        );

                        setVigilanteEnabledState(
                            false
                        );

                        setRealTimeError(
                            'Não foi possível conectar ao servidor. O Tempo Real não foi iniciado.'
                        );

                        return false;
                    }

                    /**
                     * Sem localização ainda.
                     *
                     * Mantemos o Tempo Real funcionando
                     * para continuar tentando.
                     */
                    if (
                        availability.status ===
                        'no-location'
                    ) {
                        setRealTimeEnabledState(
                            true
                        );

                        pollingRef.current =
                            setInterval(
                                () => {
                                    void pollLocation();
                                },
                                POLLING_INTERVAL
                            );

                        return true;
                    }

                    /**
                     * Localização válida.
                     */
                    if (
                        availability.status ===
                        'available' &&
                        availability.location
                    ) {
                        updateLocation(
                            availability.location
                        );
                    }

                    setRealTimeEnabledState(
                        true
                    );

                    /**
                     * Inicia polling.
                     */
                    pollingRef.current =
                        setInterval(
                            () => {
                                void pollLocation();
                            },
                            POLLING_INTERVAL
                        );

                    return true;
                } catch (error) {
                    console.warn(
                        'Erro ao iniciar Tempo Real:',
                        error
                    );

                    activeImeiRef.current =
                        null;

                    setRealTimeEnabledState(
                        false
                    );

                    setVigilanteEnabledState(
                        false
                    );

                    setRealTimeError(
                        'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
                    );

                    return false;
                }
            },
            [
                clearPolling,
                clearRoute,
                pollLocation,
                updateLocation,
            ]
        );

    /**
     * Para o Tempo Real manualmente.
     *
     * Não gera erro para o usuário,
     * pois neste caso foi o próprio usuário
     * quem desligou.
     */
    const stopRealTime =
        useCallback(() => {
            clearPolling();

            activeImeiRef.current =
                null;

            previousLocationRef.current =
                null;

            movementStartRef.current =
                null;

            setRealTimeEnabledState(
                false
            );

            setVigilanteEnabledState(
                false
            );

            setLatestLocation(null);

            setIsMoving(false);

            setCurrentTripDistanceKm(
                0
            );

            setActiveTrackerId(
                null
            );

            setActiveTrackerName(
                null
            );

            tripDistanceRef.current =
                0;

            setRoutePoints([]);

            /**
             * Limpa eventual erro.
             *
             * O Alert já terá sido disparado
             * pelo MapScreen quando necessário.
             */
            setRealTimeError(null);
        }, [clearPolling]);

    /**
     * Modo Vigilante.
     */
    const setVigilanteEnabled =
        useCallback(
            (enabled: boolean) => {
                if (
                    enabled &&
                    !realTimeEnabled
                ) {
                    setVigilanteEnabledState(
                        false
                    );

                    return;
                }

                setVigilanteEnabledState(
                    enabled
                );
            },
            [realTimeEnabled]
        );

    /**
     * Se o Tempo Real desligar,
     * Vigilante também desliga.
     */
    useEffect(() => {
        if (!realTimeEnabled) {
            setVigilanteEnabledState(
                false
            );
        }
    }, [realTimeEnabled]);

    /**
     * Limpeza do Provider.
     */
    useEffect(() => {
        return () => {
            clearPolling();
        };
    }, [clearPolling]);

    const value: RealTimeContextData = {
        realTimeEnabled,
        activeTrackerId,
        activeTrackerName,
        latestLocation,
        isMoving,
        currentTripDistanceKm,
        routePoints,
        vigilanteEnabled,
        realTimeError,
        setVigilanteEnabled,
        setRealTimeEnabled,
        startRealTime,
        stopRealTime,
        updateLocation,
    };

    return (
        <RealTimeContext.Provider
            value={value}
        >
            {children}
        </RealTimeContext.Provider>
    );
}

export function useRealTime(): RealTimeContextData {
    const context =
        useContext(
            RealTimeContext
        );

    if (!context) {
        throw new Error(
            'useRealTime deve ser usado dentro de um RealTimeProvider.'
        );
    }

    return context;
}