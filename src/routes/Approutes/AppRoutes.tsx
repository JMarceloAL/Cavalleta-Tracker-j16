// src/routes/AppRoutes.tsx

// Importa os Hooks do React.
import React, {
    useEffect,
    useState,
    useRef,
} from 'react';

import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { styles } from './styles';
// Responsável pela navegação.
import { NavigationContainer } from '@react-navigation/native';

// Navegação em pilha.
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenTransitionOverlay from '../../components/ScreenTransitionOverlay';

// Telas.
import Login from '../../screens/Login';

import DrawerNavigator from '../DrawerNavigator';

// Serviço responsável por verificar se existe uma sessão salva.
import { getSession } from '../../services/storage/authStorage';

// Cria o Stack Navigator.
const Stack = createNativeStackNavigator();

export default function AppRoutes() {

    // Controla se o aplicativo ainda está carregando.
    const [loading, setLoading] = useState(true);

    // Define qual tela será aberta primeiro.
    const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');

    // Controla o overlay de transição entre telas.
    const [transitioning, setTransitioning] = useState(false);
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /*
        Executa apenas uma vez quando o aplicativo inicia.

        Verifica se existe uma sessão salva.
    */
    useEffect(() => {

        async function loadSession() {

            const logged = await getSession();

            if (logged) {

                setInitialRoute('Home');

            }

            setLoading(false);

        }

        loadSession();

    }, []);

    /*
        Chamado pelo NavigationContainer toda vez que o estado
        de navegação muda (troca de tela em qualquer nível).
    */
    function handleNavigationStateChange() {
        setTransitioning(true);

        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }

        transitionTimeoutRef.current = setTimeout(() => {
            setTransitioning(false);
        }, 300);
    }

    /*
        Enquanto verifica a sessão,
        exibe um indicador de carregamento em vez de tela em branco.
    */
    if (loading) {

        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="rgb(163, 204, 127)" />
            </View>
        );

    }

    return (

        <NavigationContainer onStateChange={handleNavigationStateChange}>

            <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                    headerShown: false,
                }}
            >

                <Stack.Screen
                    name="Login"
                    component={Login}
                />

                <Stack.Screen
                    name="Home"
                    component={DrawerNavigator}
                />

            </Stack.Navigator>

            <ScreenTransitionOverlay visible={transitioning} />

        </NavigationContainer>

    );

}

