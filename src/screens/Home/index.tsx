import React, { useEffect, useState } from 'react';

import {
    Alert,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { TrackerService } from '../../services/Trackerservice';

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TrackerCard from '../../components/Card/TrackerCard';
import AddTrackerModal from '../../components/Modal/AddTrackerModal/AddTrackerModal';
import EmptyList from '../../components/List/EmptyList';

import { styles } from './styles';
import type { Tracker } from '../../types/Tracker';
import { useTrackerServiceProvider } from '../../contexts/TrackerServiceContext';
import { useTheme } from '../../contexts/ThemeContext';
import { requestSmsPermissions } from '../../services/Smsgateway';
import { detectImeiInBackground } from '../../services/ImeiDetection';

interface Props {
    navigation: any;
}

const STORAGE_KEY = '@cavalleta:trackers';

export default function Home({ navigation }: Props) {
    const { isDark } = useTheme();
    const [trackers, setTrackers] = useState<Tracker[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);

    const { getService } = useTrackerServiceProvider();

    useEffect(() => {
        loadTrackers();
    }, []);

    async function loadTrackers() {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);

            if (stored) {
                setTrackers(JSON.parse(stored));
            }
        } catch (error) {
            console.warn('Erro ao carregar rastreadores', error);
        }
    }

    async function saveTrackers(nextTrackers: Tracker[]) {
        try {
            setTrackers(nextTrackers);
            await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(nextTrackers)
            );
        } catch (error) {
            console.warn('Erro ao salvar rastreadores', error);
        }
    }

    /**
     * Atualiza o IMEI de um rastreador específico no AsyncStorage,
     * sem depender do estado local (evita closures desatualizadas
     * já que isso roda de forma assíncrona, minutos depois do cadastro).
     */
    async function updateTrackerImei(trackerId: string, imei: string) {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const list: Tracker[] = stored ? JSON.parse(stored) : [];

            const nextList = list.map(t =>
                t.id === trackerId ? { ...t, imei } : t
            );

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
            setTrackers(nextList);
        } catch (error) {
            console.warn('Erro ao vincular IMEI', error);
        }
    }

    async function handleAddTracker(name: string, phone: string) {
        try {
            await requestSmsPermissions();

            const service = new TrackerService(phone, { timeoutMs: 60000 });
            const imei = await detectImeiInBackground(service, (detectedImei) => {
                // A lista só é atualizada quando o IMEI for confirmado.
                // A persistência final acontece abaixo, após a validação.
                console.log('🔗 IMEI confirmado para cadastro:', detectedImei);
            }, 60000);

            service.destroy();

            if (!imei) {
                Alert.alert(
                    'Não foi possível conectar ao rastreador',
                    'Não recebemos o retorno do comando PARAM# em 1 minuto. Verifique o número do chip e tente novamente.'
                );
                return;
            }

            const newTracker: Tracker = {
                id: String(Date.now()),
                name,
                phone,
                imei,
            };

            await saveTrackers([newTracker, ...trackers]);
        } catch (error: any) {
            console.log('⚠️ Permissão de SMS negada, IMEI não será detectado:', error.message);
            Alert.alert(
                'Não foi possível conectar ao rastreador',
                'Não foi possível obter o IMEI do rastreador. Verifique o número do chip e tente novamente.'
            );
        }
    }

    async function handleEditTracker(id: string, name: string, phone: string) {
        const nextTrackers = trackers.map(tracker =>
            tracker.id === id ? { ...tracker, name, phone } : tracker
        );

        await saveTrackers(nextTrackers);
    }

    function openAddModal() {
        setEditingTracker(null);
        setModalVisible(true);
    }

    function openEditModal(tracker: Tracker) {
        setEditingTracker(tracker);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setEditingTracker(null);
    }

    async function handleSaveTracker(name: string, phone: string) {
        if (editingTracker) {
            await handleEditTracker(editingTracker.id, name, phone);
        } else {
            await handleAddTracker(name, phone);
        }

        closeModal();
    }

    async function handleDeleteTracker(id: string) {
        Alert.alert(
            'Remover rastreador',
            'Deseja remover este rastreador?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sim',
                    onPress: async () => {
                        const nextTrackers = trackers.filter(
                            tracker => tracker.id !== id
                        );
                        await saveTrackers(nextTrackers);
                    },
                },
            ]
        );
    }

    function handleLocateTracker(id: string) {
        const tracker = trackers.find(item => item.id === id);

        if (!tracker) {
            return;
        }

        Alert.alert(
            'Localizar rastreador',
            `Ainda não há localização ativa para ${tracker.name}.`
        );
    }

    const containerStyle = [styles.container, isDark && styles.darkContainer];
    const titleStyle = [styles.title, isDark && styles.darkTitle];
    const subtitleStyle = [styles.subtitle, isDark && styles.darkSubtitle];

    return (
        <View style={containerStyle}>
            <View style={[styles.header, isDark && styles.darkHeader]}>
                <View style={styles.headerTextGroup}>
                    <Text style={titleStyle}>Meus Rastreadores</Text>
                    <Text style={subtitleStyle}>
                        {trackers.length === 0
                            ? 'Nenhum cadastrado'
                            : `${trackers.length} ${trackers.length === 1 ? 'cadastrado' : 'cadastrados'}`}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={openAddModal}
                    activeOpacity={0.85}
                >
                    <MaterialIcons name="add" size={18} color="#FFF" />
                    <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={trackers}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    trackers.length === 0 && styles.emptyListContainer,
                ]}
                ListEmptyComponent={<EmptyList onAdd={openAddModal} />}
                renderItem={({ item }) => (
                    <TrackerCard
                        tracker={item}
                        onDelete={handleDeleteTracker}
                        onLocate={handleLocateTracker}
                        onEdit={openEditModal}
                    />
                )}
            />

            <AddTrackerModal
                visible={modalVisible}
                onClose={closeModal}
                onAdd={handleSaveTracker}
                initialName={editingTracker?.name ?? ''}
                initialPhone={editingTracker?.phone ?? ''}
                title={editingTracker ? 'Editar Rastreador' : 'Novo Rastreador'}
                submitLabel={editingTracker ? 'Salvar' : 'Adicionar'}
                allowPhoneEdit={!editingTracker}
            />
        </View>
    );
}