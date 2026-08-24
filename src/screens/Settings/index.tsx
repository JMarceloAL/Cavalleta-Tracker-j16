import React, {
    useEffect,
    useState,
} from 'react';

import {
    View,
    Text,
    Switch,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';

import {
    SafeAreaView,
} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    MaterialIcons,
} from '@expo/vector-icons';

import { styles } from './styles';

import {
    useTheme,
} from '../../contexts/ThemeContext';

import {
    useRealTime,
} from '../../contexts/RealTimeContext';

import {
    getCredentials,
    saveCredentials,
} from '../../services/storage/authStorage';

import {
    requestNotificationPermissions,
} from '../../services/NotificationService';

import Collapsible from '../../components/Collapsible';

export default function SettingsScreen({
    navigation,
}: any) {
    const {
        isDark,
        setTheme,
    } = useTheme();

    const {
        realTimeEnabled,
        activeTrackerName,
        vigilanteEnabled,
        setVigilanteEnabled,
    } = useRealTime();

    const [
        username,
        setUsername,
    ] = useState('root');

    const [
        password,
        setPassword,
    ] = useState('root');

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        credentialsOpen,
        setCredentialsOpen,
    ] = useState(false);

    const [
        clearing,
        setClearing,
    ] = useState(false);

    /**
     * ========================================================
     * CREDENCIAIS
     * ========================================================
     */
    useEffect(() => {
        async function loadCredentials() {
            try {
                const credentials =
                    await getCredentials();

                setUsername(
                    credentials.username
                );

                setPassword(
                    credentials.password
                );
            } catch (error) {
                console.warn(
                    'Erro ao carregar credenciais:',
                    error
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadCredentials();
    }, []);

    /**
     * ========================================================
     * SALVAR CREDENCIAIS
     * ========================================================
     */
    async function handleSaveCredentials() {
        try {
            await saveCredentials(
                username,
                password
            );

            Alert.alert(
                'Sucesso',
                'Usuário e senha atualizados.'
            );

            setCredentialsOpen(false);
        } catch (error) {
            Alert.alert(
                'Erro',
                'Não foi possível salvar as credenciais.'
            );
        }
    }

    /**
     * ========================================================
     * LIMPAR STORAGE
     * ========================================================
     */
    function handleClearStorage() {
        Alert.alert(
            'Limpar armazenamento',
            'Isso vai apagar todos os rastreadores cadastrados, histórico e dados salvos no app. Deseja continuar?',
            [
                {
                    text: 'Não',
                    style: 'cancel',
                },
                {
                    text: 'Sim',
                    style: 'destructive',
                    onPress: async () => {
                        setClearing(true);

                        try {
                            await AsyncStorage.clear();

                            Alert.alert(
                                'Concluído',
                                'O armazenamento do app foi limpo.'
                            );
                        } catch (error) {
                            Alert.alert(
                                'Erro',
                                'Não foi possível limpar o armazenamento.'
                            );
                        } finally {
                            setClearing(false);
                        }
                    },
                },
            ]
        );
    }

    /**
     * ========================================================
     * MODO VIGILANTE
     * ========================================================
     */
    async function handleToggleVigilante(
        value: boolean
    ) {
        /**
         * Não permite ativar o Vigilante
         * sem Tempo Real.
         */
        if (
            value &&
            !realTimeEnabled
        ) {
            Alert.alert(
                'Tempo Real necessário',
                'Ative o Tempo Real no mapa antes de ativar o Modo Vigilante.'
            );

            return;
        }

        /**
         * Solicita permissão de notificações
         * somente ao ativar.
         */
        if (value) {
            const granted =
                await requestNotificationPermissions();

            if (!granted) {
                Alert.alert(
                    'Permissão necessária',
                    'Ative as notificações para usar o Modo Vigilante.'
                );

                return;
            }
        }

        setVigilanteEnabled(value);
    }

    /**
     * ========================================================
     * ESTILOS DINÂMICOS
     * ========================================================
     */
    const containerStyle = [
        styles.container,
        isDark &&
        styles.darkContainer,
    ];

    const rowStyle = [
        styles.row,
        isDark &&
        styles.darkRow,
    ];

    const formStyle = [
        styles.form,
        isDark &&
        styles.darkForm,
    ];

    const inputStyle = [
        styles.input,
        isDark &&
        styles.darkInput,
    ];

    const labelStyle = [
        styles.label,
        isDark &&
        styles.darkLabel,
    ];

    const titleStyle = [
        styles.title,
        isDark &&
        styles.darkText,
    ];

    const helpStyle = [
        styles.help,
        isDark &&
        styles.darkHelp,
    ];

    /**
     * ========================================================
     * UI
     * ========================================================
     */
    return (
        <SafeAreaView
            style={containerStyle}
        >
            <Text
                style={titleStyle}
            >
                Configurações
            </Text>

            {/* =================================================
                TEMA
            ================================================= */}
            <View style={rowStyle}>
                <View>
                    <Text
                        style={labelStyle}
                    >
                        Tema escuro
                    </Text>

                    <Text
                        style={helpStyle}
                    >
                        Aplica o tema em toda a interface.
                    </Text>
                </View>

                <Switch
                    value={isDark}
                    onValueChange={async (
                        value
                    ) => {
                        await setTheme(
                            value
                                ? 'dark'
                                : 'light'
                        );
                    }}
                    thumbColor={
                        isDark
                            ? '#F3F4F6'
                            : '#FFFFFF'
                    }
                    trackColor={{
                        false: '#D1D5DB',
                        true: 'rgb(163, 204, 127)',
                    }}
                />
            </View>

            {/* =================================================
                MODO VIGILANTE
            ================================================= */}
            <View style={rowStyle}>
                <View
                    style={{
                        flex: 1,
                        marginRight: 12,
                    }}
                >
                    <Text
                        style={labelStyle}
                    >
                        Modo Vigilante
                    </Text>

                    <Text
                        style={helpStyle}
                    >
                        {realTimeEnabled
                            ? `Monitora ${activeTrackerName ??
                            'o rastreador'
                            } em busca de alarmes e movimento.`
                            : 'Ative o Tempo Real no mapa para usar esta função.'}
                    </Text>
                </View>

                <Switch
                    value={
                        vigilanteEnabled
                    }
                    onValueChange={
                        handleToggleVigilante
                    }
                    disabled={
                        !realTimeEnabled
                    }
                    thumbColor={
                        isDark
                            ? '#F3F4F6'
                            : '#FFFFFF'
                    }
                    trackColor={{
                        false: '#D1D5DB',
                        true: 'rgb(163, 204, 127)',
                    }}
                />
            </View>

            {/* =================================================
                CREDENCIAIS
            ================================================= */}
            <View style={formStyle}>
                <TouchableOpacity
                    style={
                        styles.dropdownHeader
                    }
                    onPress={() =>
                        setCredentialsOpen(
                            prev => !prev
                        )
                    }
                    activeOpacity={0.8}
                >
                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <Text
                            style={labelStyle}
                        >
                            Trocar usuário e senha
                        </Text>

                        <Text
                            style={helpStyle}
                        >
                            Essas credenciais serão usadas no login do app.
                        </Text>
                    </View>

                    <MaterialIcons
                        name={
                            credentialsOpen
                                ? 'expand-less'
                                : 'expand-more'
                        }
                        size={24}
                        color={
                            isDark
                                ? '#F3F4F6'
                                : '#222'
                        }
                    />
                </TouchableOpacity>

                <Collapsible
                    open={
                        credentialsOpen
                    }
                >
                    <View
                        style={
                            styles.dropdownContent
                        }
                    >
                        <TextInput
                            style={inputStyle}
                            placeholder="Usuário"
                            placeholderTextColor={
                                isDark
                                    ? '#AFB9C7'
                                    : '#8E8E93'
                            }
                            value={username}
                            onChangeText={
                                setUsername
                            }
                            autoCapitalize="none"
                            editable={
                                !isLoading
                            }
                        />

                        <TextInput
                            style={inputStyle}
                            placeholder="Senha"
                            placeholderTextColor={
                                isDark
                                    ? '#AFB9C7'
                                    : '#8E8E93'
                            }
                            value={password}
                            onChangeText={
                                setPassword
                            }
                            secureTextEntry
                            editable={
                                !isLoading
                            }
                        />

                        <TouchableOpacity
                            style={
                                styles.button
                            }
                            onPress={
                                handleSaveCredentials
                            }
                        >
                            <Text
                                style={
                                    styles.buttonText
                                }
                            >
                                Salvar alterações
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Collapsible>
            </View>

            {/* =================================================
                STORAGE
            ================================================= */}
            <View style={formStyle}>
                <Text
                    style={labelStyle}
                >
                    Armazenamento
                </Text>

                <Text
                    style={helpStyle}
                >
                    Remove rastreadores cadastrados, histórico e demais dados salvos no app.
                </Text>

                <TouchableOpacity
                    style={
                        styles.dangerButton
                    }
                    onPress={
                        handleClearStorage
                    }
                    disabled={
                        clearing
                    }
                >
                    <Text
                        style={
                            styles.dangerButtonText
                        }
                    >
                        {clearing
                            ? 'Limpando...'
                            : 'Limpar armazenamento'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}