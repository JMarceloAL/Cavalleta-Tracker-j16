// src/screens/Map/index.tsx

import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';

import {
    View,
    ActivityIndicator,
    Text,
    Linking,
    Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    useFocusEffect,
    useRoute,
    useNavigation,
} from '@react-navigation/native';

import TrackerMap, {
    type TrackerMapHandle,
} from '../../components/TrackerMap';
import TrackerDropdown from '../../components/TrackerDropdown';
import MapControls from '../../components/MapControls';
import RecenterButton from '../../components/RecenterButton';

import {
    useTrackerServiceProvider,
} from '../../contexts/TrackerServiceContext';

import {
    useRealTime,
} from '../../contexts/RealTimeContext';

import {
    requestSmsPermissions,
} from '../../services/Smsgateway';

import {
    requestNotificationPermissions,
} from '../../services/NotificationService';

import {
    saveLastLocation,
    getLastLocation,
    saveStoppedLocation,
} from '../../services/storage/LastlocationStorage';

import {
    checkRealtimeAvailability,
} from '../../services/TrackerApiService';

import type {
    Tracker,
    TrackerLocation,
} from '../../types/Tracker';

import { styles } from './styles';

const STORAGE_KEY =
    '@cavalleta:trackers';

export default function MapScreen() {
    const {
        isMoving,
        currentTripDistanceKm,
        realTimeEnabled:
        globalRealTimeEnabled,
        activeTrackerId,
        latestLocation,
        routePoints,
        startRealTime,
        stopRealTime,
        realTimeError,

        vigilanteEnabled:
        globalVigilanteEnabled,
        startVigilante,
        stopVigilante,
        vigilanteError,
    } = useRealTime();

    const route =
        useRoute<any>();

    const navigation =
        useNavigation<any>();

    const {
        getService,
    } =
        useTrackerServiceProvider();

    const mapRef =
        useRef<TrackerMapHandle>(null);

    const [
        trackers,
        setTrackers,
    ] = useState<Tracker[]>([]);

    const [
        selectedTracker,
        setSelectedTracker,
    ] =
        useState<Tracker | null>(
            null
        );

    const [
        location,
        setLocation,
    ] =
        useState<TrackerLocation | null>(
            null
        );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        realTimeEnabled,
        setRealTimeEnabled,
    ] = useState(false);

    const [
        checkingRealTime,
        setCheckingRealTime,
    ] = useState(false);

    const [
        smsLoading,
        setSmsLoading,
    ] = useState(false);

    const [
        vigilanteEnabled,
        setVigilanteEnabled,
    ] = useState(false);

    const [
        checkingVigilante,
        setCheckingVigilante,
    ] = useState(false);

    /**
     * ============================================================
     * CENTRALIZAÇÃO / MODO SEGUIR
     * ============================================================
     *
     * true  -> câmera acompanha o rastreador automaticamente
     * false -> mapa livre (usuário arrastou), marcador se move
     *          sozinho sem mexer na câmera
     */
    const [
        followEnabled,
        setFollowEnabled,
    ] = useState(true);

    /**
     * ============================================================
     * CARREGAR RASTREADORES
     * ============================================================
     */
    const loadTrackers =
        useCallback(
            async () => {
                try {
                    const stored =
                        await AsyncStorage.getItem(
                            STORAGE_KEY
                        );

                    const list: Tracker[] =
                        stored
                            ? JSON.parse(
                                stored
                            )
                            : [];

                    setTrackers(list);

                    const requestedId =
                        route.params
                            ?.trackerId;

                    if (
                        requestedId
                    ) {
                        const requested =
                            list.find(
                                tracker =>
                                    tracker.id ===
                                    requestedId
                            );

                        if (
                            requested
                        ) {
                            setSelectedTracker(
                                requested
                            );

                            return;
                        }
                    }

                    setSelectedTracker(
                        prev => {
                            const stillExists =
                                prev &&
                                list.find(
                                    tracker =>
                                        tracker.id ===
                                        prev.id
                                );

                            return stillExists
                                ? prev
                                : list[0] ??
                                null;
                        }
                    );
                } catch (error) {
                    console.warn(
                        'Erro ao carregar rastreadores',
                        error
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                route.params?.trackerId,
            ]
        );

    useFocusEffect(
        useCallback(() => {
            void loadTrackers();
        }, [loadTrackers])
    );

    /**
     * ============================================================
     * SINCRONIZAR TEMPO REAL DO CONTEXTO
     * ============================================================
     */
    useEffect(() => {
        setRealTimeEnabled(
            globalRealTimeEnabled
        );
    }, [
        globalRealTimeEnabled,
    ]);

    /**
     * ============================================================
     * SINCRONIZAR MODO VIGILANTE DO CONTEXTO
     * ============================================================
     */
    useEffect(() => {
        setVigilanteEnabled(
            globalVigilanteEnabled
        );
    }, [
        globalVigilanteEnabled,
    ]);

    /**
     * ============================================================
     * AVISAR USUÁRIO QUANDO A API CAIR (TEMPO REAL)
     * ============================================================
     */
    useEffect(() => {
        if (!realTimeError) {
            return;
        }

        Alert.alert(
            '📡 Conexão perdida',
            realTimeError,
            [
                {
                    text: 'OK',
                },
            ]
        );
    }, [realTimeError]);

    /**
     * ============================================================
     * AVISAR USUÁRIO QUANDO O MODO VIGILANTE FALHAR
     * ============================================================
     */
    useEffect(() => {
        if (!vigilanteError) {
            return;
        }

        Alert.alert(
            '🛡️ Modo Vigilante',
            vigilanteError,
            [
                {
                    text: 'OK',
                },
            ]
        );
    }, [vigilanteError]);

    /**
     * ============================================================
     * TROCA DE RASTREADOR
     * ============================================================
     */
    useEffect(() => {
        setLocation(null);

        /**
         * Nova seleção -> volta a seguir automaticamente.
         */
        setFollowEnabled(true);

        if (
            selectedTracker?.id !==
            activeTrackerId &&
            globalRealTimeEnabled
        ) {
            stopRealTime();
        }

        if (
            selectedTracker
        ) {
            getLastLocation(
                selectedTracker.id
            ).then(last => {
                if (last) {
                    setLocation(last);
                }
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedTracker,
    ]);

    /**
     * ============================================================
     * LOCALIZAÇÃO DO TEMPO REAL
     * ============================================================
     */
    useEffect(() => {
        if (
            globalRealTimeEnabled &&
            latestLocation &&
            selectedTracker?.id ===
            activeTrackerId
        ) {
            setLocation(
                latestLocation
            );

            setRealTimeEnabled(
                true
            );
        }
    }, [
        latestLocation,
        globalRealTimeEnabled,
        activeTrackerId,
        selectedTracker,
    ]);

    /**
     * ============================================================
     * LOCALIZAÇÃO DO HISTÓRICO
     * ============================================================
     */
    useEffect(() => {
        const historyLocation =
            route.params
                ?.historyLocation;

        if (
            historyLocation
        ) {
            stopRealTime();

            setRealTimeEnabled(
                false
            );

            setFollowEnabled(true);

            setLocation(
                historyLocation as TrackerLocation
            );

            navigation.setParams({
                historyLocation:
                    undefined,
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        route.params
            ?.historyLocation,
    ]);

    /**
     * ============================================================
     * ROTA DO HISTÓRICO
     * ============================================================
     */
    useEffect(() => {
        const historyRoute =
            route.params
                ?.routePoints;

        if (
            historyRoute &&
            historyRoute.length > 0
        ) {
            stopRealTime();

            setRealTimeEnabled(
                false
            );

            setFollowEnabled(true);

            /**
             * Centraliza na última posição
             * da rota.
             */
            setLocation(
                historyRoute[
                historyRoute.length - 1
                ]
            );

            navigation.setParams({
                routePoints:
                    undefined,
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        route.params
            ?.routePoints,
    ]);

    /**
     * ============================================================
     * SOLICITAÇÃO AUTOMÁTICA VIA SMS
     * ============================================================
     */
    useEffect(() => {
        if (
            route.params
                ?.autoRequestLocation &&
            selectedTracker
        ) {
            void handleRequestSmsLocation();

            navigation.setParams({
                autoRequestLocation:
                    undefined,

                trackerId:
                    undefined,
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedTracker,
        route.params
            ?.autoRequestLocation,
    ]);

    /**
     * ============================================================
     * MAPA EXTERNO
     * ============================================================
     */
    function handleOpenExternalMap() {
        if (!location) {
            Alert.alert(
                'Aviso',
                'Nenhuma localização disponível ainda.'
            );

            return;
        }

        const url =
            `https://www.google.com/maps?q=` +
            `${location.latitude},${location.longitude}`;

        Linking.openURL(url).catch(
            error => {
                console.log(
                    'Erro ao abrir Google Maps:',
                    error
                );

                Alert.alert(
                    'Erro',
                    'Não foi possível abrir o mapa externo.'
                );
            }
        );
    }

    /**
     * ============================================================
     * ÚLTIMA LOCALIZAÇÃO
     * ============================================================
     */
    async function handleShowLastLocation() {
        if (
            !selectedTracker
        ) {
            Alert.alert(
                'Aviso',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        const last =
            await getLastLocation(
                selectedTracker.id
            );

        if (!last) {
            Alert.alert(
                'Última localização',
                'Nenhuma localização registrada ainda para este rastreador.'
            );

            return;
        }

        setFollowEnabled(true);
        setLocation(last);
    }

    /**
     * ============================================================
     * SMS
     * ============================================================
     */
    async function handleRequestSmsLocation() {
        if (
            !selectedTracker
        ) {
            Alert.alert(
                'Aviso',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        setSmsLoading(true);

        try {
            await requestSmsPermissions();

            const service =
                getService(
                    selectedTracker.phone
                );

            const reply =
                await service.getLocation();

            const newLocation:
                TrackerLocation = {
                latitude:
                    reply.latitude,

                longitude:
                    reply.longitude,

                lastUpdate:
                    reply.timestamp,

                speed:
                    reply.speed,
            };

            setFollowEnabled(true);
            setLocation(
                newLocation
            );

            await saveLastLocation(
                selectedTracker.id,
                newLocation
            );

            if (
                !newLocation.speed ||
                newLocation.speed <= 2
            ) {
                await saveStoppedLocation(
                    selectedTracker.id,
                    newLocation
                );
            }
        } catch (error: any) {
            if (
                error?.code ===
                'NO_SIGNAL'
            ) {
                Alert.alert(
                    '📡 Sem sinal de GPS',
                    'O rastreador não conseguiu obter sua localização. Verifique se o dispositivo está em local aberto e tente novamente em alguns instantes.'
                );
            } else {
                Alert.alert(
                    'Erro ao buscar localização',
                    error instanceof Error
                        ? error.message
                        : 'Erro desconhecido'
                );
            }
        } finally {
            setSmsLoading(false);
        }
    }

    /**
     * ============================================================
     * TEMPO REAL
     * ============================================================
     */
    async function handleToggleRealTime(
        value: boolean
    ) {
        if (!value) {
            stopRealTime();

            setRealTimeEnabled(
                false
            );

            return;
        }

        if (!selectedTracker) {
            Alert.alert(
                'Rastreador necessário',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        if (!selectedTracker.imei) {
            Alert.alert(
                'IMEI necessário',
                'O tempo real usa a API do servidor, que exige o IMEI do rastreador cadastrado. Edite o rastreador na tela Início e adicione o IMEI.'
            );

            return;
        }

        setCheckingRealTime(
            true
        );

        try {
            const result =
                await checkRealtimeAvailability(
                    selectedTracker.imei
                );

            if (
                result.status ===
                'no-connection'
            ) {
                stopRealTime();

                setRealTimeEnabled(
                    false
                );

                Alert.alert(
                    '📡 Sem conexão com o servidor',
                    'Não foi possível conectar à API do rastreador. Verifique a conexão do servidor e tente novamente.'
                );

                return;
            }

            const started =
                await startRealTime(
                    selectedTracker.id,
                    selectedTracker.name,
                    selectedTracker.imei
                );

            if (!started) {
                setRealTimeEnabled(
                    false
                );

                if (!realTimeError) {
                    Alert.alert(
                        '📡 Erro de conexão',
                        'Não foi possível iniciar o Tempo Real.'
                    );
                }

                return;
            }

            setRealTimeEnabled(
                true
            );

            setFollowEnabled(true);

            if (
                result.status ===
                'available' &&
                result.location
            ) {
                setLocation(
                    result.location
                );

                await saveLastLocation(
                    selectedTracker.id,
                    result.location
                );
            }

            if (
                result.status ===
                'no-location'
            ) {
                Alert.alert(
                    '📍 Aguardando localização',
                    'A API está conectada, mas o rastreador ainda não enviou uma localização válida. O Tempo Real continuará tentando automaticamente.'
                );
            }
        } catch (error: any) {
            stopRealTime();

            setRealTimeEnabled(
                false
            );

            const message =
                error?.message
                    ?.toLowerCase?.() ??
                '';

            if (
                message.includes(
                    'failed to fetch'
                ) ||
                message.includes(
                    'network'
                ) ||
                message.includes(
                    'offline'
                )
            ) {
                Alert.alert(
                    '📡 Sem conexão com o servidor',
                    'Não foi possível conectar à API do rastreador. Verifique a internet ou o servidor.'
                );

                return;
            }

            Alert.alert(
                'Erro no tempo real',
                error instanceof Error
                    ? error.message
                    : 'Não foi possível ativar o tempo real.'
            );
        } finally {
            setCheckingRealTime(
                false
            );
        }
    }

    /**
     * ============================================================
     * MODO VIGILANTE
     * ============================================================
     */
    async function handleToggleVigilante(
        value: boolean
    ) {
        if (!value) {
            stopVigilante();

            setVigilanteEnabled(
                false
            );

            return;
        }

        if (!selectedTracker) {
            Alert.alert(
                'Rastreador necessário',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        if (!selectedTracker.imei) {
            Alert.alert(
                'IMEI necessário',
                'O Modo Vigilante usa a API do servidor, que exige o IMEI do rastreador cadastrado. Edite o rastreador na tela Início e adicione o IMEI.'
            );

            return;
        }

        const granted =
            await requestNotificationPermissions();

        if (!granted) {
            Alert.alert(
                'Permissão necessária',
                'Ative as notificações para usar o Modo Vigilante.'
            );

            return;
        }

        setCheckingVigilante(
            true
        );

        try {
            const started =
                await startVigilante(
                    selectedTracker.id,
                    selectedTracker.name,
                    selectedTracker.imei
                );

            setVigilanteEnabled(
                started
            );

            if (!started && !vigilanteError) {
                Alert.alert(
                    '🛡️ Erro de conexão',
                    'Não foi possível ativar o Modo Vigilante.'
                );
            }
        } finally {
            setCheckingVigilante(
                false
            );
        }
    }

    /**
     * ============================================================
     * RECENTRALIZAR / MODO SEGUIR
     * ============================================================
     */
    function handleRecenter() {
        setFollowEnabled(true);
        mapRef.current?.centerOnTracker();
    }

    function handleUserPanned() {
        setFollowEnabled(false);
    }

    /**
     * ============================================================
     * RENDER
     * ============================================================
     */
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            {loading ? (
                <View
                    style={{
                        flex: 1,
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                    }}
                >
                    <ActivityIndicator />
                </View>
            ) : location ? (
                <TrackerMap
                    ref={mapRef}
                    location={
                        location
                    }
                    routePoints={
                        routePoints
                    }
                    followEnabled={
                        followEnabled
                    }
                    onUserPanned={
                        handleUserPanned
                    }
                />
            ) : (
                <View
                    style={{
                        flex: 1,
                        justifyContent:
                            'center',
                        alignItems:
                            'center',
                        padding: 24,
                    }}
                >
                    <Text
                        style={{
                            textAlign:
                                'center',
                        }}
                    >
                        {selectedTracker
                            ? 'Nenhuma localização recebida ainda. O tempo real continuará tentando obter a localização.'
                            : 'Nenhum rastreador cadastrado.'}
                    </Text>
                </View>
            )}

            <TrackerDropdown
                trackers={
                    trackers
                }
                selectedTracker={
                    selectedTracker
                }
                onSelect={
                    setSelectedTracker
                }
            />

            {realTimeEnabled &&
                isMoving && (
                    <View
                        style={
                            styles.kmOverlay
                        }
                    >
                        <Text
                            style={
                                styles.kmText
                            }
                        >
                            {currentTripDistanceKm.toFixed(
                                2
                            )}{' '}
                            km
                        </Text>
                    </View>
                )}

            {location && (
                <RecenterButton
                    followEnabled={
                        followEnabled
                    }
                    onPress={
                        handleRecenter
                    }
                />
            )}

            <MapControls
                onOpenExternalMap={
                    handleOpenExternalMap
                }
                onShowLastLocation={
                    handleShowLastLocation
                }
                onRequestSmsLocation={
                    handleRequestSmsLocation
                }
                smsLoading={
                    smsLoading
                }
                realTimeEnabled={
                    realTimeEnabled
                }
                onToggleRealTime={
                    handleToggleRealTime
                }
                checkingRealTime={
                    checkingRealTime
                }
                vigilanteEnabled={
                    vigilanteEnabled
                }
                onToggleVigilante={
                    handleToggleVigilante
                }
                checkingVigilante={
                    checkingVigilante
                }
            />
        </View>
    );
}