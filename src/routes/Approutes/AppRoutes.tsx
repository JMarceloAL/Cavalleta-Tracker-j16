// src/routes/AppRoutes.tsx

// Importa os Hooks do React.
import React, {
    useState,
} from 'react';

import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Responsável pela navegação.
import { NavigationContainer } from '@react-navigation/native';

// Navegação em pilha.
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ScreenTransitionOverlay from '../../components/ScreenTransitionOverlay';

// Telas.
import Login from '../../screens/Login';

import DrawerNavigator from '../DrawerNavigator/DrawerNavigator';

// Cria o Stack Navigator.
const Stack = createNativeStackNavigator();

export default function AppRoutes() {

    // Controla o overlay de transição entre telas.
    const [transitioning, setTransitioning] = useState(false);

    const { isReady } = useTheme();

    if (!isReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#56AC00" />
            </View>
        );
    }

    /*
        Chamado pelo NavigationContainer toda vez que o estado
        de navegação muda (troca de tela em qualquer nível).
    */
    function handleNavigationStateChange() {
        setTransitioning(true);
        setTimeout(() => setTransitioning(false), 300);
    }

    return (

        <NavigationContainer onStateChange={handleNavigationStateChange}>

            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    animation: 'slide_from_right',
                    animationTypeForReplace: 'push',
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

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
});