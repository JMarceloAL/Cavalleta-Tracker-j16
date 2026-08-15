import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';

export default function SettingsScreen({ navigation }: any) {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Configurações</Text>
        </SafeAreaView>
    );
}

