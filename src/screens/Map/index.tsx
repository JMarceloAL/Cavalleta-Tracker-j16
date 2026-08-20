// src/screens/Map/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import TrackerMap from '../../components/TrackerMap';
import TrackerDropdown from '../../components/TrackerDropdown';
import MapControls from '../../components/MapControls';
import { useTrackerServiceProvider } from '../../contexts/TrackerServiceContext';
import { useRealTime } from '../../contexts/RealTimeContext';
import { requestSmsPermissions } from '../../services/Smsgateway';
import {
    fetchTrackerLocationFromApi,
    checkTrackerOnline,
} from '../../services/TrackerApiService';
import {
    saveLastLocation,
    getLastLocation,
    saveStoppedLocation,
} from '../../services/storage/LastlocationStorage';
import type { Tracker, TrackerLocation } from '../../types/Tracker';

const STORAGE_KEY = '@cavalleta:trackers';

export default function MapScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { getService } = useTrackerServiceProvider();
    const {
        setRealTimeEnabled: setGlobalRealTimeEnabled,
        realTimeEnabled: globalRealTimeEnabled,
        latestLocation,
        activeTrackerId,
    } = useRealTime();

    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
    const [location, setLocation] = useState<TrackerLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [realTimeEnabled, setRealTimeEnabled] = useState(false);
    const [checkingRealTime, setCheckingRealTime] = useState(false);
    const [smsLoading, setSmsLoading] = useState(false);

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

    // Carrega a última localização conhecida ao trocar de rastreador
    useEffect(() => {
        setLocation(null);
        setRealTimeEnabled(false);

        // Só desliga o tempo real global se o rastreador selecionado for
        // diferente do que está ativo no Context (evita desligar sem querer
        // ao só re-selecionar o mesmo rastreador que já está monitorando).
        if (selectedTracker?.id !== activeTrackerId) {
            setGlobalRealTimeEnabled(false);
        }

        if (selectedTracker) {
            getLastLocation(selectedTracker.id).then(last => {
                if (last) setLocation(last);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTracker]);

    // Sincroniza a location exibida com o que o Context está recebendo em background,
    // só quando o rastreador selecionado na tela é o mesmo que está sendo monitorado.
    useEffect(() => {
        if (globalRealTimeEnabled && latestLocation && selectedTracker?.id === activeTrackerId) {
            setLocation(latestLocation);
            setRealTimeEnabled(true);
        }
    }, [latestLocation, globalRealTimeEnabled, activeTrackerId, selectedTracker]);

    // Vem da tela de Histórico
    useEffect(() => {
        if (route.params?.historyLocation) {
            setRealTimeEnabled(false);
            setGlobalRealTimeEnabled(false);
            setLocation(route.params.historyLocation as TrackerLocation);
            navigation.setParams({ historyLocation: undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.historyLocation]);

    // Comando manual de SMS (botão do balão)
    useEffect(() => {
        if (route.params?.autoRequestLocation && selectedTracker) {
            handleRequestSmsLocation();
            navigation.setParams({ autoRequestLocation: undefined, trackerId: undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTracker, route.params?.autoRequestLocation]);

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

        try {
            const isApiReachable = await checkTrackerOnline(selectedTracker.imei);

            if (!isApiReachable) {
                setRealTimeEnabled(false);
                Alert.alert(
                    '📡 Sem conexão com o servidor',
                    'Não foi possível acessar a API do rastreador. Verifique a conexão do servidor e tente novamente.'
                );
                return;
            }

            const currentLocation = await fetchTrackerLocationFromApi(selectedTracker.imei);

            if (!currentLocation || !Number.isFinite(currentLocation.latitude) || !Number.isFinite(currentLocation.longitude)) {
                setRealTimeEnabled(false);
                Alert.alert(
                    '📍 Ainda não há rastreio',
                    'A API está respondendo, mas o rastreador ainda não enviou uma localização válida.'
                );
                return;
            }

            setLocation(currentLocation);
            await saveLastLocation(selectedTracker.id, currentLocation);
            setRealTimeEnabled(true);
            setGlobalRealTimeEnabled(true, selectedTracker.id, selectedTracker.name, selectedTracker.imei);
        } catch (error: any) {
            setRealTimeEnabled(false);

            const message = error?.message?.toLowerCase?.() ?? '';
            if (message.includes('failed to fetch') || message.includes('network') || message.includes('offline')) {
                Alert.alert(
                    '📡 Sem conexão com o servidor',
                    'Não foi possível conectar à API do rastreador. Verifique a internet ou o servidor.'
                );
                return;
            }

            Alert.alert(
                '📍 Ainda não há rastreio',
                'A API está respondendo, mas o rastreador ainda não enviou uma localização válida.'
            );
        } finally {
            setCheckingRealTime(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator />
                </View>
            ) : location ? (
                <TrackerMap location={location} />
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <Text style={{ textAlign: 'center' }}>
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