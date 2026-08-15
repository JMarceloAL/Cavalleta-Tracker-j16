// src/screens/Map/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Text, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import TrackerMap from '../../components/TrackerMap';
import TrackerDropdown from '../../components/TrackerDropdown';
import MapControls from '../../components/MapControls';
import { useTrackerServiceProvider } from '../../contexts/TrackerServiceContext';
import { requestSmsPermissions } from '../../services/Smsgateway';
import {
    fetchTrackerLocationFromApi,
    checkTrackerOnline,
} from '../../services/TrackerApiService';
import { saveLastLocation, getLastLocation } from '../../services/storage/LastlocationStorage';
import type { Tracker, TrackerLocation } from '../../types/Tracker';

const STORAGE_KEY = '@cavalleta:trackers';

export default function MapScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { getService } = useTrackerServiceProvider();

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
        setRealTimeEnabled(false); // desliga o tempo real ao trocar de rastreador

        if (selectedTracker) {
            getLastLocation(selectedTracker.id).then(last => {
                if (last) setLocation(last);
            });
        }
    }, [selectedTracker]);

    // Vem da tela de Histórico: usuário tocou numa localização específica.
    // Sobrescreve a última localização carregada acima e desliga o tempo
    // real, pra não ficar sobrescrevendo o ponto histórico escolhido.
    useEffect(() => {
        if (route.params?.historyLocation) {
            setRealTimeEnabled(false);
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

    // Tempo real: SOMENTE via API, nunca dispara SMS.
    // Se o rastreador não tiver IMEI cadastrado, o switch nem liga.
    useEffect(() => {
        if (!realTimeEnabled || !selectedTracker?.imei) return;

        const trackerId = selectedTracker.id;
        const imei = selectedTracker.imei;

        async function pollApi() {
            try {
                const newLocation = await fetchTrackerLocationFromApi(imei);
                setLocation(newLocation);
                await saveLastLocation(trackerId, newLocation);
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
    }, [realTimeEnabled, selectedTracker]);

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

    // Ao ligar o switch, verifica antes se o rastreador está de fato
    // conectado ao servidor e reportando dados (GET /api/tracker/:imei).
    // Só libera o tempo real (e o polling que o useEffect acima dispara)
    // se a verificação confirmar online: true. Desligar é sempre imediato.
    async function handleToggleRealTime(value: boolean) {
        if (!value) {
            setRealTimeEnabled(false);
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

        const isOnline = await checkTrackerOnline(selectedTracker.imei);

        setCheckingRealTime(false);

        if (!isOnline) {
            setRealTimeEnabled(false);
            Alert.alert(
                '📡 Serviço em tempo real offline',
                'O rastreador não está conectado ao servidor no momento. Tente novamente em instantes ou use a localização por SMS.'
            );
            return;
        }

        setRealTimeEnabled(true);
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