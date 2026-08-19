// Importa os Hooks do React.
import React, { useState } from 'react';

// Componentes visuais do React Native.
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';

// Importa os estilos.
import { styles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';

// Serviço responsável pela autenticação.
import { login } from '../../services/Auth';

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
        Realiza o login.
    */
    async function handleLogin() {

        const success = await login(

            username,

            password

        );

        if (success) {

            navigation.replace('Home');

            return;

        }

        Alert.alert(

            'Erro',

            'Usuário ou senha inválidos.'

        );

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

                Cavalleta Connect

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
                />
            </View>

            <TouchableOpacity

                style={styles.button}

                onPress={handleLogin}

            >

                <Text style={styles.buttonText}>

                    Entrar

                </Text>

            </TouchableOpacity>

        </View>

    );

}