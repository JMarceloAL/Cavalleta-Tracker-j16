// src/components/MapControls/index.tsx
import React from 'react';
import { View, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { styles } from './styles';

type Props = {
    onOpenExternalMap: () => void;
    onShowLastLocation: () => void;
    onRequestSmsLocation: () => void;
    smsLoading: boolean;
    realTimeEnabled: boolean;
    onToggleRealTime: (value: boolean) => void;
    // true enquanto o app verifica no servidor se o rastreador está
    // online antes de ligar o tempo real de fato (GET /api/tracker/:imei)
    checkingRealTime?: boolean;
};

export default function MapControls({
    onOpenExternalMap,
    onShowLastLocation,
    onRequestSmsLocation,
    smsLoading,
    realTimeEnabled,
    onToggleRealTime,
    checkingRealTime = false,
}: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.switchWrapper}>

                <Ionicons
                    name="radio-outline"
                    size={25}
                    color={realTimeEnabled ? 'rgb(163, 204, 127)' : '#999'}
                    style={styles.signalIcon}
                />

                <Switch
                    style={styles.switch}
                    value={realTimeEnabled}
                    onValueChange={onToggleRealTime}
                    disabled={checkingRealTime}
                />
            </View>

            <TouchableOpacity style={styles.his} onPress={onShowLastLocation} activeOpacity={0.8}>
                <Octicons name="history" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.sms}
                onPress={onRequestSmsLocation}
                activeOpacity={0.8}
                disabled={smsLoading}
            >
                {smsLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <FontAwesome name="map-marker" size={24} color="white" />
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.fab} onPress={onOpenExternalMap} activeOpacity={0.8}>
                <Ionicons
                    name="paper-plane"
                    size={24}
                    color="white"
                    style={{ marginRight: 2, marginTop: 3 }}
                />
            </TouchableOpacity>
        </View>
    );
}