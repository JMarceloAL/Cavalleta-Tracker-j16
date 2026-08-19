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
import { useTheme } from '../../contexts/ThemeContext';
import { styles } from './styles';

const STORAGE_KEY = '@cavalleta:trackers';

export default function History({ navigation }: any) {
    const { isDark } = useTheme();
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

    const containerStyle = [styles.container, isDark && styles.darkContainer];
    const dropdownHeaderStyle = [styles.dropdownHeader, isDark && styles.darkDropdownHeader];
    const dropdownHeaderTextStyle = [styles.dropdownHeaderText, isDark && styles.darkDropdownHeaderText];
    const chevronStyle = [styles.chevron, isDark && styles.darkChevron];
    const dropdownListStyle = [styles.dropdownList, isDark && styles.darkDropdownList];
    const dropdownItemStyle = [styles.dropdownItem, isDark && styles.darkDropdownItem];
    const dropdownItemTextStyle = [styles.dropdownItemText, isDark && styles.darkDropdownItemText];
    const dropdownItemSubtextStyle = [styles.dropdownItemSubtext, isDark && styles.darkDropdownItemSubtext];
    const emptyTextStyle = [styles.emptyText, isDark && styles.darkEmptyText];
    const folderStyle = [styles.folder, isDark && styles.darkFolder];
    const folderHeaderStyle = [styles.folderHeader, isDark && styles.darkFolderHeader];
    const folderHeaderTextStyle = [styles.folderHeaderText, isDark && styles.darkFolderHeaderText];
    const historyItemStyle = [styles.historyItem, isDark && styles.darkHistoryItem];
    const historyItemTitleStyle = [styles.historyItemTitle, isDark && styles.darkHistoryItemTitle];
    const historyItemCoordsStyle = [styles.historyItemCoords, isDark && styles.darkHistoryItemCoords];
    const historyItemDateStyle = [styles.historyItemDate, isDark && styles.darkHistoryItemDate];

    return (
        <View style={containerStyle}>


            {/* Dropdown de seleção de rastreador */}
            <View style={styles.dropdownContainer}>
                <TouchableOpacity
                    style={dropdownHeaderStyle}
                    onPress={() => setDropdownOpen(prev => !prev)}
                >
                    <Text style={dropdownHeaderTextStyle} numberOfLines={1}>
                        {selectedTracker ? selectedTracker.name : 'Selecione um rastreador'}
                    </Text>
                    <Text style={chevronStyle}>{dropdownOpen ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {dropdownOpen && (
                    <View style={dropdownListStyle}>
                        <FlatList
                            data={trackers}
                            keyExtractor={item => item.id}
                            style={{ maxHeight: 220 }}
                            ListEmptyComponent={
                                <Text style={emptyTextStyle}>Nenhum rastreador cadastrado.</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={dropdownItemStyle}
                                    onPress={() => handleSelectTracker(item)}
                                >
                                    <Text style={dropdownItemTextStyle}>{item.name}</Text>
                                    <Text style={dropdownItemSubtextStyle}>{item.phone}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </View>

            {/* "Pasta" com as últimas localizações do rastreador selecionado */}
            {selectedTracker && (
                <View style={folderStyle}>
                    <View style={folderHeaderStyle}>
                        <MaterialIcons name="folder-open" size={20} color="rgb(163, 204, 127)" />
                        <Text style={folderHeaderTextStyle} numberOfLines={1}>
                            Últimas localizações — {selectedTracker.name}
                        </Text>
                    </View>

                    {loadingHistory ? (
                        <ActivityIndicator style={{ marginTop: 20 }} color={isDark ? '#F3F4F6' : '#111827'} />
                    ) : history.length === 0 ? (
                        <Text style={emptyTextStyle}>
                            Nenhuma localização registrada ainda para este rastreador.
                        </Text>
                    ) : (
                        <FlatList
                            data={history}
                            keyExtractor={(_, index) => String(index)}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={historyItemStyle}
                                    onPress={() => handleSelectLocation(item)}
                                    activeOpacity={0.7}
                                >
                                    <MaterialIcons
                                        name="place"
                                        size={20}
                                        color={isDark ? '#AFB9C7' : '#888'}
                                        style={{ marginRight: 8 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text style={historyItemTitleStyle}>
                                            {index === 0
                                                ? 'Localização mais recente'
                                                : `${index + 1}ª localização anterior`}
                                        </Text>
                                        <Text style={historyItemCoordsStyle}>
                                            lat {item.latitude.toFixed(5)}, lon {item.longitude.toFixed(5)}
                                        </Text>
                                        <Text style={historyItemDateStyle}>
                                            {formatDate(item.lastUpdate)}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color={isDark ? '#AFB9C7' : '#ccc'} />
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}
        </View>
    );
}