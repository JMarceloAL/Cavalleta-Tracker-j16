// src/screens/SMS/index.tsx
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import TrackerDropdown from '../../components/TrackerDropdown';
import ParamCommandModal from '../../components/ParamCommandModal';
import CollapsibleSection from '../../components/CollapsibleSection';
import { useTrackerServiceProvider } from '../../contexts/TrackerServiceContext';
import { requestSmsPermissions } from '../../services/Smsgateway';
import { STATUS_COMMANDS, PARAM_COMMANDS } from '../../services/CommandCatalog';
import type { StatusCommand, ParamCommand } from '../../services/CommandCatalog';
import type { Tracker } from '../../types/Tracker';
import { styles } from './styles';

const STORAGE_KEY = '@cavalleta:trackers';

export default function SmsScreen() {
    const navigation = useNavigation<any>();
    const { getService } = useTrackerServiceProvider();

    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
    const [loadingCommandId, setLoadingCommandId] = useState<string | null>(null);
    const [response, setResponse] = useState<{ command: string; text: string } | null>(null);
    const [activeParamCommand, setActiveParamCommand] = useState<ParamCommand | null>(null);

    const loadTrackers = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const list: Tracker[] = stored ? JSON.parse(stored) : [];
            setTrackers(list);

            setSelectedTracker(prev => {
                const stillExists = prev && list.find(t => t.id === prev.id);
                return stillExists ? prev : list[0] ?? null;
            });
        } catch (error) {
            console.warn('Erro ao carregar rastreadores', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTrackers();
        }, [loadTrackers])
    );

    function formatResponse(parsed: any): string {
        if (parsed.type === 'status') {
            return Object.entries(parsed)
                .filter(([key]) => key !== 'type' && key !== 'raw')
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
        }

        if (parsed.type === 'location') {
            return `Lat: ${parsed.latitude}\nLng: ${parsed.longitude}\nURL: ${parsed.url}`;
        }

        return parsed.raw ?? JSON.stringify(parsed);
    }

    async function executeCommand(commandString: string, commandId: string) {
        if (!selectedTracker) {
            Alert.alert('Aviso', 'Selecione um rastreador primeiro.');
            return;
        }

        setLoadingCommandId(commandId);
        setResponse(null);

        try {
            await requestSmsPermissions();
            const service = getService(selectedTracker.phone);
            const parsed = await service.sendCommand(commandString);

            setResponse({
                command: commandString,
                text: formatResponse(parsed),
            });
        } catch (error: any) {
            Alert.alert(
                'Erro ao executar comando',
                error instanceof Error ? error.message : 'Erro desconhecido'
            );
        } finally {
            setLoadingCommandId(null);
        }
    }

    function handleStatusCommandPress(cmd: StatusCommand) {
        if (cmd.id === 'location') {
            if (!selectedTracker) {
                Alert.alert('Aviso', 'Selecione um rastreador primeiro.');
                return;
            }

            navigation.navigate('MapScreen', {
                trackerId: selectedTracker.id,
                autoRequestLocation: true,
            });
            return;
        }

        if (cmd.confirm) {
            Alert.alert(
                cmd.destructive ? '⚠️ Atenção' : 'Confirmar',
                cmd.confirmMessage ?? `Deseja executar "${cmd.label}"?`,
                [
                    { text: 'Não', style: 'cancel' },
                    {
                        text: 'Sim',
                        style: cmd.destructive ? 'destructive' : 'default',
                        onPress: () => executeCommand(cmd.build(), cmd.id),
                    },
                ]
            );
            return;
        }

        executeCommand(cmd.build(), cmd.id);
    }

    function handleParamSubmit(values: Record<string, string>) {
        if (!activeParamCommand) return;

        const commandString = activeParamCommand.build(values);
        setActiveParamCommand(null);
        executeCommand(commandString, activeParamCommand.id);
    }

    return (
        <View style={styles.container}>

            <TrackerDropdown
                trackers={trackers}
                selectedTracker={selectedTracker}
                onSelect={setSelectedTracker}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {response && (
                    <View style={styles.responseBox}>
                        <View style={styles.responseHeader}>
                            <MaterialIcons name="check-circle" size={16} color="rgb(110, 148, 80)" />
                            <Text style={styles.responseCommand}>Comando: {response.command}</Text>
                        </View>
                        <Text style={styles.responseText}>{response.text}</Text>
                    </View>
                )}

                <CollapsibleSection title="Status" defaultOpen>
                    <View style={styles.list}>
                        {STATUS_COMMANDS.map(cmd => (
                            <TouchableOpacity
                                key={cmd.id}
                                style={[styles.listButton, cmd.destructive && styles.buttonDestructive]}
                                onPress={() => handleStatusCommandPress(cmd)}
                                disabled={loadingCommandId !== null}
                                activeOpacity={0.85}
                            >
                                {loadingCommandId === cmd.id ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>{cmd.label}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </CollapsibleSection>

                <CollapsibleSection title="Parâmetros">
                    <View style={styles.list}>
                        {PARAM_COMMANDS.map(cmd => (
                            <TouchableOpacity
                                key={cmd.id}
                                style={styles.listButton}
                                onPress={() => setActiveParamCommand(cmd)}
                                disabled={loadingCommandId !== null}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.buttonText}>{cmd.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </CollapsibleSection>
            </ScrollView>

            {activeParamCommand && (
                <ParamCommandModal
                    visible
                    title={activeParamCommand.label}
                    fields={activeParamCommand.fields}
                    onClose={() => setActiveParamCommand(null)}
                    onSubmit={handleParamSubmit}
                />
            )}
        </View>
    );
}