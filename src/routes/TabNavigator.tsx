// src/routes/TabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import HomeScreen from '../screens/Home';
import MapScreen from '../screens/Map';
import SmsScreen from '../screens/SMS';
import History from '../screens/History';
import SettingsScreen from '../screens/Settings/index';
import { red } from 'react-native-reanimated/lib/typescript/Colors';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    const navigation = useNavigation<any>();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {/* Abre o Drawer real do React Navigation */}
                <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                    <MaterialIcons name="menu" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cavalleta Connect</Text>
            </View>

            <View style={styles.tabContainer}>
                <Tab.Navigator
                    screenOptions={{
                        headerShown: false,
                        tabBarActiveTintColor: 'rgb(163, 204, 127)',
                        tabBarInactiveTintColor: '#757575',
                        tabBarStyle: {
                            height: 60,
                            paddingBottom: 10,
                            paddingTop: 6,
                        },
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
                </Tab.Navigator>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, backgroundColor: 'white' },
    menuButton: { marginRight: 10, },
    headerTitle: { fontSize: 18, fontWeight: 'bold', },
    tabContainer: { flex: 1 }
});
