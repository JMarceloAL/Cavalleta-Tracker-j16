// src/routes/AppRoutes.tsx

// Importa os Hooks do React.
import React, {
    useState,
} from 'react';

import { View, StyleSheet } from 'react-native';

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