// src/screens/Settings/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealTime } from '../../contexts/RealTimeContext';
import { getCredentials, saveCredentials } from '../../services/storage/authStorage';
import { requestNotificationPermissions } from '../../services/NotificationService';
import Collapsible from '../../components/Collapsible';

export default function SettingsScreen({ navigation }: any) {
    const { isDark, setTheme } = useTheme();
    const { realTimeEnabled, activeTrackerName, vigilanteEnabled, setVigilanteEnabled } = useRealTime();

    const [username, setUsername] = useState('root');
    const [password, setPassword] = useState('root');
    const [isLoading, setIsLoading] = useState(true);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        async function loadCredentials() {
            const credentials = await getCredentials();
            setUsername(credentials.username);
            setPassword(credentials.password);
            setIsLoading(false);
        }

        loadCredentials();
    }, []);

    async function handleSaveCredentials() {
        try {
            await saveCredentials(username, password);
            Alert.alert('Sucesso', 'Usuário e senha atualizados.');
            setCredentialsOpen(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar as credenciais.');
        }
    }

    function handleClearStorage() {
        Alert.alert(
            'Limpar armazenamento',
            'Isso vai apagar todos os rastreadores cadastrados, histórico e dados salvos no app. Deseja continuar?',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim',
                    style: 'destructive',
                    onPress: async () => {
                        setClearing(true);
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Concluído', 'O armazenamento do app foi limpo.');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível limpar o armazenamento.');
                        } finally {
                            setClearing(false);
                        }
                    },
                },
            ]
        );
    }

    async function handleToggleVigilante(value: boolean) {
        if (value) {
            const granted = await requestNotificationPermissions();
            if (!granted) {
                Alert.alert('Permissão necessária', 'Ative as notificações para usar o Modo Vigilante.');
                return;
            }
        }

        setVigilanteEnabled(value);
    }

    const containerStyle = [styles.container, isDark && styles.darkContainer];
    const rowStyle = [styles.row, isDark && styles.darkRow];
    const formStyle = [styles.form, isDark && styles.darkForm];
    const inputStyle = [styles.input, isDark && styles.darkInput];
    const labelStyle = [styles.label, isDark && styles.darkLabel];
    const titleStyle = [styles.title, isDark && styles.darkText];
    const helpStyle = [styles.help, isDark && styles.darkHelp];

    return (
        <SafeAreaView style={containerStyle}>
            <Text style={titleStyle}>Configurações</Text>

            <View style={rowStyle}>
                <View>
                    <Text style={labelStyle}>Tema escuro</Text>
                    <Text style={helpStyle}>Aplica o tema em toda a interface.</Text>
                </View>

                <Switch
                    value={isDark}
                    onValueChange={async (value) => {
                        await setTheme(value ? 'dark' : 'light');
                    }}
                    thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
                    trackColor={{ false: '#D1D5DB', true: 'rgb(163, 204, 127)' }}
                />
            </View>

            <View style={rowStyle}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={labelStyle}>Modo Vigilante</Text>
                    <Text style={helpStyle}>
                        {realTimeEnabled
                            ? `Notifica quando ${activeTrackerName ?? 'o rastreador'} sair do local parado.`
                            : 'Ative o Tempo Real no mapa para usar esta função.'}
                    </Text>
                </View>

                <Switch
                    value={vigilanteEnabled}
                    onValueChange={handleToggleVigilante}
                    disabled={!realTimeEnabled}
                    thumbColor={isDark ? '#F3F4F6' : '#FFFFFF'}
                    trackColor={{ false: '#D1D5DB', true: 'rgb(163, 204, 127)' }}
                />
            </View>

            {/* Dropdown: Trocar usuário e senha */}
            <View style={formStyle}>
                <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => setCredentialsOpen(prev => !prev)}
                    activeOpacity={0.8}
                >
                    <View>
                        <Text style={labelStyle}>Trocar usuário e senha</Text>
                        <Text style={helpStyle}>Essas credenciais serão usadas no login do app.</Text>
                    </View>

                    <MaterialIcons
                        name={credentialsOpen ? 'expand-less' : 'expand-more'}
                        size={24}
                        color={isDark ? '#F3F4F6' : '#222'}
                    />
                </TouchableOpacity>

                <Collapsible open={credentialsOpen}>
                    <View style={styles.dropdownContent}>
                        <TextInput
                            style={inputStyle}
                            placeholder="Usuário"
                            placeholderTextColor={isDark ? '#AFB9C7' : '#8E8E93'}
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            editable={!isLoading}
                        />

                        <TextInput
                            style={inputStyle}
                            placeholder="Senha"
                            placeholderTextColor={isDark ? '#AFB9C7' : '#8E8E93'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleSaveCredentials}>
                            <Text style={styles.buttonText}>Salvar alterações</Text>
                        </TouchableOpacity>
                    </View>
                </Collapsible>
            </View>

            {/* Limpar armazenamento */}
            <View style={formStyle}>
                <Text style={labelStyle}>Armazenamento</Text>
                <Text style={helpStyle}>
                    Remove rastreadores cadastrados, histórico e demais dados salvos no app.
                </Text>

                <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={handleClearStorage}
                    disabled={clearing}
                >
                    <Text style={styles.dangerButtonText}>
                        {clearing ? 'Limpando...' : 'Limpar armazenamento'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}