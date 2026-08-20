// src/routes/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import HomeScreen from '../../screens/Home';
import MapScreen from '../../screens/Map';
import SmsScreen from '../../screens/SMS';
import History from '../../screens/History';
import SettingsScreen from '../../screens/Settings/index';
import InfoScreen from '../../screens/Info';
import { useTheme } from '../../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

// Substitui o botão padrão da tab bar (que no Android usa o efeito de
// ripple/ondulação nativo) por um Pressable simples: só um leve fade de
// opacidade ao tocar, sem ripple, sem highlight de cor.
function TabBarButton(props: any) {
    return (
        <Pressable
            {...props}
            android_ripple={null}
            style={({ pressed }) => [
                props.style,
                { opacity: pressed ? 0.5 : 1 },
            ]}
        />
    );
}

export default function BottomTabs() {
    const navigation = useNavigation<any>();
    const { isDark } = useTheme();

    const headerStyle = [styles.header, isDark && styles.darkHeader];
    const titleStyle = [styles.headerTitle, isDark && styles.darkHeaderTitle];
    const menuColor = isDark ? '#F3F4F6' : '#000';
    const tabBarStyle = {
        height: 60,
        paddingBottom: 10,
        paddingTop: 6,
        backgroundColor: isDark ? '#121821' : '#FFFFFF',
        borderTopColor: isDark ? '#2E3B4D' : '#E5E7EB',
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
            <View style={headerStyle}>
                {/* Abre o Drawer real do React Navigation */}
                <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                    <MaterialIcons name="menu" size={28} color={menuColor} />
                </TouchableOpacity>
                <Text style={titleStyle}>Cavalleta Connect</Text>
            </View>

            <View style={styles.tabContainer}>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarActiveTintColor: 'rgb(163, 204, 127)',
                        tabBarInactiveTintColor: isDark ? '#AFB9C7' : '#757575',
                        tabBarStyle,
                        tabBarButton: (props) => <TabBarButton {...props} />,
                    }}
                >
                    <Tab.Screen
                        name="HomeScreen"
                        component={HomeScreen}
                        options={{
                            title: 'Início',
                            tabBarIcon: ({ color, size }) => (
                                <MaterialIcons name="home" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="MapScreen"
                        component={MapScreen}
                        options={{
                            title: "Mapa",
                            tabBarIcon: ({ color, size }) => (
                                <MaterialIcons name="map" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="SmsScreen"
                        component={SmsScreen}
                        options={{
                            title: "SMS",
                            tabBarIcon: ({ color, size }) => (
                                <MaterialIcons name="sms" color={color} size={size} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="HistoryScreen"
                        component={History}
                        options={{
                            title: "Histórico",
                            tabBarIcon: ({ color, size }) => (
                                <MaterialIcons name="history" color={color} size={size} />
                            ),
                        }}
                    />

                    {/* TELA CONFIGURAÇÕES: Oculta visualmente e sem ocupar espaço */}
                    <Tab.Screen
                        name="SettingsScreen"
                        component={SettingsScreen}
                        options={{
                            tabBarButton: () => null,
                            tabBarItemStyle: { position: 'absolute', display: 'none' },
                        }}
                    />

                    {/* TELA INFO: Oculta visualmente e sem ocupar espaço, acessada pelo Drawer */}
                    <Tab.Screen
                        name="InfoScreen"
                        component={InfoScreen}
                        options={{
                            tabBarButton: () => null,
                            tabBarItemStyle: { position: 'absolute', display: 'none' },
                        }}
                    />
                </Tab.Navigator>
            </View>
        </SafeAreaView>
    );
}