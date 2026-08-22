// Importa os Hooks do React.
import React, { useState } from 'react';

// Componentes visuais do React Native.
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

// Importa os estilos.
import { styles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

// Serviço responsável pela autenticação.
import { login } from '../../services/Auth';

// Permissões pedidas logo após o login.
import { requestSmsPermissions } from '../../services/Smsgateway';
import { requestNotificationPermissions } from '../../services/NotificationService';

export default function Login({ navigation }: any) {
    const { isDark } = useTheme();

    /*
        Armazena o usuário digitado.
    */
    const [username, setUsername] = useState('');

    /*
        Armazena a senha digitada.
    */
    const [password, setPassword] = useState('');

    /*
        Controla o estado de carregamento durante login + permissões.
    */
    const [loading, setLoading] = useState(false);

    /*
        Pede as permissões de SMS e notificação, uma de cada vez.
        Não bloqueia o acesso ao app se o usuário negar — só avisa.
    */
    async function requestAppPermissions() {
        try {
            await requestSmsPermissions();
        } catch (error) {
            console.log('⚠️ Permissão de SMS não concedida:', error);
        }

        try {
            const granted = await requestNotificationPermissions();
            if (!granted) {
                console.log('⚠️ Permissão de notificação não concedida.');
            }
        } catch (error) {
            console.log('⚠️ Erro ao pedir permissão de notificação:', error);
        }
    }

    /*
        Realiza o login.
    */
    async function handleLogin() {
        setLoading(true);

        try {
            const success = await login(username, password);

            if (!success) {
                Alert.alert('Erro', 'Usuário ou senha inválidos.');
                return;
            }

            await requestAppPermissions();

            navigation.replace('Home');
        } finally {
            setLoading(false);
        }
    }

    const containerStyle = [styles.container, isDark && styles.darkContainer];
    const titleStyle = [styles.title, isDark && styles.darkTitle];
    const subtitleStyle = [styles.subtitle, isDark && styles.darkSubtitle];
    const inputStyle = [styles.input, isDark && styles.darkInput];
    const inputContainerStyle = [styles.inputContainer, isDark && styles.darkInputContainer];
    const inputWithIconStyle = [styles.inputWithIcon, isDark && styles.darkInputText];

    return (

        <View style={containerStyle}>

            <Text style={titleStyle}>

                Cavalleta Tracker

            </Text>

            <Text style={subtitleStyle}>

                Sistema de Rastreamento J16

            </Text>

            <TextInput

                style={inputStyle}

                placeholder="Usuário"

                autoCapitalize="none"

                value={username}
                placeholderTextColor={isDark ? '#AFB9C7' : '#8E8E93'}

                onChangeText={setUsername}

                editable={!loading}

            />

            <View style={inputContainerStyle}>
                <MaterialIcons
                    name="lock-outline"
                    size={22}
                    color={isDark ? '#AFB9C7' : '#8E8E93'}
                    style={styles.inputIcon}
                />

                <TextInput
                    style={inputWithIconStyle}
                    placeholder="Senha"
                    placeholderTextColor={isDark ? '#AFB9C7' : '#8E8E93'}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                />
            </View>

            <TouchableOpacity

                style={styles.button}

                onPress={handleLogin}

                disabled={loading}

            >

                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>

                        Entrar

                    </Text>
                )}

            </TouchableOpacity>

        </View>

    );

}