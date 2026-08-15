// src/screens/History/index.tsx
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { getLocationHistory } from '../../services/storage/LastlocationStorage';
import type { Tracker, TrackerLocation } from '../../types/Tracker';
import { styles } from './styles';

const STORAGE_KEY = '@cavalleta:trackers';

export default function History({ navigation }: any) {
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
    const [history, setHistory] = useState<TrackerLocation[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadTrackers();
        }, [])
    );

    async function loadTrackers() {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const list: Tracker[] = stored ? JSON.parse(stored) : [];
            setTrackers(list);
        } catch (error) {
            console.warn('Erro ao carregar rastreadores', error);
        }
    }

    async function handleSelectTracker(tracker: Tracker) {
        setSelectedTracker(tracker);
        setDropdownOpen(false);
        setLoadingHistory(true);

        try {
            const result = await getLocationHistory(tracker.id);
            setHistory(result);
        } finally {
            setLoadingHistory(false);
        }
    }

    function handleSelectLocation(location: TrackerLocation) {
        if (!selectedTracker) return;

        // Manda pra tela de Mapa (aba irmã) já com a localização escolhida
        navigation.navigate('MapScreen', {
            trackerId: selectedTracker.id,
            historyLocation: location,
        });
    }

    function formatDate(value?: string) {
        if (!value) return 'Data não disponível';

        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        return date.toLocaleString('pt-BR');
    }

    return (
        <View style={styles.container}>


            {/* Dropdown de seleção de rastreador */}
            <View style={styles.dropdownContainer}>
                <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => setDropdownOpen(prev => !prev)}
                >
                    <Text style={styles.dropdownHeaderText} numberOfLines={1}>
                        {selectedTracker ? selectedTracker.name : 'Selecione um rastreador'}
                    </Text>
                    <Text style={styles.chevron}>{dropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {dropdownOpen && (
                    <View style={styles.dropdownList}>
                        <FlatList
                            data={trackers}
                            keyExtractor={item => item.id}
                            style={{ maxHeight: 220 }}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Nenhum rastreador cadastrado.</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => handleSelectTracker(item)}
                                >
                                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                                    <Text style={styles.dropdownItemSubtext}>{item.phone}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            {/* "Pasta" com as últimas localizações do rastreador selecionado */}
            {selectedTracker && (
                <View style={styles.folder}>
                    <View style={styles.folderHeader}>
                        <MaterialIcons name="folder-open" size={20} color="rgb(163, 204, 127)" />
                        <Text style={styles.folderHeaderText} numberOfLines={1}>
                            Últimas localizações — {selectedTracker.name}
                        </Text>
                    </View>

                    {loadingHistory ? (
                        <ActivityIndicator style={{ marginTop: 20 }} />
                    ) : history.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Nenhuma localização registrada ainda para este rastreador.
                        </Text>
                    ) : (
                        <FlatList
                            data={history}
                            keyExtractor={(_, index) => String(index)}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={styles.historyItem}
                                    onPress={() => handleSelectLocation(item)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name="place"
                                        size={20}
                                        color="#888"
                                        style={{ marginRight: 8 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.historyItemTitle}>
                                            {index === 0
                                                ? 'Localização mais recente'
                                                : `${index + 1}ª localização anterior`}
                                        </Text>
                                        <Text style={styles.historyItemCoords}>
                                            lat {item.latitude.toFixed(5)}, lon {item.longitude.toFixed(5)}
                                        </Text>
                                        <Text style={styles.historyItemDate}>
                                            {formatDate(item.lastUpdate)}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#ccc" />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}
        </View>
    );
}