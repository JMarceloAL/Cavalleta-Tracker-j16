// src/screens/Map/index.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, Text, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import TrackerMap from '../../components/TrackerMap';
import TrackerDropdown from '../../components/TrackerDropdown';
import MapControls from '../../components/MapControls';
import { useTrackerServiceProvider } from '../../contexts/TrackerServiceContext';
import { useRealTime } from '../../contexts/RealTimeContext';
import { useTheme } from '../../contexts/ThemeContext';
import { requestSmsPermissions } from '../../services/Smsgateway';
import {
    fetchTrackerLocationFromApi,
    checkRealtimeAvailability,
} from '../../services/TrackerApiService';
import {
    saveLastLocation,
    getLastLocation,
    saveStoppedLocation,
    getStoppedLocation,
} from '../../services/storage/LastlocationStorage';
import { distanceInMeters } from '../../utils/geo';
import { sendMovementNotification } from '../../services/NotificationService';
import type { Tracker, TrackerLocation } from '../../types/Tracker';

const STORAGE_KEY = '@cavalleta:trackers';

// Distância mínima (em metros) pra considerar que o rastreador saiu do
// lugar onde estava parado. Ajuste aqui se estiver disparando falsos
// positivos (imprecisão de GPS) ou demorando demais pra notificar.
const MOVEMENT_THRESHOLD_METERS = 30;

