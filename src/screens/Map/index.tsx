
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
    useRealTime,
} from '../../contexts/RealTimeContext';

import {
    useTrackerServiceProvider,
} from '../../contexts/TrackerServiceContext';

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
import { useTrackerSelection } from '../../contexts/TrackerSelectionContext';

import type {
    Tracker,
    TrackerLocation,
} from '../../types/Tracker';

import { styles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

const STORAGE_KEY =
    '@cavalleta:trackers';

function formatDistanceKm(value: number) {
    const safeValue = Number.isFinite(value)
        ? Math.max(0, value)
        : 0;

    if (safeValue >= 100) {
        return `${safeValue.toFixed(0)} km`;
    }

    if (safeValue >= 10) {
        return `${safeValue.toFixed(1).replace(/\.0$/, '')} km`;
    }

    if (safeValue >= 1) {
        return `${safeValue.toFixed(2).replace(/\.?0+$/, '')} km`;
    }

    return `${safeValue.toFixed(3).replace(/\.?0+$/, '')} km`;
}

export default function MapScreen() {
    const { colors, isDark } = useTheme();

    // ============================================================
    // CONTEXT
    // ============================================================

    const {
        selectedTrackerId,
        setSelectedTrackerId,
        resolveSelectedTracker,
    } = useTrackerSelection();

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

        // Vigilante
        vigilanteEnabled:
        globalVigilanteEnabled,

        activeVigilanteTrackerId,

        startVigilante,

        stopVigilante,

        vigilanteError,
    } = useRealTime();

    // ============================================================
    // NAVEGAÇÃO
    // ============================================================

    const route =
        useRoute<any>();

    const navigation =
        useNavigation<any>();

    // ============================================================
    // SERVIÇO SMS
    // ============================================================

    const {
        getService,
    } = useTrackerServiceProvider();

    // ============================================================
    // MAPA
    // ============================================================

    const mapRef =
        useRef<TrackerMapHandle>(
            null
        );

    // ============================================================
    // TRACKERS
    // ============================================================

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

    // ============================================================
    // LOCALIZAÇÃO
    // ============================================================

    const [
        location,
        setLocation,
    ] =
        useState<TrackerLocation | null>(
            null
        );

    // ============================================================
    // HISTÓRICO
    // ============================================================

    const [
        historyRoutePoints,
        setHistoryRoutePoints,
    ] =
        useState<TrackerLocation[]>(
            []
        );

    const [
        isHistoricalRoute,
        setIsHistoricalRoute,
    ] = useState(false);

    // ============================================================
    // LOADING
    // ============================================================

    const [
        loading,
        setLoading,
    ] = useState(true);

    // ============================================================
    // TEMPO REAL
    // ============================================================

    const [
        realTimeEnabled,
        setRealTimeEnabled,
    ] = useState(false);

    const [
        checkingRealTime,
        setCheckingRealTime,
    ] = useState(false);

    // ============================================================
    // SMS
    // ============================================================

    const [
        smsLoading,
        setSmsLoading,
    ] = useState(false);

    // ============================================================
    // VIGILANTE
    // ============================================================

    const [
        checkingVigilante,
        setCheckingVigilante,
    ] = useState(false);

    // ============================================================
    // MODO SEGUIR
    // ============================================================

    const [
        followEnabled,
        setFollowEnabled,
    ] = useState(true);

    // ============================================================
    // CARREGAR TRACKERS
    // ============================================================

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

                    const preferredTracker =
                        requestedId
                            ? list.find(tracker => tracker.id === requestedId)
                            : resolveSelectedTracker(list);

                    if (preferredTracker) {
                        setSelectedTrackerId(preferredTracker.id);
                        setSelectedTracker(preferredTracker);
                        return;
                    }

                    setSelectedTracker(
                        previous => {
                            if (!previous) {
                                return (
                                    list[0] ??
                                    null
                                );
                            }

                            const stillExists =
                                list.find(
                                    tracker =>
                                        tracker.id ===
                                        previous.id
                                );

                            return (
                                stillExists ??
                                list[0] ??
                                null
                            );
                        }
                    );
                } catch (error) {
                    console.warn(
                        'Erro ao carregar rastreadores:',
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

    // ============================================================
    // SINCRONIZA TEMPO REAL
    // ============================================================

    useEffect(() => {
        setRealTimeEnabled(
            globalRealTimeEnabled
        );
    }, [
        globalRealTimeEnabled,
    ]);

    // ============================================================
    // ERRO TEMPO REAL
    // ============================================================

    useEffect(() => {
        if (!realTimeError) {
            return;
        }

        Alert.alert(
            '📡 Conexão perdida',
            realTimeError
        );
    }, [
        realTimeError,
    ]);

    // ============================================================
    // ERRO VIGILANTE
    // ============================================================

    useEffect(() => {
        if (!vigilanteError) {
            return;
        }

        Alert.alert(
            '🛡️ Modo Vigilante',
            vigilanteError
        );
    }, [
        vigilanteError,
    ]);

    // ============================================================
    // TROCA DE TRACKER
    // ============================================================

    useEffect(() => {
        if (!selectedTracker) {
            return;
        }

        setSelectedTrackerId(selectedTracker.id);

        if (isHistoricalRoute) {
            return;
        }

        void getLastLocation(
            selectedTracker.id
        ).then(last => {
            if (last) {
                setLocation(last);
            }
        });

        // --------------------------------------------------------
        // TEMPO REAL
        // --------------------------------------------------------

        if (
            globalRealTimeEnabled &&
            selectedTracker.id !==
            activeTrackerId
        ) {
            stopRealTime();
        }

        // --------------------------------------------------------
        // VIGILANTE
        // --------------------------------------------------------

        if (
            globalVigilanteEnabled &&
            selectedTracker.id !==
            activeVigilanteTrackerId
        ) {
            stopVigilante();
        }

        setFollowEnabled(true);
    }, [
        selectedTracker,
        isHistoricalRoute,
        globalRealTimeEnabled,
        activeTrackerId,
        globalVigilanteEnabled,
        activeVigilanteTrackerId,
        stopRealTime,
        stopVigilante,
    ]);

    // ============================================================
    // LOCALIZAÇÃO DO TEMPO REAL
    // ============================================================

    useEffect(() => {
        if (isHistoricalRoute) {
            return;
        }

        if (
            globalRealTimeEnabled &&
            latestLocation &&
            selectedTracker?.id ===
            activeTrackerId
        ) {
            setLocation(
                latestLocation
            );
        }
    }, [
        latestLocation,
        globalRealTimeEnabled,
        activeTrackerId,
        selectedTracker,
        isHistoricalRoute,
    ]);

    // ============================================================
    // HISTORY -> LOCATION
    // ============================================================

    useEffect(() => {
        const historyLocation =
            route.params
                ?.historyLocation;

        if (!historyLocation) {
            return;
        }

        stopRealTime();

        setRealTimeEnabled(false);

        stopVigilante();

        setHistoryRoutePoints([]);

        setIsHistoricalRoute(false);

        setFollowEnabled(true);

        setLocation(
            historyLocation
        );

        navigation.setParams({
            historyLocation:
                undefined,
        });
    }, [
        route.params?.historyLocation,
        navigation,
        stopRealTime,
        stopVigilante,
    ]);

    // ============================================================
    // HISTORY -> ROUTE
    // ============================================================

    useFocusEffect(
        useCallback(() => {
            const incomingRoute =
                route.params?.routePoints;

            if (
                !Array.isArray(incomingRoute) ||
                incomingRoute.length < 2
            ) {
                return;
            }

            console.log(
                '[MapScreen] Nova rota histórica recebida:',
                incomingRoute.length,
                'pontos'
            );

            // ========================================================
            // DESLIGA MODOS QUE NÃO PODEM RODAR JUNTO COM HISTÓRICO
            // ========================================================

            stopRealTime();
            stopVigilante();

            setRealTimeEnabled(false);

            // ========================================================
            // DEFINE A ROTA HISTÓRICA
            // ========================================================

            setHistoryRoutePoints(
                [...incomingRoute]
            );

            setIsHistoricalRoute(true);

            // ========================================================
            // POSIÇÃO FINAL DA ROTA
            // ========================================================

            const lastPoint =
                incomingRoute[
                incomingRoute.length - 1
                ];

            if (lastPoint) {
                setLocation(lastPoint);
            }

            // ========================================================
            // MAPA LIVRE / SEGUIDOR
            // ========================================================

            setFollowEnabled(true);

            // ========================================================
            // CONSUME O PARAMETRO
            //
            // Isso é importante para não deixar a mesma rota
            // pendurada nos params da navegação.
            // ========================================================

            navigation.setParams({
                routePoints: undefined,
            });
        }, [
            route.params?.routePoints,
            navigation,
            stopRealTime,
            stopVigilante,
        ])
    );

    // ============================================================
    // MAPA EXTERNO
    // ============================================================

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
                console.warn(
                    'Erro ao abrir mapa externo:',
                    error
                );

                Alert.alert(
                    'Erro',
                    'Não foi possível abrir o mapa externo.'
                );
            }
        );
    }

    // ============================================================
    // ÚLTIMA LOCALIZAÇÃO
    // ============================================================

    async function handleShowLastLocation() {
        if (!selectedTracker) {
            Alert.alert(
                'Aviso',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        setHistoryRoutePoints([]);

        setIsHistoricalRoute(
            false
        );

        const last =
            await getLastLocation(
                selectedTracker.id
            );

        if (!last) {
            Alert.alert(
                'Última localização',
                'Nenhuma localização registrada para este rastreador.'
            );

            return;
        }

        setFollowEnabled(true);

        setLocation(last);
    }

    // ============================================================
    // SMS
    // ============================================================

    async function handleRequestSmsLocation() {
        if (!selectedTracker) {
            Alert.alert(
                'Aviso',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        if (!selectedTracker.phone) {
            Alert.alert(
                'Telefone necessário',
                'Este rastreador não possui um telefone cadastrado.'
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
                latitude: Number(reply.latitude),
                longitude: Number(reply.longitude),
                speed: Number(
                    'speed' in reply && reply.speed != null
                        ? reply.speed
                        : 0
                ),
                lastUpdate:
                    'timestamp' in reply
                        ? reply.timestamp
                        : new Date().toISOString(),
            };

            setHistoryRoutePoints([]);

            setIsHistoricalRoute(
                false
            );

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
                        : 'Não foi possível obter a localização.'
                );
            }
        } finally {
            setSmsLoading(false);
        }
    }

    // ============================================================
    // TEMPO REAL
    // ============================================================

    async function handleToggleRealTime(
        value: boolean
    ) {
        if (!value) {
            stopRealTime();

            setRealTimeEnabled(true);

            // Real Time inicia com o mapa livre.
            // O acompanhamento só começa quando o usuário
            // pressionar o botão de recentralizar.
            setFollowEnabled(false);

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
                'O Tempo Real precisa do IMEI do rastreador.'
            );

            return;
        }

        setHistoryRoutePoints([]);

        setIsHistoricalRoute(false);

        setCheckingRealTime(true);

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
                    '📡 Sem conexão',
                    'Não foi possível conectar ao servidor.'
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

                Alert.alert(
                    '📡 Erro',
                    'Não foi possível iniciar o Tempo Real.'
                );

                return;
            }

            setRealTimeEnabled(
                true
            );

            setFollowEnabled(
                true
            );

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
                'Erro no Tempo Real',
                error instanceof Error
                    ? error.message
                    : 'Não foi possível ativar o Tempo Real.'
            );
        } finally {
            setCheckingRealTime(
                false
            );
        }
    }

    // ============================================================
    // MODO VIGILANTE
    // ============================================================

    async function handleToggleVigilante(
        value: boolean
    ) {
        // --------------------------------------------------------
        // DESLIGAR
        // --------------------------------------------------------

        if (!value) {
            stopVigilante();

            return;
        }

        // --------------------------------------------------------
        // TRACKER
        // --------------------------------------------------------

        if (!selectedTracker) {
            Alert.alert(
                'Rastreador necessário',
                'Selecione um rastreador primeiro.'
            );

            return;
        }

        // --------------------------------------------------------
        // IMEI
        // --------------------------------------------------------

        if (!selectedTracker.imei) {
            Alert.alert(
                'IMEI necessário',
                'O Modo Vigilante precisa do IMEI do rastreador.'
            );

            return;
        }

        // --------------------------------------------------------
        // NOTIFICAÇÕES
        // --------------------------------------------------------

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

            if (!started) {
                Alert.alert(
                    '🛡️ Erro de conexão',
                    'Não foi possível ativar o Modo Vigilante.'
                );

                return;
            }

            /*
             * O estado verdadeiro vem do Context.
             *
             * Não usamos mais setVigilanteEnabled()
             * localmente.
             */
            setFollowEnabled(true);
        } catch (error) {
            console.warn(
                'Erro ao iniciar Modo Vigilante:',
                error
            );

            Alert.alert(
                '🛡️ Erro',
                'Não foi possível ativar o Modo Vigilante.'
            );
        } finally {
            setCheckingVigilante(
                false
            );
        }
    }

    // ============================================================
    // RECENTRALIZAR
    // ============================================================

    function handleRecenter() {
        setFollowEnabled(true);

        mapRef.current?.centerOnTracker();
    }

    // ============================================================
    // USUÁRIO ARRASTOU MAPA
    // ============================================================

    function handleUserPanned() {
        setFollowEnabled(false);
    }

    // ============================================================
    // ROTA EXIBIDA
    // ============================================================

    const displayedRoutePoints =
        isHistoricalRoute
            ? historyRoutePoints
            : [];

    // ============================================================
    // RENDER
    // ============================================================

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
                    location={location}
                    routePoints={
                        displayedRoutePoints
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
                        padding: 32,
                        backgroundColor: isDark
                            ? colors.background
                            : '#FFFFFF',
                    }}
                >
                    <View
                        style={{
                            width: 92,
                            height: 92,
                            borderRadius: 46,
                            backgroundColor: isDark
                                ? colors.surface
                                : '#F2F7EC',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 18,
                            borderWidth: 1,
                            borderColor: isDark ? colors.border : '#E7F0DF',
                        }}
                    >
                        <Text style={{ fontSize: 36, opacity: 0.9 }}>
                            {selectedTracker ? '📍' : '🛰️'}
                        </Text>
                    </View>

                    <Text
                        style={{
                            textAlign:
                                'center',
                            color: isDark
                                ? colors.text
                                : '#1F241C',
                            fontSize: 17,
                            fontWeight: '700',
                            marginBottom: 8,
                        }}
                    >
                        {selectedTracker
                            ? 'Nenhuma localização recebida ainda.'
                            : 'Nenhum rastreador cadastrado.'}
                    </Text>

                    <Text
                        style={{
                            textAlign:
                                'center',
                            color: isDark
                                ? colors.textMuted
                                : '#6C7D6A',
                            fontSize: 13,
                            lineHeight: 20,
                        }}
                    >
                        {selectedTracker
                            ? 'Aguarde a próxima atualização do rastreador para visualizar a rota e a posição no mapa.'
                            : 'Cadastre um rastreador para começar a acompanhar sua localização e histórico.'}
                    </Text>
                </View>
            )}

            {/* ==================================================
                DROPDOWN
            ================================================== */}

            <TrackerDropdown
                trackers={trackers}
                selectedTracker={
                    selectedTracker
                }
                onSelect={
                    setSelectedTracker
                }
            />

            {/* ==================================================
                DISTÂNCIA
            ================================================== */}

            {realTimeEnabled &&
                !isHistoricalRoute &&
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
                            {formatDistanceKm(
                                currentTripDistanceKm
                            )}
                        </Text>
                    </View>
                )}

            {/* ==================================================
                RECENTRALIZAR
            ================================================== */}

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

            {/* ==================================================
                CONTROLES
            ================================================== */}

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

                realTimeDisabled={
                    false
                }

                vigilanteEnabled={
                    globalVigilanteEnabled
                }

                onToggleVigilante={
                    handleToggleVigilante
                }

                checkingVigilante={
                    checkingVigilante
                }

                vigilanteDisabled={
                    false
                }
            />
        </View>
    );
}
