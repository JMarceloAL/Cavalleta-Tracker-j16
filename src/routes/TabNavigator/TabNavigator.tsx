// src/routes/TabNavigator.tsx
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import HomeScreen from '../../screens/Home';
import MapScreen from '../../screens/Map';
import SmsScreen from '../../screens/SMS';
import History from '../../screens/History';
import { useTheme } from '../../contexts/ThemeContext';
import { APP_GREEN } from '../../theme/colors';

const Tab = createMaterialTopTabNavigator();

export default function BottomTabs() {
    const navigation = useNavigation<any>();
    const { isDark, colors } = useTheme();

    const headerStyle = [styles.header, isDark && styles.darkHeader];
    const titleStyle = [styles.headerTitle, isDark && styles.darkHeaderTitle];
    const menuColor = isDark ? '#F3F4F6' : '#000';
    const tabBarStyle = {
        height: 60,
        paddingBottom: 10,
        paddingTop: 6,
        backgroundColor: colors.background,
        borderTopColor: isDark ? '#2E3B4D' : '#E5E7EB',
    };

    return (
        <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
            <View style={headerStyle}>
                {/* Abre o Drawer real do React Navigation */}
                <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
                    <MaterialIcons name="menu" size={28} color={menuColor} />
                </TouchableOpacity>
                <Text style={titleStyle}>
                    <Text style={{ color: colors.primary }}>CAVA</Text>
                    {' '}
                    <Text style={titleStyle}>Tracker</Text>
                </Text>
            </View>

            <View style={styles.tabContainer}>
                <Tab.Navigator
                    tabBarPosition="bottom"
                    screenOptions={{
                        swipeEnabled: true,
                        animationEnabled: true,
                        tabBarActiveTintColor: colors.primary,
                        tabBarInactiveTintColor: isDark ? '#AFB9C7' : '#757575',
                        tabBarStyle,
                        tabBarIndicatorStyle: {
                            backgroundColor: colors.primary,
                            height: 3,
                        },
                        tabBarShowLabel: true,
                        tabBarLabelStyle: {
                            fontSize: 11,
                            fontWeight: '600',
                            textTransform: 'none',
                        },
                    }}
                >
                    <Tab.Screen
                        name="HomeScreen"
                        component={HomeScreen}
                        options={{
                            title: 'Início',
                            tabBarIcon: ({ color, focused }) => (
                                <MaterialIcons name="home" color={color} size={focused ? 24 : 22} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="MapScreen"
                        component={MapScreen}
                        options={{
                            title: 'Mapa',
                            swipeEnabled: false,
                            tabBarIcon: ({ color, focused }) => (
                                <MaterialIcons name="map" color={color} size={focused ? 24 : 22} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="SmsScreen"
                        component={SmsScreen}
                        options={{
                            title: 'SMS',
                            tabBarIcon: ({ color, focused }) => (
                                <MaterialIcons name="sms" color={color} size={focused ? 24 : 22} />
                            ),
                        }}
                    />

                    <Tab.Screen
                        name="HistoryScreen"
                        component={History}
                        options={{
                            title: 'Histórico',
                            tabBarIcon: ({ color, focused }) => (
                                <MaterialIcons name="history" color={color} size={focused ? 24 : 22} />
                            ),
                        }}
                    />
                </Tab.Navigator>
            </View>
        </SafeAreaView>
    );
}