// Intervalo entre notificações repetidas enquanto o rastreador continuar
// em movimento (a primeira notificação sempre dispara na hora).
const NOTIFICATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export default function MapScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { getService } = useTrackerServiceProvider();
    const { setRealTimeEnabled: setGlobalRealTimeEnabled, vigilanteEnabled } = useRealTime();
    const { isDark, colors } = useTheme();

    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
    const [location, setLocation] = useState<TrackerLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [realTimeEnabled, setRealTimeEnabled] = useState(false);
    const [checkingRealTime, setCheckingRealTime] = useState(false);
    const [smsLoading, setSmsLoading] = useState(false);

    // Estado do Modo Vigilante: não precisa causar re-render, então fica em refs.
    const isMovingRef = useRef(false);
    const lastNotifiedAtRef = useRef<number | null>(null);

    const loadTrackers = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const list: Tracker[] = stored ? JSON.parse(stored) : [];
            setTrackers(list);

            const requestedId = route.params?.trackerId;
            if (requestedId) {
                const requested = list.find(t => t.id === requestedId);
                if (requested) {
                    setSelectedTracker(requested);
                    return;
                }
            }

            setSelectedTracker(prev => {
                const stillExists = prev && list.find(t => t.id === prev.id);
                return stillExists ? prev : list[0] ?? null;
            });
        } catch (error) {
            console.warn('Erro ao carregar rastreadores', error);
        } finally {
            setLoading(false);
        }
    }, [route.params?.trackerId]);

    useFocusEffect(
        useCallback(() => {
            loadTrackers();
        }, [loadTrackers])
    );

    // Carrega a última localização conhecida ao trocar de rastreador,
    // e reseta tanto o tempo real quanto o estado interno do Vigilante.
    useEffect(() => {
        setLocation(null);
        setRealTimeEnabled(false);
        setGlobalRealTimeEnabled(false);
        isMovingRef.current = false;
        lastNotifiedAtRef.current = null;

        if (selectedTracker) {
            getLastLocation(selectedTracker.id).then(last => {
                if (last) setLocation(last);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTracker]);

    // Vem da tela de Histórico: usuário tocou numa localização específica.
    useEffect(() => {
        if (route.params?.historyLocation) {
            setRealTimeEnabled(false);
            setGlobalRealTimeEnabled(false);
            setLocation(route.params.historyLocation as TrackerLocation);
            navigation.setParams({ historyLocation: undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.historyLocation]);

    // Comando manual de SMS (botão do balão) — dispara via navegação da tela SMS
    useEffect(() => {
        if (route.params?.autoRequestLocation && selectedTracker) {
            handleRequestSmsLocation();
            navigation.setParams({ autoRequestLocation: undefined, trackerId: undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTracker, route.params?.autoRequestLocation]);

    // Tempo real: SOMENTE via API. Também roda a lógica do Modo Vigilante,
    // já que é aqui que as novas posições chegam.
    useEffect(() => {
        if (!realTimeEnabled || !selectedTracker?.imei) return;

        const trackerId = selectedTracker.id;
        const trackerName = selectedTracker.name;
        const imei = selectedTracker.imei;

        async function checkVigilante(newLocation: TrackerLocation) {
            if (!vigilanteEnabled) return;

            const referenceLocation = await getStoppedLocation(trackerId);
            if (!referenceLocation) return; // ainda não há uma posição "parada" de referência

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

                // Notifica na hora ao detectar movimento pela primeira vez,
                // depois repete a cada 5 minutos enquanto continuar em movimento.
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
                setLocation(newLocation);
                await saveLastLocation(trackerId, newLocation);

                const isStopped = typeof newLocation.speed === 'number' ? newLocation.speed <= 2 : false;
                if (isStopped) {
                    await saveStoppedLocation(trackerId, newLocation);
                }

                await checkVigilante(newLocation);
            } catch (error: any) {
                console.log('⚠️ Erro no polling da API:', error.message);
                // silencioso — não interrompe o polling automático com Alert
            }
        }

        pollApi(); // já busca imediatamente ao ligar, sem esperar o primeiro intervalo

        // Consulta mais rápido que o próprio rastreador reporta (5s),
        // pra reduzir a latência entre "servidor recebeu" e "app exibiu"
        const interval = setInterval(pollApi, 2000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realTimeEnabled, selectedTracker, vigilanteEnabled]);

    function handleOpenExternalMap() {
        if (!location) {
            Alert.alert('Aviso', 'Nenhuma localização disponível ainda.');
            return;
        }

        const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

        Linking.openURL(url).catch((err) => {
            console.log('❌ Erro ao abrir Google Maps:', err);
            Alert.alert('Erro', 'Não foi possível abrir o mapa externo.');
        });
    }

    async function handleShowLastLocation() {
        if (!selectedTracker) {
            Alert.alert('Aviso', 'Selecione um rastreador primeiro.');
            return;
        }

        const last = await getLastLocation(selectedTracker.id);

        if (!last) {
            Alert.alert('Última localização', 'Nenhuma localização registrada ainda para este rastreador.');
            return;
        }

        setLocation(last);
    }

    // Botão de SMS — sempre manual, sob demanda, nunca em loop
    async function handleRequestSmsLocation() {
        if (!selectedTracker) {
            Alert.alert('Aviso', 'Selecione um rastreador primeiro.');
            return;
        }

        setSmsLoading(true);
        try {
            await requestSmsPermissions();
            const service = getService(selectedTracker.phone);
            const reply = await service.getLocation();

            const newLocation: TrackerLocation = {
                latitude: reply.latitude,
                longitude: reply.longitude,
                lastUpdate: reply.timestamp,
            };

            setLocation(newLocation);
            await saveLastLocation(selectedTracker.id, newLocation);

            if (!newLocation.speed || newLocation.speed <= 2) {
                await saveStoppedLocation(selectedTracker.id, newLocation);
            }
        } catch (error: any) {
            if (error.code === 'NO_SIGNAL') {
                Alert.alert(
                    '📡 Sem sinal de GPS',
                    'O rastreador não conseguiu obter sua localização. Verifique se o dispositivo está em local aberto e tente novamente em alguns instantes.'
                );
            } else {
                Alert.alert(
                    'Erro ao buscar localização',
                    error instanceof Error ? error.message : 'Erro desconhecido'
                );
            }
        } finally {
            setSmsLoading(false);
        }
    }

    // Ao ligar o switch, verifica os três cenários possíveis antes de
    // liberar o tempo real:
    //  - não conseguiu conectar ao servidor  -> alerta + switch continua off
    //  - conectou, mas não há localização    -> alerta + switch continua off
    //  - conectou e há localização válida    -> exibe na hora + liga o switch
    // Desligar é sempre imediato, sem checagem.
    async function handleToggleRealTime(value: boolean) {
        if (!value) {
            setRealTimeEnabled(false);
            setGlobalRealTimeEnabled(false);
            return;
        }

        if (!selectedTracker?.imei) {
            Alert.alert(
                'IMEI necessário',
                'O tempo real usa a API do servidor, que exige o IMEI do rastreador cadastrado. Edite o rastreador na tela Início e adicione o IMEI.'
            );
            return;
        }

        setCheckingRealTime(true);

        const result = await checkRealtimeAvailability(selectedTracker.imei);

        setCheckingRealTime(false);

        if (result.status === 'no-connection') {
            setRealTimeEnabled(false);
            setGlobalRealTimeEnabled(false);
            Alert.alert(
                '📡 Não foi possível conectar',
                'Não foi possível estabelecer conexão com o servidor. Verifique sua internet ou tente novamente em instantes.'
            );
            return;
        }

        if (result.status === 'no-location') {
            setRealTimeEnabled(false);
            setGlobalRealTimeEnabled(false);
            Alert.alert(
                '📍 Sem localização disponível',
                'O servidor está online, mas este rastreador ainda não enviou nenhuma localização.'
            );
            return;
        }

        // result.status === 'available'
        setLocation(result.location);
        await saveLastLocation(selectedTracker.id, result.location);
        setRealTimeEnabled(true);
        setGlobalRealTimeEnabled(true, selectedTracker.name);
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                    <ActivityIndicator color={isDark ? colors.text : undefined} />
                </View>
            ) : location ? (
                <TrackerMap location={location} />
            ) : (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 24,
                        backgroundColor: colors.background,
                    }}
                >
                    <Text style={{ textAlign: 'center', color: colors.text }}>
                        {selectedTracker
                            ? 'Nenhuma localização recebida ainda. Toque no ícone de SMS para solicitar.'
                            : 'Nenhum rastreador cadastrado.'}
                    </Text>
                </View>
            )}

            <TrackerDropdown
                trackers={trackers}
                selectedTracker={selectedTracker}
                onSelect={setSelectedTracker}
            />

            <MapControls
                onOpenExternalMap={handleOpenExternalMap}
                onShowLastLocation={handleShowLastLocation}
                onRequestSmsLocation={handleRequestSmsLocation}
                smsLoading={smsLoading}
                realTimeEnabled={realTimeEnabled}
                onToggleRealTime={handleToggleRealTime}
                checkingRealTime={checkingRealTime}
            />
        </View>
    );
}